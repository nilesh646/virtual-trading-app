import axios from "axios";

const api = axios.create({
  baseURL: "https://virtual-trading-app-hnd6.onrender.com",
});

export default api;

