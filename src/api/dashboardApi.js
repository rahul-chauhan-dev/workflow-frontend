import { request } from "./http";
import { API_BASE } from "./config";

export const getDashboard = () => request(`${API_BASE}/api/dashboard`);