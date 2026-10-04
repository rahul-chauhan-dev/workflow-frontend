import { useEffect, useState } from "react";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // a new keystroke cancels the pending update
  }, [value, delay]);

  return debounced;
}