import api from './api';

export const cartApi = {
  get: (sessionId) => api.get('/cart', { params: sessionId ? { sessionId } : {} }).then((r) => r.data),
  addItem: (payload) => api.post('/cart/items', payload).then((r) => r.data),
  updateItem: (itemId, payload) => api.put(`/cart/items/${itemId}`, payload).then((r) => r.data),
  removeItem: (itemId, sessionId) => api.delete(`/cart/items/${itemId}`, { params: sessionId ? { sessionId } : {} }).then((r) => r.data),
  clear: (sessionId) => api.delete('/cart', { params: sessionId ? { sessionId } : {} }).then((r) => r.data),
};
