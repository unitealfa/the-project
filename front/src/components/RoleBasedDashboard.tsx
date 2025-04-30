import React from 'react';

/* back-office */
import DashboardSuperAdmin from '../pages/DashboardSuperAdmin';
import DashboardAdmin      from '../pages/DashboardAdmin';

/* équipe Livraison */
import DashboardAdminVentes from '../pages/DashboardAdminVentes';
import DashboardLivreur     from '../pages/DashboardLivreur';
import DashboardChauffeur   from '../pages/DashboardChauffeur';

/* équipe Pré-vente */
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur        from '../pages/DashboardPreVendeur';

/* équipe Entrepôt */
import DashboardGestionStock   from '../pages/DashboardGestionStock';
import DashboardControleur     from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';

/* clé (fonction OU rôle) → composant */
const mapping: Record<string, React.FC> = {
  /* back-office */
  'Super Admin'               : DashboardSuperAdmin,
  'Admin'                     : DashboardAdmin,

  /* livraison */
  'Administrateur des ventes' : DashboardAdminVentes,
  'Livreur'                   : DashboardLivreur,
  'Chauffeur'                 : DashboardChauffeur,

  /* pré-vente */
  'Superviseur des ventes'    : DashboardSuperviseurVentes,
  'Pré vendeur'               : DashboardPreVendeur,

  /* entrepôt */
  'Gestionnaire de stock'     : DashboardGestionStock,
  'Contrôleur'                : DashboardControleur,
  'Manutentionnaire'          : DashboardManutentionnaire,
};

export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;                       // sécurité
  const { fonction, role } = JSON.parse(raw) as {
    fonction?: string; role:string;
  };

  const key = fonction ?? role;
  const Dash = mapping[key];

  return Dash
    ? <Dash/>
    : <p style={{padding:'1rem'}}>Rôle non reconnu : <code>{key}</code></p>;
}
