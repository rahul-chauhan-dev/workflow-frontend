import { request, jsonBody } from "./http";

import { API_BASE } from "./config";
const BASE_URL = `${API_BASE}/api/projects`;

export const getProjects = () => request(BASE_URL);

export const getProject = (id) => request(`${BASE_URL}/${id}`);

export const createProject = (project) => request(BASE_URL, jsonBody("POST", project));

export const updateProject = (id, project) =>
  request(`${BASE_URL}/${id}`, jsonBody("PUT", project));

export const deleteProject = (id) => request(`${BASE_URL}/${id}`, { method: "DELETE" });