// ✅ FRONTEND - App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import DashboardResponsableDepot from "./pages/DashboardResponsableDepot";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardGestionStock from "./pages/DashboardGestionStock";
import DashboardAdminVentes from "./pages/DashboardAdminVentes";
import VehiculesList from "./pages/VehiculesList";
import AddVehicle from "./pages/AddVehicle";
import VehicleDetail from "./pages/VehicleDetail";
import EditVehicle from "./pages/EditVehicle";

import CreateCompany from "./pages/CreateCompany";
import CompaniesList from "./pages/CompaniesList";
import CompanyDetail from "./pages/CompanyDetail";
import CompanyEdit from "./pages/CompanyEdit";

import CreateDepot from "./pages/CreateDepot";
import DepotsList from "./pages/DepotsList";
import DepotDetail from "./pages/DepotDetail";
import DepotEdit from "./pages/DepotEdit";

import Teams from "./pages/Teams";
import TeamManage from "./pages/TeamManage";
import DeliveryTeam from "./pages/DeliveryTeam";
import AddMember from "./pages/AddMember";
import PreventeTeam from "./pages/PreventeTeam";
import AddPrevente from "./pages/AddPrevente";
import EntrepotTeam from "./pages/EntrepotTeam";
import AddEntrepot from "./pages/AddEntrepot";

import ClientsList from "./pages/ClientsList";
import AddClient from "./pages/AddClient";
import EditClient from "./pages/EditClient";
import ClientDetail from "./pages/ClientDetail";

import ProductDetail from "./pages/ProductDetail";
import ProductEdit from "./pages/ProductEdit";
import GestionDepot from "./pages/GestionDepot";
import AddProduct from "./pages/AddProduct";

import RequireAuth from "./components/RequireAuth";
import DeliveryMemberDetails from "./pages/DeliveryMemberDetails";
import EditDeliveryMember from "./pages/EditDeliveryMember";
import DetailEntrepotMember from "./pages/DetailEntrepotMember";
import EditEntrepotMember from "./pages/EditEntrepotMember";
import EditPreventeMember from "./pages/EditPreventeMember";
import DetailPreventeMember from "./pages/DetailPreventeMember";
import ProductClient from "./pages/ProductClient";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ProductList from "./pages/ProductList";

import Commandes from "@/pages/Commandes";
import HistoriqueOrders from "./pages/HistoriqueOrders";

