import { useCallback, useEffect, useState } from "react";
import { getTasks } from "../api/taskApi";

export function useTasks(projectId, params) {
  const [data, setData] = useState(null); // the PageResponse; null until the first load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { status, priority, q, sort, page, size } = params;

  useEffect(() => {
    let ignore = false; // becomes true if a newer request replaces this one
    setLoading(true);

    getTasks(projectId, { status, priority, q, sort, page, size })
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [projectId, status, priority, q, sort, page, size, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, setData, loading, error, reload };
}
