// Backend API endpoint base
// If VITE_API_URL is defined, use it; otherwise use the Vite proxy path '/api/users'
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/users';

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
