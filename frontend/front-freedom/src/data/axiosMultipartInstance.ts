import axios from 'axios';

const axiosMultipartInstance = axios.create({
  baseURL: 'http://localhost:8000', // Replace with your API base URL
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default axiosMultipartInstance;