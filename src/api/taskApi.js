import { request, jsonBody } from "./http";

import { API_BASE } from "./config";
const BASE = `${API_BASE}/api`;

// params: { status, priority, q, sort, page, size }; empty values are left out
export function getTasks(projectId, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  return request(`${BASE}/projects/${projectId}/tasks?${query}`);
}

export const createTask = (projectId, task) =>
  request(`${BASE}/projects/${projectId}/tasks`, jsonBody("POST", task));

export const updateTask = (id, task) => request(`${BASE}/tasks/${id}`, jsonBody("PUT", task));

export const updateTaskStatus = (id, status) =>
  request(`${BASE}/tasks/${id}/status`, jsonBody("PATCH", { status }));

export const deleteTask = (id) => request(`${BASE}/tasks/${id}`, { method: "DELETE" });