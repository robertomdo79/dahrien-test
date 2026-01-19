import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

// Create Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add API Key to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    
    if (apiKey) {
      config.headers.set('x-api-key', apiKey);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: { message: string } }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message 
      || error.response?.data?.message 
      || error.message;

    switch (status) {
      case 400:
        toast.error(`Invalid request: ${message}`);
        break;
      case 401:
        toast.error('Authentication failed. Please check your API key.');
        break;
      case 403:
        toast.error('Access denied. You do not have permission.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 409:
        // Conflict - e.g., double booking or quota exceeded
        toast.error(message || 'Conflict detected. The resource may already exist or overlap.');
        break;
      case 422:
        toast.error(`Validation error: ${message}`);
        break;
      case 500:
        toast.error('Server error. Please try again later.');
        break;
      default:
        if (!navigator.onLine) {
          toast.error('No internet connection. Please check your network.');
        } else {
          toast.error(message || 'An unexpected error occurred.');
        }
    }

    return Promise.reject(error);
  }
);

export default api;
