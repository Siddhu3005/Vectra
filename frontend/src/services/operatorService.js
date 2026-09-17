import api from './api';
export const getOperators = () => api.get('/operators').then((r) => r.data);
export const getOperator = (id) => api.get(`/operators/${id}`).then((r) => r.data);
export const getMyProfile = () => api.get('/operators/me').then((r) => r.data);
export const createOperator = (data) => api.post('/operators', data).then((r) => r.data);
export const updateOperator = (id, data) => api.put(`/operators/${id}`, data).then((r) => r.data);
export const deleteOperator = (id) => api.delete(`/operators/${id}`);
