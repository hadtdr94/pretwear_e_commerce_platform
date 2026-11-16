import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const detailMsg = Array.isArray(data?.details)
      ? data.details.map((d) => d?.message).filter(Boolean).join(', ')
      : null;
    const message = detailMsg
      ? `${data?.error || 'Validation error'}: ${detailMsg}`
      : (data?.error || error?.message || 'Request failed');
    const wrapped = new Error(message);
    wrapped.status = error?.response?.status;
    wrapped.details = error?.response?.data?.details;
    wrapped.original = error;
    return Promise.reject(wrapped);
  }
);

export default api;
