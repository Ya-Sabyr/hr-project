import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosMultipartInstance = axios.create({
  baseURL: API_BASE_URL, // API base URL from env
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default axiosMultipartInstance;