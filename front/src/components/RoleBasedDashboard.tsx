import React from 'react';

/* Back-office */
import DashboardSuperAdmin from '../pages/DashboardSuperAdmin';
import DashboardAdmin from '../pages/DashboardAdmin';

/* Livraison */
import DashboardAdminVentes from '../pages/DashboardAdminVentes';
import DashboardLivreur from '../pages/DashboardLivreur';
import DashboardChauffeur from '../pages/DashboardChauffeur';

/* Pré-vente */
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur from '../pages/DashboardPreVendeur';

/* Entrepôt */
import DashboardGestionStock from '../pages/DashboardGestionStock';
import DashboardControleur from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';

/* Responsable dépôt */
import DashboardResponsableDepot from '../pages/DashboardResponsableDepot';

/* Client */
import DashboardClient from '../pages/DashboardClient';

const mapping: Record<string, React.FC> = {
  /* Back-office */
  'super admin': DashboardSuperAdmin,
  'admin': DashboardAdmin,

  /* Livraison */
  'administrateur des ventes': DashboardAdminVentes,
  'livreur': DashboardLivreur,
  'chauffeur': DashboardChauffeur,

  /* Pré-vente */
  'superviseur des ventes': DashboardSuperviseurVentes,
  'pré vendeur': DashboardPreVendeur,

  /* Entrepôt */
  'gestionnaire de stock': DashboardGestionStock,
  'contrôleur': DashboardControleur,
  'manutentionnaire': DashboardManutentionnaire,

  /* Responsable dépôt */
  'responsable depot': DashboardResponsableDepot,

  /* Client */
  'client': DashboardClient,
};

export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  const { fonction, role } = JSON.parse(raw) as {
    fonction?: string;
    role: string;
  };

  // On priorise la fonction si elle existe, sinon le rôle
  const key = (fonction ?? role).trim().toLowerCase();
  const Component = mapping[key];

  if (!Component) {
    return (
      <p style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        Rôle non reconnu : <code>{fonction ?? role}</code>
      </p>
    );
  }
  return <Component />;
}
