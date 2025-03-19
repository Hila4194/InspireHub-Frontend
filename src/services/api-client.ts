import axios, { AxiosError, AxiosRequestConfig, CanceledError } from "axios";
import { useAuth } from "../context/AuthContext";

export { CanceledError };

const backend_url = import.meta.env.VITE_API_BASE_URL;
console.log("url: " + backend_url);

// Set base URL for API requests
const apiClient = axios.create({
  baseURL: backend_url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Attach Authorization Header & Handle FormData
apiClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user?.accessToken) {
      config.headers.Authorization = `JWT ${user.accessToken}`;
    }
  }

  // Allow FormData to set Content-Type automatically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"]; // Let the browser set "multipart/form-data"
  }

  return config;
});

// Response Interceptor - Auto Refresh Token on 401
apiClient.interceptors.response.use(
  (response) => response, // Pass successful responses through
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If unauthorized (401) and we haven't retried yet, refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) throw new Error("No user data found");

        const user = JSON.parse(storedUser);
        if (!user?.refreshToken) throw new Error("No refresh token available");

        const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`, {
          token: user.refreshToken,
        });

        const newAccessToken = refreshResponse.data.accessToken;

        // Update user data in localStorage
        const updatedUser = { ...user, accessToken: newAccessToken };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Retry original request with new token
        originalRequest.headers = { ...originalRequest.headers, Authorization: `JWT ${newAccessToken}` };
        return axios(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed, logging out:", refreshError);
        useAuth().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;