import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // .env에 정의된 주소 사용
});

export default api;
