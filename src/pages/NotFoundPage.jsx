import { Link } from "react-router-dom";
import { usePageTitle } from "../hooks/usePageTitle";

function NotFoundPage() {
  usePageTitle("Not Found");
  return (
    <div className="state-page">
      <div className="state-code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="btn btn-primary">Back to projects</Link>
    </div>
  );
}

export default NotFoundPage;