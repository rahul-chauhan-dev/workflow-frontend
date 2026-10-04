import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import AppHeader from "./components/AppHeader";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <div className="container">
      <AppHeader />
      <ErrorBoundary key={location.pathname}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
      <footer className="app-footer">
        TaskFlow · Built with React and Spring Boot
      </footer>
    </div>
  );
}

export default App;