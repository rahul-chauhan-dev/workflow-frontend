import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/dashboardApi";
import Spinner from "../components/Spinner";
import { usePageTitle } from "../hooks/usePageTitle";

function percent(part, total) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function StatCard({ label, value, tone }) {
  return (
    <div className={tone ? `stat-card stat-${tone}` : "stat-card"}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function DashboardPage() {
  usePageTitle("Dashboard");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Fetched fresh every time the page is opened, so it is never stale
  useEffect(() => {
    let ignore = false;
    getDashboard()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <p className="error">Error: {error}</p>;
  if (!data) return <Spinner />;

  const total = data.totalTasks;

  return (
    <div>
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Projects" value={data.projectCount} />
        <StatCard label="Total tasks" value={total} />
        <StatCard label="Overdue" value={data.overdueCount} tone={data.overdueCount > 0 ? "danger" : undefined} />
        <StatCard label="Due in 7 days" value={data.dueSoonCount} tone={data.dueSoonCount > 0 ? "warn" : undefined} />
        <StatCard label="High priority open" value={data.highPriorityOpenCount} />
      </div>

      <section className="section">
        <h2>Tasks by status</h2>
        {total === 0 ? (
          <p className="task-meta">No tasks yet. Create a project and add some.</p>
        ) : (
          <>
            <div className="stack-bar" role="img" aria-label="Task status distribution">
              <div className="stack-seg-todo" style={{ width: `${percent(data.todoCount, total)}%` }} />
              <div className="stack-seg-progress" style={{ width: `${percent(data.inProgressCount, total)}%` }} />
              <div className="stack-seg-done" style={{ width: `${percent(data.doneCount, total)}%` }} />
            </div>
            <div className="legend">
              <span><i className="legend-dot stack-seg-todo" /> To do: {data.todoCount}</span>
              <span><i className="legend-dot stack-seg-progress" /> In progress: {data.inProgressCount}</span>
              <span><i className="legend-dot stack-seg-done" /> Done: {data.doneCount}</span>
            </div>
          </>
        )}
      </section>

      <section className="section">
        <h2>Project progress</h2>
        {data.projects.length === 0 ? (
          <p className="task-meta">No projects yet.</p>
        ) : (
          <ul className="card-list">
            {data.projects.map((p) => {
              const pct = percent(p.doneCount, p.taskCount);
              return (
                <li key={p.id} className="card">
                  <Link to={`/projects/${p.id}`} className="card-title">
                    {p.name}
                  </Link>
                  <span className="badge">
                    {p.doneCount}/{p.taskCount} done
                  </span>
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
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="section">
        <h2>Recent activity</h2>
        {data.recentActivity.length === 0 ? (
          <p className="task-meta">No comments yet.</p>
        ) : (
          <ul className="activity-list">
            {data.recentActivity.map((a) => (
              <li key={a.commentId} className="activity-item">
                <div>
                  <strong>{a.authorName}</strong> commented on{" "}
                  <Link to={`/projects/${a.projectId}`}>{a.taskTitle}</Link> in {a.projectName}
                </div>
                <p className="comment-body">{a.content}</p>
                <span className="task-meta">{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;