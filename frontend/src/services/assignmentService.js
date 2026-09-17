import api from './api';
export const getAssignments = () => api.get('/assignments').then((r) => r.data);
export const getRecommendedAssignments = () => api.get('/assignments/recommended').then((r) => r.data);
export const assignDrone = (missionId) => api.post('/assignments/assign', { missionId }).then((r) => r.data);
export const assignOperator = (assignmentId, operatorId) => api.put(`/assignments/${assignmentId}/assign-operator`, { operatorId }).then((r) => r.data);
export const completeAssignment = (id) => api.post(`/assignments/${id}/complete`).then((r) => r.data);
export const getMyMissions = () => api.get('/operators/me/missions').then((r) => r.data);
