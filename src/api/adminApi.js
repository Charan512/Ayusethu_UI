import axios from "axios";

const adminApi = axios.create({
  baseURL: "https://ayusethu-api.onrender.com",
});

// Attach JWT
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;
