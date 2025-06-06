// front/src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../pages-css/sidebar/Sidebar.css';
import logoMini from '../assets/logo-routimizemini.png';

export default function Sidebar() {
  const [active, setActive] = useState(false);

  function toggleSidebar() {
    setActive(prev => !prev);
  }

  function closeSidebar() {
    setActive(false);
  }

  // Récupération du rôle et dépôt depuis localStorage
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  const user = JSON.parse(raw) as { role: string; depot?: string };
  const role = (user.role || '').toLowerCase();
  const depotId = user.depot;

  // Définition des items en fonction du rôle
  let items: { label: string; path: string }[] = [];
  switch (role) {
    case 'client':
      items = [
        { label: 'Produits disponibles', path: '/productclient' },
        { label: 'Mon panier', path: '/cart' },
        { label: 'Historique de mes commandes', path: '/historiqueorders' },
      ];
      break;
    case 'super admin':
      items = [{ label: 'Liste des entreprises', path: '/companies' }];
      break;
    case 'admin':
      items = [
        { label: 'Statistiques globales', path: '/admin/stats' },
        { label: 'Mes dépôts', path: '/depots' },
        { label: 'Liste des clients', path: '/clients' },
      ];
      break;
    case 'responsable depot':
      items = [
        { label: "Gestion de l'équipe", path: '/teams' },
        { label: 'Liste des clients', path: '/clients' },
        { label: 'Statistiques des ventes', path: '/stats-ventes' },
      ];
      break;
    case 'gestionnaire de stock':
      items = [
        {
          label: 'Produits de votre dépôt',
          path: depotId ? `/gestion-depot/${depotId}` : '/dashboard-stock',
        },
      ];
      break;
    case 'contrôleur':
      items = [{ label: 'Tournées du dépôt', path: '/tournees' }];
      break;
    case 'manutentionnaire':
      items = [{ label: 'Tournées du dépôt', path: '/tournees' }];
      break;
    case 'superviseur des ventes':
      items = [
        { label: 'Liste des clients', path: '/clients' },
        { label: 'Affectation des prévendeurs', path: '/assign-prevendeurs' },
        { label: 'Liste des commandes', path: '/orders' },
      ];
      break;
    case 'pré-vendeur':
      items = [{ label: 'Liste des clients', path: '/clients' }];
      break;
    case 'administrateur des ventes':
      items = [
        { label: 'Gérer les véhicules', path: '/admin-ventes/vehicules' },
        {
          label: 'Voir les clients du dépôt',
          path: depotId ? `/clients?depot=${depotId}` : '/clients',
        },
        {
          label: 'Planifier une tournée',
          path: depotId
            ? `/admin-ventes/planifier-tournee?depot=${depotId}`
            : '/admin-ventes/planifier-tournee',
        },
        { label: 'Voir les commandes', path: '/orders' },
        { label: 'Voir les réclamations', path: '/reclamations' },
        { label: 'Voir les statistiques', path: '/stats-ventes' },
      ];
      break;
    case 'livreur':
      items = [{ label: 'Commandes à livrer', path: '/livreur/commandes' }];
      break;
    case 'chauffeur':
      items = [{ label: 'Voir mes tournées', path: '/chauffeur/tournees' }];
      break;
    default:
      items = [];
  }

  // Toujours ajouter "Home" à la fin
  items.push({ label: 'Home', path: '/dashboard' });

  return (
    <>
      {/* Overlay si le sidebar est ouvert */}
      {active && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* Sidebar */}
      <div id="sidebar" className={active ? 'active' : ''}>
        {/* Bouton toggle (logo inversé) */}
        <div className="toggle-btn" onClick={toggleSidebar}>
          <img
            src={logoMini}
            alt="Toggle Sidebar"
            className="toggle-logo-img"
          />
        </div>

        {/* Liste des liens */}
        <div className="list">
          {items.map(({ label, path }) => (
            <div
              key={label}
              className="item"
              onClick={closeSidebar}
            >
              <Link to={path}>{label}</Link>
            </div>
          ))}
        </div>

        {/* Footer facultatif */}
        {/* 
        <div className="footer">
          <button className="footer-button">Déconnexion</button>
        </div>
        */}
      </div>
    </>
  );
}
