import { useState } from "react";

const COLUMNS = [
  { status: "TODO", title: "To do" },
  { status: "IN_PROGRESS", title: "In progress" },
  { status: "DONE", title: "Done" },
];

function TaskBoard({ tasks, onMove, onEdit, onDelete }) {
  const [overColumn, setOverColumn] = useState(null);

  function handleDrop(e, status) {
    e.preventDefault();
    setOverColumn(null);
    const taskId = Number(e.dataTransfer.getData("text/plain"));
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== status) onMove(task, status);
  }

  return (
    <div className="board">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className={
              overColumn === col.status ? "column column-over" : "column"
            }
            onDragOver={(e) => {
              e.preventDefault(); // required, or the browser rejects the drop
              setOverColumn(col.status);
            }}
            onDragLeave={(e) => {
              // ignore "leave" events caused by moving over a child element
              if (!e.currentTarget.contains(e.relatedTarget))
                setOverColumn(null);
            }}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <h3 className="column-title">
              {col.title} <span className="badge">{columnTasks.length}</span>
            </h3>

            {columnTasks.map((t) => (
              <div
                key={t.id}
                className="board-card"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(t.id));
                  e.dataTransfer.effectAllowed = "move";
                }}
              >
                <div className="board-card-title">{t.title}</div>
                <div className="task-meta">
                  <span className={`chip chip-${t.priority.toLowerCase()}`}>
                    {t.priority}
                  </span>
                  {t.dueDate && <span>Due {t.dueDate}</span>}
                  {t.commentCount > 0 && <span> • 💬 {t.commentCount}</span>}
                </div>

                {/* keyboard and touch fallback for drag and drop */}
                <select
                  className="select select-sm"
                  value={t.status}
                  onChange={(e) => onMove(t, e.target.value)}
                  aria-label={`Move "${t.title}" to another column`}
                >
                  {COLUMNS.map((c) => (
                    <option key={c.status} value={c.status}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <div className="card-actions">
                  <button className="btn btn-sm" onClick={() => onEdit(t.id)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(t)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {columnTasks.length === 0 && (
              <p className="task-meta">Drop tasks here</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TaskBoard;
