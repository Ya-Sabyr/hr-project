import axios from "axios";
import { AuthService } from "../services/auth.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = AuthService.getRefreshToken();
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const { access_token, refresh_token, token_type } = response.data;
        const user_type = AuthService.getUserType() || "default";

        AuthService.setTokens(
          { access_token, refresh_token, token_type },
          user_type
        );

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        AuthService.clearTokens();
        /* window.location.href = "/login"; */
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
