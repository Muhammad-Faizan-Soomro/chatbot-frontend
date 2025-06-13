import axios from "axios";

const api = axios.create({
  baseURL: "http://ec2-13-201-73-171.ap-south-1.compute.amazonaws.com:8000",
  withCredentials: false, // replace with your FastAPI base URL
});

export default api;
