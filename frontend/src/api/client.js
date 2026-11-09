import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")}/api`
    : "/api"
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
  getPublicPortfolio: () => API.get("/portfolio/public"),
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
