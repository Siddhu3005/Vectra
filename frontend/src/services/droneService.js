import api from './api';
export const getDrones = () => api.get('/drones').then((r) => r.data);
export const getDrone = (id) => api.get(`/drones/${id}`).then((r) => r.data);
export const createDrone = (data) => api.post('/drones', data).then((r) => r.data);
export const updateDrone = (id, data) => api.put(`/drones/${id}`, data).then((r) => r.data);
export const deleteDrone = (id) => api.delete(`/drones/${id}`);
export const getDroneHistory = (id) => api.get(`/drones/${id}/history`).then((r) => r.data);
