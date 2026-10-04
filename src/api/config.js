// Set at BUILD time (VITE_API_URL). Falls back to the local backend in development.
export const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/$/, "");