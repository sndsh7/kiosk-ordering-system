import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function getToken() {
  return localStorage.getItem("admin_token");
}

export function setToken(t) {
  localStorage.setItem("admin_token", t);
}

export function clearToken() {
  localStorage.removeItem("admin_token");
}

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
