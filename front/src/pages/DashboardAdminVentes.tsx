// src/pages/DashboardAdminVentes.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../pages-css/DashboardAdminVentes.css";
import {
  Car,
  Users,
  Package,
  BarChart3,
  Calendar,
  FileText,
  AlertCircle,
  X,
  Truck,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "../utils/api";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: { _id: string; nom: string; prenom: string } | undefined;
  livreur_id: { _id: string; nom: string; prenom: string } | undefined;
}

const DashboardAdminVentes: React.FC = () => {
  const rawUser = localStorage.getItem("user");
  const user: {
    nom: string;
    prenom: string;
    company?: string;
    role?: string;
    depot?: string;
    email?: string;
  } | null = rawUser ? JSON.parse(rawUser) : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadVehicles = async () => {
    if (!user?.depot) {
      setError("Aucun dépôt associé à votre compte");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1) Utiliser apiFetch comme à l'origine
      const response = await apiFetch(`/vehicles?depot=${user.depot}`);
      const result = await response.json();

      // 2) Repérer où se trouve vraiment le tableau
      //    soit result est déjà un array, soit result.vehicles
      const list: Vehicle[] = Array.isArray(result)
        ? result
        : Array.isArray(result.vehicles)
          ? result.vehicles
          : [];

      // 3) Filtrer ceux qui ont chauffeur ET livreur
      const vehiclesWithPersonnel = list.filter(
        (v) => v.chauffeur_id && v.livreur_id
      );
      setVehicles(vehiclesWithPersonnel);

      if (vehiclesWithPersonnel.length === 0) {
        setError("Aucun véhicule avec chauffeur et livreur trouvé dans ce dépôt");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des véhicules");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadVehicles();
  };

  if (!user) {
    return (
      <div className="brutalist-container">
        <p className="brutalist-text-medium">
          Utilisateur non trouvé. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />

      <main className="brutalist-container">
        {/* Welcome Card */}
        <div className="brutalist-card brutalist-spacing-large">
          <div className="brutalist-card-header">
            <div className="brutalist-card-title">
              <BarChart3 className="mr-2" />
              Tableau de Bord — Administrateur des Ventes
            </div>
          </div>
        </div>

        {/* Actions Principales */}
        <div className="brutalist-grid-4 brutalist-spacing-large">
          <button
            className="brutalist-action-button"
            onClick={() => navigate("/admin-ventes/vehicules")}
          >
            <Car className="mb-1" />
            Gérer les véhicules
          </button>

          <button
            className="brutalist-action-button"
            onClick={() => navigate(`/clients?depot=${user.depot}`)}
          >
            <Users className="mb-1" />
            Voir les clients
          </button>

          <button
            className="brutalist-action-button"
            onClick={handleOpenModal}
          >
            <Truck className="mb-1" />
            Véhicules avec personnel
          </button>

          <button
            className="brutalist-action-button"
            onClick={() =>
              navigate(`/admin-ventes/planifier-tournee?depot=${user.depot}`)
            }
          >
            <Calendar className="mb-1" />
            Planifier une tournée
          </button>
        </div>

        {/* Actions Rapides */}
        <div className="brutalist-grid-3 brutalist-spacing-large">
          <button
            className="brutalist-medium-button"
            onClick={() => navigate("/orders")}
          >
            <FileText className="mr-2" />
            Commandes
          </button>

          <button
            className="brutalist-medium-button"
            onClick={() => navigate("/reclamations")}
          >
            <AlertCircle className="mr-2" />
            Réclamations
          </button>

          <button
            className="brutalist-medium-button"
            onClick={() => navigate("/stats-ventes")}
          >
            <TrendingUp className="mr-2" />
            Statistiques
          </button>
        </div>

        {/* Modal Véhicules */}
        {isModalOpen && (
          <div className="brutalist-modal-overlay">
            <div className="brutalist-modal">
              <button
                className="brutalist-button"
                onClick={() => setIsModalOpen(false)}
              >
                <X />
              </button>
              <h2 className="brutalist-modal-title">
                <Package className="mr-2" />
                Véhicules avec chauffeur et livreur
              </h2>

              {loading ? (
                <div className="text-center p-8">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
                  <p className="brutalist-text-medium uppercase mt-2">
                    Chargement...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center p-6">
                  <AlertCircle className="w-6 h-6 text-red-800 mx-auto" />
                  <p className="brutalist-text-medium uppercase mt-2">
                    {error}
                  </p>
                </div>
              ) : (
                <table className="brutalist-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="flex items-center gap-2">
                          <Car />
                          Véhicule
                        </div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <UserCheck />
                          Chauffeur
                        </div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2">
                          <Package />
                          Livreur
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center p-8">
                          <AlertCircle className="w-12 h-12 mx-auto text-gray-400" />
                          <p className="brutalist-text-medium uppercase mt-2">
                            Aucun véhicule trouvé.
                          </p>
                        </td>
                      </tr>
                    )}
                    {vehicles.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">
                          {v.make} {v.model} <span>({v.license_plate})</span>
                        </td>
                        <td className="p-4 font-bold">
                          {v.chauffeur_id
                            ? `${v.chauffeur_id.prenom} ${v.chauffeur_id.nom}`
                            : "—"}
                        </td>
                        <td className="p-4 font-bold">
                          {v.livreur_id
                            ? `${v.livreur_id.prenom} ${v.livreur_id.nom}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default DashboardAdminVentes;
