// File: src/api/baseClient.ts
import axios, {type AxiosRequestConfig, AxiosError } from 'axios';

export interface BaseClientResponse<T> {
    data: T | null;
    error: { message?: string } | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Створюємо інстанс axios
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // для refresh через HttpOnly cookie
    headers: { 'Content-Type': 'application/json' },
});

// Інтерсептор запитів: додає accessToken з localStorage
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalConfig = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            try {
                const refreshRes = await axiosInstance.post<{ accessToken: string }>('/auth/token');
                const newToken = refreshRes.data.accessToken;
                localStorage.setItem('accessToken', newToken);
                if (originalConfig.headers) {
                    originalConfig.headers['Authorization'] = `Bearer ${newToken}`;
                }
                return axiosInstance(originalConfig);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Типізована обгортка для axios: GET/POST/PUT/DELETE + базова обробка помилок
 */
export async function baseApiClient<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    payload?: any
): Promise<BaseClientResponse<T>> {
    try {
        const config: AxiosRequestConfig = { url, method };
        if (payload) config.data = payload;

        const response = await axiosInstance.request<T>(config);
        return { data: response.data, error: null };
    } catch (err) {
        console.error('API error:', err);
        let message = 'Something went wrong!';
        if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError;
            if (axiosErr.response) {
                try {
                    const data = axiosErr.response.data as any;
                    message = data?.error || JSON.stringify(data) || axiosErr.message;
                } catch {
                    message = axiosErr.message;
                }
            } else {
                message = axiosErr.message;
            }
        }
        return { data: null as any, error: { message } };
    }
}
