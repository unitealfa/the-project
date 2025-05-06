import React from 'react';
import DashboardSuperAdmin    from '../pages/DashboardSuperAdmin';
import DashboardAdmin         from '../pages/DashboardAdmin';
import DashboardAdminVentes   from '../pages/DashboardAdminVentes';
import DashboardLivreur       from '../pages/DashboardLivreur';
import DashboardChauffeur     from '../pages/DashboardChauffeur';
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur    from '../pages/DashboardPreVendeur';
import DashboardGestionStock  from '../pages/DashboardGestionStock';
import DashboardControleur    from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';
import DashboardResponsableDepot from '../pages/DashboardResponsableDepot';
import DashboardClient         from '../pages/DashboardClient';

const mapping: Record<string, React.FC> = {
  'Super Admin': DashboardSuperAdmin,
  'Admin'      : DashboardAdmin,
  'livraison'  : DashboardLivreur,
  'chauffeur'  : DashboardChauffeur,
  'Administrateur des ventes': DashboardAdminVentes,
  'prevente'   : DashboardPreVendeur,
  'Superviseur des ventes': DashboardSuperviseurVentes,
  'entrepot'   : DashboardGestionStock,      // générique
  'Contrôleur': DashboardControleur,
  'Manutentionnaire': DashboardManutentionnaire,
  'responsable depot': DashboardResponsableDepot,
  'client'     : DashboardClient,
};

export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  const { role } = JSON.parse(raw) as { role: string };
  const Component = mapping[role];
  if (!Component) return <p style={{ padding:'2rem', fontFamily:'Arial' }}>Rôle non reconnu : <code>{role}</code></p>;
  return <Component />;
}
