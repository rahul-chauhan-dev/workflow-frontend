import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="brand">
      ✅TaskFlow
      </Link>

      <nav className="nav">
        {user && (
          <>
            <NavLink to="/" end>Projects</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>
        )}
        {user?.role === "ADMIN" && <NavLink to="/admin">Admin</NavLink>}

        {user && (
          <>
            <span className="nav-divider" aria-hidden="true" />
            <span className="nav-user">
              <span className="avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span>{user.name}</span>
            </span>
            <button className="logout-btn" onClick={logout} title="Log out">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="logout-text">Log out</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default AppHeader;