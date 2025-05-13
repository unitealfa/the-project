// front/src/components/RoleBasedDashboard.tsx
import React from 'react';

/* Back-office */
import DashboardSuperAdmin    from '../pages/DashboardSuperAdmin';
import DashboardAdmin         from '../pages/DashboardAdmin';

/* Livraison */
import DashboardAdminVentes   from '../pages/DashboardAdminVentes';
import DashboardLivreur       from '../pages/DashboardLivreur';
import DashboardChauffeur     from '../pages/DashboardChauffeur';

/* Pré-vente */
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur    from '../pages/DashboardPreVendeur';

/* Entrepôt / Stock */
import DashboardGestionStock  from '../pages/DashboardGestionStock';
import DashboardControleur    from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';

/* Responsable dépôt */
import DashboardResponsableDepot from '../pages/DashboardResponsableDepot';

/* Client */
import DashboardClient         from '../pages/DashboardClient';

const mapping: Record<string, React.FC> = {
  /* Back-office */
  'super admin': DashboardSuperAdmin,
  'admin'      : DashboardAdmin,

  /* Livraison */
  'administrateur des ventes': DashboardAdminVentes,
  'livreur'  : DashboardLivreur,
  'chauffeur': DashboardChauffeur,

  /* Pré-vente */
  'superviseur des ventes': DashboardSuperviseurVentes,
  'pré-vendeur'            : DashboardPreVendeur,

  /* Entrepôt / Gestion de stock */
  'entrepot'               : DashboardGestionStock,
  'gestionnaire de stock'  : DashboardGestionStock,
  'Gestionnaire de stock'  : DashboardGestionStock,
  'contrôleur'             : DashboardControleur,
  'manutentionnaire'       : DashboardManutentionnaire,

  /* Responsable dépôt */
  'responsable depot': DashboardResponsableDepot,

  /* Client */
  'Client' : DashboardClient,
  'client' : DashboardClient,
};

export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  const { role } = JSON.parse(raw) as { role: string };
  // Normaliser la casse du rôle
  const normalizedRole = role.toLowerCase();
  const Component = mapping[normalizedRole];

  if (!Component) {
    return (
      <p style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        Rôle non reconnu : <code>{role}</code>
      </p>
    );
  }

  return <Component />;
}
