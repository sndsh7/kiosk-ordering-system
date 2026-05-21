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

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Session timeout / 401 handler ───────────────────────────────────────────
// If the API returns 401 (expired/invalid JWT) or 403, clear the stored token
// and bounce the user back to the login page.
let _navigateFn = null;

/**
 * Call this once inside App to wire up the navigate function from React Router.
 * Must be called inside a Router context.
 */
export function setNavigate(navigateFn) {
  _navigateFn = navigateFn;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      clearToken();
      if (_navigateFn) {
        _navigateFn("/login", { replace: true });
      } else {
        // Fallback if navigate isn't wired yet (e.g. very early load)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

