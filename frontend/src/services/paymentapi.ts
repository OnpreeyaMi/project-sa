import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: base,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export default api;
