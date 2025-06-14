import axios from "axios";

const api = axios.create({
  baseURL: "https://lemon-ai.tech",
  withCredentials: false, // replace with your FastAPI base URL
});

export default api;
