import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login                 from "./pages/Login";
import CreateCompany         from "./pages/CreateCompany";
import CompaniesList         from "./pages/CompaniesList";
import CompanyDetail         from "./pages/CompanyDetail";
import CompanyEdit           from "./pages/CompanyEdit";
import CreateDepot           from "./pages/CreateDepot";
import DepotsList            from "./pages/DepotsList";
import DepotDetail           from "./pages/DepotDetail";
import DepotEdit             from "./pages/DepotEdit";
import RequireAuth           from "./components/RequireAuth";
import RoleBasedDashboard    from "./components/RoleBasedDashboard";

function App() {
  return (
    <Routes>
      {/* Page de connexion */}
      <Route path="/" element={<Login />} />

      {/* Super Admin: gestion des sociétés */}
      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={["Super Admin"]}>
            <CreateCompany />
          </RequireAuth>
        }
      />
      <Route
        path="/companies"
        element={
          <RequireAuth allowedRoles={["Super Admin"]}>
            <CompaniesList />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <RequireAuth allowedRoles={["Super Admin"]}>
            <CompanyDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id/edit"
        element={
          <RequireAuth allowedRoles={["Super Admin"]}>
            <CompanyEdit />
          </RequireAuth>
        }
      />

      {/* Admin: gestion des dépôts */}
      <Route
        path="/create-depot"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <CreateDepot />
          </RequireAuth>
        }
      />
      <Route
        path="/depots"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <DepotsList />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <DepotDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id/edit"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <DepotEdit />
          </RequireAuth>
        }
      />

      {/* Dashboard générique */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />

      {/* Toutes autres URL → login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
