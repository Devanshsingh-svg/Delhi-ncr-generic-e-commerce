import { create, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';
export const apiClient: AxiosInstance = create({ baseURL: API_BASE, withCredentials: true, timeout: 15000 });
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const correlationId = crypto.randomUUID();
  config.headers['X-Correlation-ID'] = correlationId;
  return config;
});
apiClient.interceptors.response.use((response) => response.data, (error) => {
  const message = error.response?.data?.message || error.message;
  return Promise.reject(new Error(message));
});