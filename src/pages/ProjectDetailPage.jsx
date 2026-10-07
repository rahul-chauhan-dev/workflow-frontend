import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../api/projectApi";
import {
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../api/taskApi";
import { useProjects } from "../context/ProjectsContext";
import { useTasks } from "../hooks/useTasks";
import { useDebounce } from "../hooks/useDebounce";
import TaskForm from "../components/TaskForm";
import TaskToolbar from "../components/TaskToolbar";
import TaskBoard from "../components/TaskBoard";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import CommentsPanel from "../components/CommentsPanel";
import Spinner from "../components/Spinner";
import { usePageTitle } from "../hooks/usePageTitle";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];
const PAGE_SIZE = 5;
const BOARD_LIMIT = 100;
const INITIAL_FILTERS = {
  status: "",
  priority: "",
  q: "",
  sort: "id,desc",
  page: 0,
};

function ProjectDetailPage() {
  usePageTitle("Project ? . name"); // Placeholder title until we load the project
  const { id } = useParams();
  const projectId = Number(id);
  const { applyTaskChange } = useProjects();

  const [project, setProject] = useState(null);
  const [projectError, setProjectError] = useState(null);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [view, setView] = useState("list");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [openCommentsId, setOpenCommentsId] = useState(null);

  const isBoard = view === "board";

  // The board ignores the status filter and paging: it loads one big page, grouped into columns
  const params = isBoard
    ? { ...filters, status: "", sort: "id,asc", page: 0, size: BOARD_LIMIT }
    : { ...filters, size: PAGE_SIZE };

  const {
    data,
    setData,
    loading,
    error: tasksError,
    reload,
  } = useTasks(projectId, params);
  const tasks = data?.items ?? [];
  const editingTask = tasks.find((t) => t.id === editingId) ?? null;

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch((err) => setProjectError(err.message));
  }, [id]);

  // Copy the debounced search text into the filters (and go back to page 0)
  useEffect(() => {
    setFilters((f) =>
      f.q === debouncedSearch ? f : { ...f, q: debouncedSearch, page: 0 },
    );
    setEditingId(null);
  }, [debouncedSearch]);

  // If the current page became empty (for example the last item was deleted), step back
  useEffect(() => {
    if (!isBoard && data && data.items.length === 0 && data.page > 0) {
      setFilters((f) => ({ ...f, page: Math.max(0, data.totalPages - 1) }));
    }
  }, [data, isBoard]);

  function changeFilter(name, value) {
    setFilters((f) => ({ ...f, [name]: value, page: 0 }));
    setEditingId(null);
  }

  function changePage(page) {
    setFilters((f) => ({ ...f, page }));
    setEditingId(null);
  }

  function changeView(next) {
    if (next === view) return;
    setData(null); // list data and board data are different shapes, so don't show one as the other
    setView(next);
    setEditingId(null);
  }

  function clearFilters() {
    setSearchText("");
    setFilters(INITIAL_FILTERS);
    setEditingId(null);
  }

  // Called by CommentsPanel after a comment is added (+1) or deleted (-1)
  function adjustCommentCount(taskId, delta) {
    setData((d) =>
      d
        ? {
            ...d,
            items: d.items.map((t) =>
              t.id === taskId
                ? { ...t, commentCount: Math.max(0, t.commentCount + delta) }
                : t,
            ),
          }
        : d,
    );
  }

  async function handleSubmit(formData) {
    if (editingTask) {
      // PUT replaces the whole task; the form has no status field, so carry it over
      await updateTask(editingTask.id, {
        ...formData,
        status: editingTask.status,
      });
      setEditingId(null);
    } else {
      const saved = await createTask(projectId, formData);
      applyTaskChange(projectId, null, saved.status);
    }
    reload();
    setError(null);
  }

  // List view: ask the server, then refetch (the task may leave a filtered list)
  async function handleStatusChange(task, newStatus) {
    setUpdatingId(task.id);
    try {
      await updateTaskStatus(task.id, newStatus);
      applyTaskChange(projectId, task.status, newStatus);
      reload();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  // Board view: optimistic. Update the UI first, roll back if the server refuses
  async function handleMove(task, newStatus) {
    const snapshot = data;
    setData((d) => ({
      ...d,
      items: d.items.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t,
      ),
    }));
    try {
      await updateTaskStatus(task.id, newStatus);
      applyTaskChange(projectId, task.status, newStatus);
      setError(null);
    } catch (err) {
      setData(snapshot);
      setError(err.message);
    }
  }

  async function confirmDelete() {
    const task = pendingDelete;
    try {
      await deleteTask(task.id);
      applyTaskChange(projectId, task.status, null);
      if (editingId === task.id) setEditingId(null);
      if (openCommentsId === task.id) setOpenCommentsId(null);
      reload();
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingDelete(null);
    }
  }

  if (projectError) {
    return (
      <div>
        <Link to="/">← Back to projects</Link>
        <h1>Couldn't open this project</h1>
        <p className="error">{projectError}</p>
      </div>
    );
  }
  if (!project) return <Spinner />;

  const shownError = error || tasksError;
  const initialLoading = data === null && !tasksError;
  const hasFilters = Boolean(
    filters.q || filters.priority || (!isBoard && filters.status),
  );

  return (
    <div>
      <Link to="/">← Back to projects</Link>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <TaskForm
        key={editingTask ? editingTask.id : "new"}
        initialTask={editingTask}
        onSubmit={handleSubmit}
        onCancel={() => setEditingId(null)}
      />

      <TaskToolbar
        filters={filters}
        searchText={searchText}
        view={view}
        hasFilters={hasFilters}
        onSearchChange={setSearchText}
        onFilterChange={changeFilter}
        onViewChange={changeView}
        onClear={clearFilters}
      />

      {shownError && <p className="error">Error: {shownError}</p>}
      {initialLoading && <p>Loading...</p>}

      {data !== null && (
        <div className={loading ? "is-loading" : undefined}>
          {isBoard ? (
            <>
              {data.totalItems > data.items.length && (
                <p className="task-meta">
                  Showing the first {data.items.length} of {data.totalItems}{" "}
                  tasks. Use the filters to narrow down.
                </p>
              )}
              <TaskBoard
                tasks={tasks}
                onMove={handleMove}
                onEdit={setEditingId}
                onDelete={setPendingDelete}
              />
            </>
          ) : (
            <>
              {tasks.length === 0 ? (
                <p className="empty">
                  {hasFilters
                    ? "No tasks match these filters."
                    : "No tasks yet."}
                </p>
              ) : (
                <ul className="card-list">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className={
                        t.id === editingId ? "card card-editing" : "card"
                      }
                    >
                      <span className="card-title">{t.title}</span>
                      <div className="task-meta">
                        <span
                          className={`chip chip-${t.priority.toLowerCase()}`}
                        >
                          {t.priority}
                        </span>
                        <span className={`chip chip-${t.status.toLowerCase()}`}>
                          {t.status.replace("_", " ")}
                        </span>
                        {t.dueDate && <span>Due {t.dueDate}</span>}
                      </div>
                      {t.description && (
                        <p className="card-text">{t.description}</p>
                      )}
                      <div className="card-actions">
                        <select
                          className="select"
                          value={t.status}
                          disabled={updatingId === t.id}
                          onChange={(e) =>
                            handleStatusChange(t, e.target.value)
                          }
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn"
                          onClick={() => setEditingId(t.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn"
                          aria-expanded={openCommentsId === t.id}
                          onClick={() =>
                            setOpenCommentsId(
                              openCommentsId === t.id ? null : t.id,
                            )
                          }
                        >
                          Comments ({t.commentCount})
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => setPendingDelete(t)}
                        >
                          Delete
                        </button>
                      </div>

                      {openCommentsId === t.id && (
                        <CommentsPanel
                          taskId={t.id}
                          onCountChange={(delta) =>
                            adjustCommentCount(t.id, delta)
                          }
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                totalItems={data.totalItems}
                onPageChange={changePage}
              />
            </>
          )}
        </div>
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete task?"
          message={`"${pendingDelete.title}" and its comments will be permanently deleted.`}
          confirmLabel="Delete"
          busyLabel="Deleting..."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export default ProjectDetailPage;
