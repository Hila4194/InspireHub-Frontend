import axios, { CanceledError } from "axios";

export { CanceledError };

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // ✅ Ensure it points to `/api`
});
export default apiClient;