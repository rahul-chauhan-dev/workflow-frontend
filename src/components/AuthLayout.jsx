import { Link } from "react-router-dom";

function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-hero-inner">
          <div className="auth-logo">TaskFlow</div>
          <h2>Plan projects. Finish tasks.</h2>
          <p>A simple workspace to organize your work, track progress, and keep your team in sync.</p>
          <ul>
            <li>Projects with tasks, priorities and due dates</li>
            <li>List and Kanban board views</li>
            <li>Your data stays private to your account</li>
          </ul>
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <Link to="/login" className="visually-hidden">TaskFlow</Link>
          <h1>{title}</h1>
          <p className="auth-sub">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;