// front/src/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login              from './pages/Login';
import CreateCompany      from './pages/CreateCompany';
import CompaniesList      from './pages/CompaniesList';
import RequireAuth        from './components/RequireAuth';
import RoleBasedDashboard from './components/RoleBasedDashboard';

function App() {
  return (
    <Routes>
      {/* Page de login */}
      <Route path="/" element={<Login />} />

      {/* Créer une entreprise + Admin (Super Admin only) */}
      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={['Super Admin']}>
            <CreateCompany />
          </RequireAuth>
        }
      />

      {/* Lister toutes les entreprises (Super Admin only) */}
      <Route
        path="/companies"
        element={
          <RequireAuth allowedRoles={['Super Admin']}>
            <CompaniesList />
          </RequireAuth>
        }
      />

      {/* Dashboard générique, choisi d’après le rôle */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />

      {/* Tout le reste redirige vers login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
