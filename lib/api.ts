import axios from "axios";
import Cookies from "js-cookie";

// Every request goes through this shared axios instance so cookie and CSRF behavior
// stays consistent across the app. The backend stores JWTs in httpOnly cookies,
// so the browser, not application code, must send them.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  // State-changing requests must include the readable CSRF cookie as a header.
  // The JWT remains httpOnly and unreadable to JavaScript; this double-submit
  // header lets the backend reject cross-site form posts that cannot read our cookie.
  if (method && ["post", "put", "patch", "delete"].includes(method)) {
    const csrfToken = Cookies.get("csrf-token");
    if (csrfToken) {
      config.headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return config;
});

export default api;
