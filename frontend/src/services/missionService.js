import api from './api';
export const getMissions = () => api.get('/missions').then((r) => r.data);
export const getMission = (id) => api.get(`/missions/${id}`).then((r) => r.data);
export const createMission = (data) => api.post('/missions', data).then((r) => r.data);
export const updateMission = (id, data) => api.put(`/missions/${id}`, data).then((r) => r.data);
export const startMission = (id) => api.put(`/missions/${id}/start`).then((r) => r.data);
export const completeMission = (id) => api.put(`/missions/${id}/complete`).then((r) => r.data);
