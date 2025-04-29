import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login              from './pages/Login';
import CreateCompany      from './pages/CreateCompany';
import CompaniesList      from './pages/CompaniesList';
import CreateDepot        from './pages/CreateDepot';
import DepotsList         from './pages/DepotsList';
import RequireAuth        from './components/RequireAuth';
import RoleBasedDashboard from './components/RoleBasedDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={['Super Admin']}>
            <CreateCompany />
          </RequireAuth>
        }
      />

      <Route
        path="/companies"
        element={
          <RequireAuth allowedRoles={['Super Admin']}>
            <CompaniesList />
          </RequireAuth>
        }
      />

      <Route
        path="/create-depot"
        element={
          <RequireAuth allowedRoles={['Admin']}>
            <CreateDepot />
          </RequireAuth>
        }
      />

      <Route
        path="/depots"
        element={
          <RequireAuth allowedRoles={['Admin']}>
            <DepotsList />
          </RequireAuth>
        }
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
