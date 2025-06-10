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

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur: { nom: string; prenom: string };
  livreur: { nom: string; prenom: string };
}

const mockVehicles: Vehicle[] = [
  { id: "1", make: "Mercedes", model: "Sprinter", year: "2023", license_plate: "AB-123-CD", chauffeur: { nom: "Dupont", prenom: "Jean" }, livreur: { nom: "Martin", prenom: "Pierre" } },
  { id: "2", make: "Ford",    model: "Transit",  year: "2022", license_plate: "EF-456-GH", chauffeur: { nom: "Bernard", prenom: "Marie" }, livreur: { nom: "Durand", prenom: "Paul" } },
  { id: "3", make: "Iveco",   model: "Daily",    year: "2024", license_plate: "IJ-789-KL", chauffeur: { nom: "Moreau",  prenom: "Sophie" }, livreur: { nom: "Leroy", prenom: "Marc" } },
];

const utilisateurConnecte = {
  nomDepot: "Dépôt Central",
};

export default function DashboardAdminVentes() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = {
    nom: "Azzedine",
    prenom: "B.",
    company: "LogiTech Solutions",
    role: "Admin Ventes",
    depot: utilisateurConnecte.nomDepot,
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
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
                <span className="font-bold">{user.depot}</span>
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
                    {mockVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-4 font-bold">{v.make} {v.model} <span>({v.license_plate})</span></td>
                        <td className="p-4 font-bold">{v.chauffeur.prenom} {v.chauffeur.nom}</td>
                        <td className="p-4 font-bold">{v.livreur.prenom} {v.livreur.nom}</td>
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
