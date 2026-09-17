import api from './api';
export const getMaintenance = () => api.get('/maintenance').then((r) => r.data);
export const getMaintenanceHistory = (droneId) => api.get(`/maintenance/history/${droneId}`).then((r) => r.data);
export const createMaintenance = (data) => api.post('/maintenance', data).then((r) => r.data);
export const updateMaintenance = (id, data) => api.put(`/maintenance/${id}`, data).then((r) => r.data);
export const completeMaintenance = (id) => api.post(`/maintenance/${id}/complete`).then((r) => r.data);
