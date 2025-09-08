import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:18080";

const api = axios.create({
  baseURL: base,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export default api;
