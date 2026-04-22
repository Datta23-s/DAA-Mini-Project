import axios from 'axios';

// In production, we serve the API from the same domain
// In development, we use localhost:5000
const API_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach the x-auth-token if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default api;