import PlanifierTournee from "./pages/PlanifierTournee";
import TourneesList from "./pages/TourneesList";
import TourneeDetail from "./pages/TourneeDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleBasedDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-admin"
        element={
          <RequireAuth allowedRoles={["admin", "super admin"]}>
            <DashboardAdmin />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-responsable"
        element={
          <RequireAuth allowedRoles={["responsable depot"]}>
            <DashboardResponsableDepot />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard-stock"
        element={
          <RequireAuth allowedRoles={["gestionnaire de stock"]}>
            <DashboardGestionStock />
          </RequireAuth>
        }
      />

      <Route
        path="/create-company"
        element={
          <RequireAuth allowedRoles={["super admin"]}>
            <CreateCompany />
          </RequireAuth>
        }
      />
      <Route
        path="/companies"
        element={
          <RequireAuth allowedRoles={["super admin"]}>
            <CompaniesList />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <RequireAuth allowedRoles={["super admin", "admin"]}>
            <CompanyDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/companies/:id/edit"
        element={
          <RequireAuth allowedRoles={["super admin"]}>
            <CompanyEdit />
          </RequireAuth>
        }
      />

      <Route
        path="/create-depot"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <CreateDepot />
          </RequireAuth>
        }
      />
      <Route
        path="/depots"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <DepotsList />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <DepotDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/depots/:id/edit"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <DepotEdit />
          </RequireAuth>
        }
      />

      <Route
        path="/teams"
        element={
          <RequireAuth allowedRoles={["admin"]}>
            <Teams />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <TeamManage />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/livraison"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DeliveryTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/livraison/add"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <AddMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/detail-delivery"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DeliveryMemberDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/edit-delivery"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditDeliveryMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/detail-delivery"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DeliveryMemberDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/edit-delivery"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditDeliveryMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/prevente"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <PreventeTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/prevente/add"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <AddPrevente />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/detail-prevente"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DetailPreventeMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/edit-prevente"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditPreventeMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/detail-prevente"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DetailPreventeMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/edit-prevente"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditPreventeMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/entrepot"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EntrepotTeam />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/entrepot/add"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <AddEntrepot />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/detail-entrepot"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <DetailEntrepotMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/members/:memberId/edit-entrepot"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditEntrepotMember />
          </RequireAuth>
        }
      />
      <Route
        path="/teams/:depotId/entrepot/add"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <AddEntrepot />
          </RequireAuth>
        }
      />

      <Route
        path="/clients"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot", "Pré-vendeur"]}>
            <ClientsList />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/add"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <AddClient />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot", "Pré-vendeur"]}>
            <ClientDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/clients/:id/edit"
        element={
          <RequireAuth allowedRoles={["admin", "responsable depot"]}>
            <EditClient />
          </RequireAuth>
        }
      />

      <Route
        path="/product-detail/:id"
        element={
          <RequireAuth allowedRoles={["admin", "gestionnaire de stock"]}>
            <ProductDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/product-edit/:id"
        element={
          <RequireAuth allowedRoles={["admin", "gestionnaire de stock"]}>
            <ProductEdit />
          </RequireAuth>
        }
      />
      <Route
        path="/add-product"
        element={
          <RequireAuth allowedRoles={["admin", "gestionnaire de stock"]}>
            <AddProduct />
          </RequireAuth>
        }
      />
      <Route
        path="/gestion-depot/:depotId"
        element={
          <RequireAuth allowedRoles={["gestionnaire de stock"]}>
            <GestionDepot />
          </RequireAuth>
        }
      />

      <Route
        path="/productclient"
        element={
          <RequireAuth allowedRoles={["client"]}>
            <ProductClient />
          </RequireAuth>
        }
      />

      <Route
        path="/cart"
        element={
          <RequireAuth allowedRoles={["client"]}>
            <Cart />
          </RequireAuth>
        }
      />

      <Route
        path="/wishlist"
        element={
          <RequireAuth allowedRoles={["client"]}>
            <Wishlist />
          </RequireAuth>
        }
      />

      <Route
        path="/productlist"
        element={
          <RequireAuth allowedRoles={["Pré-vendeur"]}>
            <ProductList />
          </RequireAuth>
        }
      />

      <Route
        path="/admin-ventes"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <DashboardAdminVentes />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-ventes/vehicules"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <VehiculesList />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-ventes/vehicules/ajouter"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <AddVehicle />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-ventes/vehicules/:id"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <VehicleDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/admin-ventes/vehicules/:id/modifier"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <EditVehicle />
          </RequireAuth>
        }
      />
      <Route
        path="/commandes"
        element={
          <RequireAuth allowedRoles={["Superviseur des ventes"]}>
            <Commandes />
          </RequireAuth>
        }
      />

      <Route
        path="/historiqueorders"
        element={
          <RequireAuth>
            <HistoriqueOrders />
          </RequireAuth>
        }
      />

      {/* … vos routes admin-ventes existantes … */}

      <Route
        path="/admin-ventes/planifier-tournee"
        element={
          <RequireAuth allowedRoles={["Administrateur des ventes"]}>
            <PlanifierTournee />
          </RequireAuth>
        }
      />

      <Route
        path="/tournees"
        element={
          <RequireAuth allowedRoles={["manutentionnaire", "contrôleur"]}>
            <TourneesList />
          </RequireAuth>
        }
      />

      <Route
        path="/tournees/:id"
        element={
          <RequireAuth allowedRoles={["manutentionnaire", "contrôleur"]}>
            <TourneeDetail />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
