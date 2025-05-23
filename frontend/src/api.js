import axios from "axios";
import { getCookie } from "./components/Cookies";

const api = axios.create({
  baseURL: "http://10.3.1.103:49880",
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
