import axios from "axios";

const API = "http://localhost:3000";

export const api = axios.create({
  baseURL: API,
});

// interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/login", data);
  return response.data;
};