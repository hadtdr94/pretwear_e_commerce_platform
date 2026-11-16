import api from './api';

export const catalogApi = {
  listCategories: (params = {}) => api.get('/categories', { params }).then((r) => r.data),
  listProducts: (params = {}) => api.get('/products', { params }).then((r) => r.data),
  getProduct: (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data),
  getSettings: () => api.get('/settings').then((r) => r.data),
  listDeliveryZones: (params = {}) => api.get('/delivery-zones', { params }).then((r) => r.data),
};
