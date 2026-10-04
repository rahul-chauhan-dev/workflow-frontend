import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Spinner from "./Spinner";

function ProtectedRoute({ role }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <Spinner />;
  }

  if (!user) {
    // remember where the user was going, so login can send them back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return (
      <div className="state-page">
        <div className="state-code">403</div>
        <h1>Access denied</h1>
        <p>You don't have permission to view this page.</p>
        <Link to="/" className="btn btn-primary">
          Back to projects
        </Link>
      </div>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
