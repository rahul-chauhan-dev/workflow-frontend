import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ProjectsProvider } from "./context/ProjectsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <App />
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);