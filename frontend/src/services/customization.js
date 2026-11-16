import api from './api';

export const customizationApi = {
  create: (formData) => api.post('/customization', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  mine: (params = {}) => api.get('/customization/mine', { params }).then((r) => r.data),
};
