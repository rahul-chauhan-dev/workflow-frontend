import { request, jsonBody } from "./http";

import { API_BASE } from "./config";
const BASE = `${API_BASE}/api`;

export const getComments = (taskId) => request(`${BASE}/tasks/${taskId}/comments`);

export const addComment = (taskId, content) =>
  request(`${BASE}/tasks/${taskId}/comments`, jsonBody("POST", { content }));

export const deleteComment = (id) => request(`${BASE}/comments/${id}`, { method: "DELETE" });