// Backend API endpoint base
const LIVE_USERS_API = "https://portfolio-backend-lv8o.onrender.com/api/users";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes("portfolio.com") && !envUrl.includes("docs/services") && (envUrl.includes("render.com") || envUrl.includes("localhost"))) {
    return envUrl;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "/api/users";
  }
  return LIVE_USERS_API;
};

const API_BASE_URL = getApiBaseUrl();

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/addUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
};

export const fetchAllUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/allUser`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data;
};
