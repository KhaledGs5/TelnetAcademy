import axios from "axios";
import { getCookie } from "./components/Cookies";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", 
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie("Token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
