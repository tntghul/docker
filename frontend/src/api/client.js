import axios from "axios";

// Default directly to the live Render backend in production so requests bypass any Vercel proxy/SSO blocks
const LIVE_RENDER_API = "https://portfolio-backend-lv8o.onrender.com";

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  // If envUrl is set and is a valid URL not pointing to sample docs or portfolio.com
  if (envUrl && !envUrl.includes("portfolio.com") && !envUrl.includes("docs/services") && (envUrl.includes("render.com") || envUrl.includes("localhost"))) {
    return `${envUrl.replace(/\/$/, "")}/api`;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "/api";
  }
  return `${LIVE_RENDER_API}/api`;
};

const API = axios.create({
  baseURL: getBaseUrl()
});

// Automatically inject JWT token from localStorage into Authorization header
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401/403 and handle expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (window.location.pathname.startsWith("/admin")) {
        // Token expired or invalid
        // Optionally redirect or clear token
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => API.post("/auth/login", credentials),
  register: (data) => API.post("/auth/register", data),
  getMe: () => API.get("/auth/me")
};

// Portfolio CMS Endpoints
export const portfolioApi = {
  getPublicPortfolio: (userId) => API.get(userId ? `/portfolio/public?userId=${userId}` : "/portfolio/public"),
  getAdminPortfolio: () => API.get("/portfolio/admin"),
  updatePortfolio: (data) => API.put("/portfolio/update", data)
};

// AI Resume Endpoints
export const resumeApi = {
  generateResume: (payload) => API.post("/resume/generate", payload),
  saveResume: (resumeData) => API.post("/resume/save", resumeData),
  getResumeHistory: () => API.get("/resume/history"),
  getResumeById: (id) => API.get(`/resume/${id}`),
  deleteResume: (id) => API.delete(`/resume/${id}`)
};

export default API;
