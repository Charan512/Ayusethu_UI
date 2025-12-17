// frontend/src/api/adminApi.js
import axios from "axios";

let baseURL = import.meta.env.VITE_API_BASE;
if (baseURL && !baseURL.endsWith('/')) {
    baseURL += '/';
}

const adminApi = axios.create({
  baseURL: baseURL,
});


adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;