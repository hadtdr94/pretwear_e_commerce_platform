import api from './api';

export const ordersApi = {
  create: (data) => api.post('/orders', data).then((r) => r.data),
  mine: (params = {}) => api.get('/orders/mine', { params }).then((r) => r.data),
  byReference: (reference) => api.get(`/orders/reference/${reference}`).then((r) => r.data),
};
