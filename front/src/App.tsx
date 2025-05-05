import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* Connexion + dashboards */
import Login from "./pages/Login";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import DashboardResponsable from "./pages/DashboardResponsableDepot";
import DashboardAdmin from "./pages/DashboardAdmin";

/* Super-admin */
import CreateCompany from "./pages/CreateCompany";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyEdit from "./pages/CompanyEdit";

/* Admin – dépôts */
import CreateDepot from "./pages/CreateDepot";
import DepotsList from "./pages/DepotsList";
import DepotDetail from "./pages/DepotDetail";
import DepotEdit from "./pages/DepotEdit";

/* Équipes */
import Teams from "./pages/Teams";
import TeamManage from "./pages/TeamManage";

/* Livraison / Pré-vente / Entrepôt */
import DeliveryTeam from "./pages/DeliveryTeam";
import AddMember from "./pages/AddMember";
import PreventeTeam from "./pages/PreventeTeam";
import AddPrevente from "./pages/AddPrevente";
import EntrepotTeam from "./pages/EntrepotTeam";
import AddEntrepot from "./pages/AddEntrepot";

/* Clients */
import ClientsList from "./pages/ClientsList";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ClientDetail from "./pages/ClientDetail";

/* Helpers */
import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <Routes>
      {/* Connexion */}
      <Route path="/" element={<Login />} />

      {/* Dashboards */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-responsable"
        element={
          <RequireAuth allowedRoles={["responsable depot"]}>
            <DashboardResponsable />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-admin"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <DashboardAdmin />
          </RequireAuth>
        }
      />

      {/* Clients */}
      <Route
        path="/clients"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <ClientsList />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/add"
        element={
          <RequireAuth allowedRoles={["responsable depot"]}>
            <AddClient />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/edit/:id"
        element={
          <RequireAuth allowedRoles={["responsable depot"]}>
            <EditClient />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <ClientDetail />
          </RequireAuth>
        }
      />

      {/* Super-Admin */}
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
          <RequireAuth allowedRoles={["Super Admin", "Admin"]}>
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

      {/* Admin : Dépôts */}
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

      {/* Équipes */}
      <Route
        path="/teams"
        element={
          <RequireAuth allowedRoles={["Admin"]}>
            <Teams />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <TeamManage />
          </RequireAuth>
        }
      />

      {/* Livraison */}
      <Route
        path="/teams/:depotId/livraison"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <DeliveryTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/livraison/add"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <AddMember />
          </RequireAuth>
        }
      />

      {/* Pré-vente */}
      <Route
        path="/teams/:depotId/prevente"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <PreventeTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/prevente/add"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <AddPrevente />
          </RequireAuth>
        }
      />

      {/* Entrepôt */}
      <Route
        path="/teams/:depotId/entrepot"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <EntrepotTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/entrepot/add"
        element={
          <RequireAuth allowedRoles={["Admin", "responsable depot"]}>
            <AddEntrepot />
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
