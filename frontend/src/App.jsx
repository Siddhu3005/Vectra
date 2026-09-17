import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layout/AppLayout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Drones from './pages/Drone/Drones';
import Missions from './pages/Mission/Missions';
import Assignments from './pages/Assignment/Assignments';
import Maintenance from './pages/Maintenance/Maintenance';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import Operators from './pages/Operator/Operators';
import Users from './pages/User/Users';
import Reports from './pages/Reports/Reports';
import RoleRoute from './components/RoleRoute';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary><Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/drones" element={<RoleRoute roles={['ADMIN', 'MAINTENANCE_ENGINEER']}><Drones /></RoleRoute>} />
          <Route path="/missions" element={<RoleRoute roles={['ADMIN', 'WAREHOUSE_MANAGER', 'OPERATOR']}><Missions /></RoleRoute>} />
          <Route path="/assignments" element={<RoleRoute roles={['ADMIN']}><Assignments /></RoleRoute>} />
          <Route path="/operators" element={<RoleRoute roles={['ADMIN']}><Operators /></RoleRoute>} />
          <Route path="/users" element={<RoleRoute roles={['ADMIN']}><Users /></RoleRoute>} />
          <Route path="/reports" element={<RoleRoute roles={['ADMIN']}><Reports /></RoleRoute>} />
          <Route path="/maintenance" element={
            <RoleRoute roles={['ADMIN', 'MAINTENANCE_ENGINEER']}><Maintenance /></RoleRoute>
          } />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes></ErrorBoundary>
  );
}
