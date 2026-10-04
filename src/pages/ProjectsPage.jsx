import { useState } from "react";
import { useProjects } from "../context/ProjectsContext";
import { useAuth } from "../context/AuthContext";                 // NEW
import { usePageTitle } from "../hooks/usePageTitle";             // NEW
import ProjectForm from "../components/ProjectForm";
import ProjectList from "../components/ProjectList";
import ConfirmModal from "../components/ConfirmModal";
import Spinner from "../components/Spinner";                      // NEW (use <p>Loading...</p> if you skipped it)

function ProjectsPage() {
  const { user } = useAuth();                                     // NEW
  usePageTitle("Projects");                                       // NEW

  const { projects, loading, loadError, addProject, editProject, removeProject } =
    useProjects();

  const [error, setError] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function handleSubmit(data) {
    // Errors are not caught here: they bubble up to the form, which shows them
    if (editingProject) {
      await editProject(editingProject.id, data);
      setEditingProject(null);
    } else {
      await addProject(data);
    }
    setError(null);
  }

  async function confirmDelete() {
    try {
      await removeProject(pendingDelete.id);
      if (editingProject?.id === pendingDelete.id) setEditingProject(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingDelete(null);
    }
  }

  const shownError = error || loadError;

  return (
    <div>
      {/* NEW: replaces <h1>Projects</h1> */}
      <h1>Hi, {user.name.split(" ")[0]}👋</h1>
      <p className="page-sub">Here are your projects. Open one to manage its tasks.</p>

      <ProjectForm
        key={editingProject ? editingProject.id : "new"}
        initialProject={editingProject}
        onSubmit={handleSubmit}
        onCancel={() => setEditingProject(null)}
      />

      {shownError && <p className="error">Error: {shownError}</p>}

      {loading ? (
        <Spinner />
      ) : (
        <ProjectList
          projects={projects}
          editingId={editingProject?.id}
          onEdit={setEditingProject}
          onDelete={setPendingDelete}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete project?"
          message={`"${pendingDelete.name}" and all its tasks will be permanently deleted.`}
          confirmLabel="Delete"
          busyLabel="Deleting..."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

export default ProjectsPage;