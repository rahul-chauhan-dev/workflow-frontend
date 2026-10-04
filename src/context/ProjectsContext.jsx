import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../api/projectApi";
import { useAuth } from "./AuthContext";

const ProjectsContext = createContext(null);

const STATUS_FIELD = {
  TODO: "todoCount",
  IN_PROGRESS: "inProgressCount",
  DONE: "doneCount",
};

export function ProjectsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Reload whenever the logged-in user changes; clear everything on logout
  useEffect(() => {
    if (userId === null) {
      setProjects([]);
      setLoadError(null);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    setLoadError(null);

    getProjects()
      .then((list) => {
        if (!ignore) setProjects(list);
      })
      .catch((err) => {
        if (!ignore) setLoadError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  // These throw on failure, so the calling page decides how to show the error.
  const addProject = useCallback(async (data) => {
    const saved = await createProject(data);
    setProjects((prev) => [...prev, saved]);
  }, []);

  const editProject = useCallback(async (id, data) => {
    const updated = await updateProject(id, data);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removeProject = useCallback(async (id) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // add: (null, new)   delete: (old, null)   status change: (old, new)
  const applyTaskChange = useCallback((projectId, oldStatus, newStatus) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const next = { ...p }; // copy, never mutate prev
        if (oldStatus) {
          next[STATUS_FIELD[oldStatus]] -= 1;
          next.taskCount -= 1;
        }
        if (newStatus) {
          next[STATUS_FIELD[newStatus]] += 1;
          next.taskCount += 1;
        }
        return next;
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      projects,
      loading,
      loadError,
      addProject,
      editProject,
      removeProject,
      applyTaskChange,
    }),
    [projects, loading, loadError, addProject, editProject, removeProject, applyTaskChange]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) {
    throw new Error("useProjects must be used inside <ProjectsProvider>");
  }
  return ctx;
}