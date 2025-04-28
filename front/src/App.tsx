// front/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login               from './pages/Login';
import CreateCompany       from './pages/CreateCompany';
import RequireAuth         from './components/RequireAuth';
import RoleBasedDashboard  from './components/RoleBasedDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* création réservée aux Super Admin */}
      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={['Super Admin']}>
            <CreateCompany />
          </RequireAuth>
        }
      />

      {/* dashboard unique, choisi selon user.role */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />

      {/* tout autre chemin renvoie à la login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
