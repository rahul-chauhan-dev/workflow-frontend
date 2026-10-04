import { request, jsonBody } from "./http";

import { API_BASE } from "./config";
const BASE = `${API_BASE}/api`;

export const register = (data) =>
  request(`${BASE}/auth/register`, jsonBody("POST", data), { auth: false });

export const login = (email, password) =>
  request(`${BASE}/auth/login`, jsonBody("POST", { email, password }), { auth: false });

export const fetchMe = () => request(`${BASE}/auth/me`);

export const getUsers = () => request(`${BASE}/admin/users`);