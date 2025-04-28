// front/src/components/RoleBasedDashboard.tsx

import React from 'react';
import DashboardSuperAdmin from '../pages/DashboardSuperAdmin';
import DashboardAdmin      from '../pages/DashboardAdmin';
// importez ici vos futurs dashboards, par exemple DashboardEditor, DashboardViewer, etc.

const mapping: Record<string, React.FC> = {
  'Super Admin': DashboardSuperAdmin,
  'Admin':       DashboardAdmin,
  // 'Editor': DashboardEditor,
  // 'Viewer': DashboardViewer,
};

export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;  // on ne devrait jamais arriver ici sans RequireAuth
  const { role } = JSON.parse(raw) as { role: string };

  const Component = mapping[role];
  if (!Component) {
    return <p style={{ padding: '1rem' }}>Rôle inconnu : {role}</p>;
  }
  return <Component />;
}
