import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  BarChart3,
  Car,
  Users,
  Package,
  Calendar,
  AlertCircle,
  X,
  Truck,
  UserCheck,
  TrendingUp,
  Clock,
  Building,
  ShoppingCart,
  FileText,
  XCircle,
  PieChart,
} from "lucide-react";
import "../pages-css/DashboardAdminVentes.css";
import { apiFetch } from "../utils/api";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur: { nom: string; prenom: string };
  livreur: { nom: string; prenom: string };
}

const utilisateurConnecte = {
  nomDepot: "Dépôt Central",
};

export default function DashboardAdminVentes() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>("");
  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  // Nouveau : récupère directement le nom du dépôt
  const depotName = user?.nomDepot || utilisateurConnecte.nomDepot || user?.depot || "";

  if (!user) {
    return (
      <div className="brutalist-container">
        <p className="brutalist-text-medium">
          Utilisateur non trouvé. Veuillez vous reconnecter.
        </p>
      </div>
    );
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadVehicles = async () => {
    if (!user?.depot) {
      setError("Aucun dépôt associé à votre compte");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`/vehicles?depot=${encodeURIComponent(user.depot!)}`);
      const result = await res.json();

      // 1) Récupère array quel que soit le format
      const rawList: any[] = Array.isArray(result)
        ? result
        : Array.isArray(result.vehicles)
          ? result.vehicles
          : [];

      // 2) Normalise chauffeur_id ↔ chauffeur, et livreur_id ↔ livreur
      const list: Vehicle[] = rawList.map(v => ({
        _id          : v._id,
        make         : v.make,
        model        : v.model,
        year         : v.year,
        license_plate: v.license_plate,
        chauffeur    : v.chauffeur ?? v.chauffeur_id!,
        livreur      : v.livreur ?? v.livreur_id!,
      }));

      // 3) Filtre ceux qui ont bien chauffeur ET livreur
      const withPersonnel = list.filter(v => v.chauffeur && v.livreur);
      setVehicles(withPersonnel);
    } catch (e: any) {
      setError(e.message || "Erreur chargement véhicules");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    loadVehicles();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="brutalist-container">

        {/* Header Card */}
        <div className="brutalist-card brutalist-spacing-large">
          <div className="brutalist-card-header">
            <div className="brutalist-card-title">
              <BarChart3 className="mr-2" />
              TABLEAU DE BORD — ADMINISTRATEUR DES VENTES
            </div>
            <div className="brutalist-header-widgets">
              <div className="brutalist-time-widget">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-black">{currentTime.toLocaleTimeString("fr-FR")}</span>
              </div>
              <div className="brutalist-user-info">
                <Building className="w-5 h-5 mr-2" />
                <span className="font-bold">{depotName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Principales */}
        <div className="brutalist-grid-4 brutalist-spacing-large">
          <button className="brutalist-action-button brutalist-action-blue" onClick={() => navigate("/admin-ventes/vehicules")}>
            <Car className="brutalist-btn-icon" />
            <span>GÉRER LES VÉHICULES</span>
          </button>

          <button className="brutalist-action-button brutalist-action-green" onClick={() => navigate(`/clients?depot=${user.depot}`)}>
            <Users className="brutalist-btn-icon" />
            <span>VOIR LES CLIENTS</span>
          </button>

          <button className="brutalist-action-button brutalist-action-purple" onClick={handleOpenModal}>
            <Truck className="brutalist-btn-icon" />
            <span>
              VÉHICULES AVEC<br/>PERSONNEL
            </span>
          </button>

          <button className="brutalist-action-button brutalist-action-orange" onClick={() => navigate(`/admin-ventes/planifier-tournee?depot=${user.depot}`)}>
            <Calendar className="brutalist-btn-icon" />
            <span>PLANIFIER UNE TOURNÉE</span>
          </button>
        </div>

        {/* Cartes détaillées (entièrement cliquables) */}
        <div className="brutalist-detailed-section">

          {/* Commandes */}
          <div
            className="brutalist-detailed-card brutalist-card-commandes cursor-pointer"
            onClick={() => navigate("/orders")}
          >
            <div className="brutalist-detailed-header">
              <div className="brutalist-icon-container">
                <ShoppingCart className="w-8 h-8" />
                <div className="brutalist-icon-accent">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="brutalist-detailed-content">
              <h3 className="brutalist-main-title">COMMANDES</h3>
              <p className="brutalist-subtitle">GESTION & SUIVI</p>
            </div>
          </div>

          {/* Réclamations */}
          <div
            className="brutalist-detailed-card brutalist-card-reclamations cursor-pointer"
            onClick={() => navigate("/reclamations")}
          >
            <div className="brutalist-detailed-header">
              <div className="brutalist-icon-container">
                <AlertCircle className="w-8 h-8" />
                <div className="brutalist-icon-accent brutalist-accent-urgent">
                  <XCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="brutalist-detailed-content">
              <h3 className="brutalist-main-title">RÉCLAMATIONS</h3>
              <p className="brutalist-subtitle">TRAITEMENT PRIORITAIRE</p>
            </div>
          </div>

          {/* Statistiques */}
          <div
            className="brutalist-detailed-card brutalist-card-statistiques cursor-pointer"
            onClick={() => navigate("/stats-ventes")}
          >
            <div className="brutalist-detailed-header">
              <div className="brutalist-icon-container">
                <TrendingUp className="w-8 h-8" />
                <div className="brutalist-icon-accent brutalist-accent-stats">
                  <PieChart className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="brutalist-detailed-content">
              <h3 className="brutalist-main-title">STATISTIQUES</h3>
              <p className="brutalist-subtitle">ANALYTICS & RAPPORTS</p>
            </div>
          </div>

        </div>

        {/* Modal Véhicules */}
        {isModalOpen && (
          <div className="brutalist-modal-overlay">
            <div className="brutalist-modal">
              <button className="brutalist-button" onClick={() => setIsModalOpen(false)}>
                <X />
              </button>
              <h2 className="brutalist-modal-title">
                <Package className="mr-2" />
                Véhicules avec chauffeur et livreur
              </h2>
              {loading ? (
                <div className="text-center p-8">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-black border-t-transparent rounded-full" />
                  <p className="brutalist-text-medium uppercase mt-2">Chargement...</p>
                </div>
              ) : error ? (
                <div className="text-center p-6">
                  <AlertCircle className="w-6 h-6 text-red-800 mx-auto" />
                  <p className="brutalist-text-medium uppercase mt-2">{error}</p>
                </div>
              ) : (
                <table className="brutalist-table">
                  <thead>
                    <tr>
                      <th>
                        <div className="flex items-center gap-2"><Car /> Véhicule</div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2"><UserCheck /> Chauffeur</div>
                      </th>
                      <th>
                        <div className="flex items-center gap-2"><Package /> Livreur</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length === 0 && !loading && !error && (
                      <tr><td colSpan={3} className="text-center p-8">Aucun véhicule disponible</td></tr>
                    )}
                    {vehicles.map(v => (
                      <tr key={v._id} className="hover:bg-gray-50">
                        <td data-label="Véhicule" className="p-4 font-bold">
                          {v.make} {v.model} <span>({v.license_plate})</span>
                        </td>
                        <td data-label="Chauffeur" className="p-4 font-bold">
                          {`${v.chauffeur.prenom} ${v.chauffeur.nom}`}
                        </td>
                        <td data-label="Livreur" className="p-4 font-bold">
                          {`${v.livreur.prenom} ${v.livreur.nom}`}
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
    </div>
  );
}
