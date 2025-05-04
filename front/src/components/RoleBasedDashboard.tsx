import React from 'react';

/* ───────── Dashboards Back‑office ───────── */
import DashboardSuperAdmin    from '../pages/DashboardSuperAdmin';
import DashboardAdmin         from '../pages/DashboardAdmin';

/* ───────── Dashboards Livraison ─────────── */
import DashboardAdminVentes   from '../pages/DashboardAdminVentes';
import DashboardLivreur       from '../pages/DashboardLivreur';
import DashboardChauffeur     from '../pages/DashboardChauffeur';

/* ───────── Dashboards Pré‑vente ─────────── */
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur        from '../pages/DashboardPreVendeur';

/* ───────── Dashboards Entrepôt ──────────── */
import DashboardGestionStock     from '../pages/DashboardGestionStock';
import DashboardControleur       from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';

/* ───────── Dashboard Responsable dépôt ─── */
import DashboardResponsableDepot from '../pages/DashboardResponsableDepot';

/* ───────── Dashboard Client ────────────── */
import DashboardClient from '../pages/DashboardClient';

/**
 * 🔑 Table de correspondance : rôle (ou fonction) → composant dashboard
 * 
 * On tente d’abord avec `fonction`, puis avec `role` (si pas de fonction précisée)
 */
const mapping: Record<string, React.FC> = {
  /* Back‑office */
  'Super Admin'               : DashboardSuperAdmin,
  'Admin'                     : DashboardAdmin,

  /* Livraison */
  'Administrateur des ventes' : DashboardAdminVentes,
  'Livreur'                   : DashboardLivreur,
  'Chauffeur'                 : DashboardChauffeur,

  /* Pré‑vente */
  'Superviseur des ventes'    : DashboardSuperviseurVentes,
  'Pré vendeur'               : DashboardPreVendeur,

  /* Entrepôt */
  'Gestionnaire de stock'     : DashboardGestionStock,
  'Contrôleur'                : DashboardControleur,
  'Manutentionnaire'          : DashboardManutentionnaire,

  /* Responsable dépôt */
  'responsable depot'         : DashboardResponsableDepot,

  /* Client */
  'Client'                    : DashboardClient,
};

/**
 * Composant principal appelé dynamiquement selon le rôle connecté
 */
export default function RoleBasedDashboard() {
  // 🔐 Récupération des infos stockées dans localStorage
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  // On extrait la fonction (prioritaire) ou à défaut le rôle
  const { fonction, role } = JSON.parse(raw) as {
    fonction?: string;
    role: string;
  };

  // Nettoyage de la clé (évite espaces ou capitalisation incohérente)
  const key  = (fonction ?? role)?.trim();
  const Dash = mapping[key?.toLowerCase()] || mapping[key]; // on tente minuscule ou original

  // Si on a un dashboard connu : on l'affiche, sinon message erreur
  return Dash
    ? <Dash />
    : (
      <p style={{ padding: '1rem' }}>
        Rôle non reconnu : <code>{key}</code>
      </p>
    );
}
