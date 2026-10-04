import { Link } from "react-router-dom";

function ProjectList({ projects, editingId, onEdit, onDelete }) {
  if (projects.length === 0) {
    return <p className="empty">No projects yet. Create your first one above.</p>;
  }

  return (
    <ul className="card-list">
      {projects.map((p) => {
        const pct = p.taskCount === 0 ? 0 : Math.round((p.doneCount / p.taskCount) * 100);

        return (
          <li key={p.id} className={p.id === editingId ? "card card-editing" : "card"}>
            <div className="card-head">
              <Link to={`/projects/${p.id}`} className="card-title">
                {p.name}
              </Link>
              <span className="badge">
                {p.taskCount} {p.taskCount === 1 ? "task" : "tasks"}
              </span>
            </div>

            {p.description && <p className="card-text">{p.description}</p>}

            {p.taskCount > 0 && (
              <>
                <div className="chip-row">
                  {p.todoCount > 0 && <span className="chip chip-todo">{p.todoCount} To do</span>}
                  {p.inProgressCount > 0 && (
                    <span className="chip chip-in_progress">{p.inProgressCount} In progress</span>
                  )}
                  {p.doneCount > 0 && <span className="chip chip-done">{p.doneCount} Done</span>}
                </div>
                <div
                  className="progress"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`${p.name} progress`}
                >
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </>
            )}

            <div className="card-actions">
              <button className="btn btn-sm" onClick={() => onEdit(p)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>Delete</button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ProjectList;