// front/src/App.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

/* Connexion + dashboards */
import Login from './pages/Login';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import DashboardResponsableDepot from './pages/DashboardResponsableDepot';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardGestionStock from './pages/DashboardGestionStock';

/* Super-Admin */
import CreateCompany from './pages/CreateCompany';
import CompaniesList from './pages/CompaniesList';
import CompanyDetail from './pages/CompanyDetail';
import CompanyEdit from './pages/CompanyEdit';

/* Admin – dépôts */
import CreateDepot from './pages/CreateDepot';
import DepotsList from './pages/DepotsList';
import DepotDetail from './pages/DepotDetail';
import DepotEdit from './pages/DepotEdit';

/* Équipes */
import Teams from './pages/Teams';
import TeamManage from './pages/TeamManage';

/* Livraison / Pré-vente / Entrepôt */
import DeliveryTeam from './pages/DeliveryTeam';
import AddMember from './pages/AddMember';
import PreventeTeam from './pages/PreventeTeam';
import AddPrevente from './pages/AddPrevente';
import EntrepotTeam from './pages/EntrepotTeam';
import AddEntrepot from './pages/AddEntrepot';

/* Clients */
import ClientsList from './pages/ClientsList';
import AddClient from './pages/AddClient';
import EditClient from './pages/EditClient';
import ClientDetail from './pages/ClientDetail';

/* Gestion des produits (CRUD stock) */
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import FormulaireProduit from './pages/FormulaireProduit';

/* Helpers */
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <Routes>
      {/* Connexion */}
      <Route path="/" element={<Login />} />

      {/* Dashboard générique (redirection selon rôle) */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />

      {/* Dashboards directs */}
      <Route
        path="/dashboard-admin"
        element={
          <RequireAuth allowedRoles={['admin', 'super admin']}>
            <DashboardAdmin />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-responsable"
        element={
          <RequireAuth allowedRoles={['responsable depot']}>
            <DashboardResponsableDepot />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-stock"
        element={
          <RequireAuth allowedRoles={['gestionnaire de stock']}>
            <DashboardGestionStock />
          </RequireAuth>
        }
      />

      {/* Super-Admin */}
      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={['super admin']}>
            <CreateCompany />
          </RequireAuth>
        }
      />
      <Route
        path="/companies"
        element={
          <RequireAuth allowedRoles={['super admin']}>
            <CompaniesList />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <RequireAuth allowedRoles={['super admin', 'admin']}>
            <CompanyDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id/edit"
        element={
          <RequireAuth allowedRoles={['super admin']}>
            <CompanyEdit />
          </RequireAuth>
        }
      />

      {/* Admin – dépôts */}
      <Route
        path="/create-depot"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <CreateDepot />
          </RequireAuth>
        }
      />
      <Route
        path="/depots"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <DepotsList />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <DepotDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id/edit"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <DepotEdit />
          </RequireAuth>
        }
      />

      {/* Équipes */}
      <Route
        path="/teams"
        element={
          <RequireAuth allowedRoles={['admin']}>
            <Teams />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <TeamManage />
          </RequireAuth>
        }
      />

      {/* Livraison */}
      <Route
        path="/teams/:depotId/livraison"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <DeliveryTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/livraison/add"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <AddMember />
          </RequireAuth>
        }
      />

      {/* Pré-vente */}
      <Route
        path="/teams/:depotId/prevente"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <PreventeTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/prevente/add"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <AddPrevente />
          </RequireAuth>
        }
      />

      {/* Entrepôt */}
      <Route
        path="/teams/:depotId/entrepot"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <EntrepotTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/entrepot/add"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <AddEntrepot />
          </RequireAuth>
        }
      />

      {/* Clients */}
      <Route
        path="/clients"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <ClientsList />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/add"
        element={
          <RequireAuth allowedRoles={['responsable depot']}>
            <AddClient />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/edit/:id"
        element={
          <RequireAuth allowedRoles={['responsable depot']}>
            <EditClient />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <RequireAuth allowedRoles={['admin', 'responsable depot']}>
            <ClientDetail />
          </RequireAuth>
        }
      />

      {/* Gestion des produits */}
      <Route
        path="/gestion-produit"
        element={
          <RequireAuth allowedRoles={['gestionnaire de stock']}>
            <ProductList />
          </RequireAuth>
        }
      />
      <Route
        path="/gestion-produit/ajouter"
        element={
          <RequireAuth allowedRoles={['gestionnaire de stock']}>
            <FormulaireProduit mode="create" />
          </RequireAuth>
        }
      />
      <Route
        path="/gestion-produit/:id"
        element={
          <RequireAuth allowedRoles={['gestionnaire de stock']}>
            <ProductDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/gestion-produit/:id/edit"
        element={
          <RequireAuth allowedRoles={['gestionnaire de stock']}>
            <FormulaireProduit mode="edit" />
          </RequireAuth>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
