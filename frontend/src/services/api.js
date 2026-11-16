import axios from 'axios';

let rawBase = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://') && !rawBase.startsWith('/')) {
  rawBase = `https://${rawBase}`;
}
if (rawBase && !rawBase.endsWith('/api') && !rawBase.endsWith('/api/')) {
  rawBase = rawBase.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: rawBase,
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
