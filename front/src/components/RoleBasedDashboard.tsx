import React from 'react';

/* ───────── Back‑office ───────── */
import DashboardSuperAdmin    from '../pages/DashboardSuperAdmin';
import DashboardAdmin         from '../pages/DashboardAdmin';

/* ───────── Livraison ─────────── */
import DashboardAdminVentes   from '../pages/DashboardAdminVentes';
import DashboardLivreur       from '../pages/DashboardLivreur';
import DashboardChauffeur     from '../pages/DashboardChauffeur';

/* ───────── Pré‑vente ─────────── */
import DashboardSuperviseurVentes from '../pages/DashboardSuperviseurVentes';
import DashboardPreVendeur        from '../pages/DashboardPreVendeur';

/* ───────── Entrepôt ──────────── */
import DashboardGestionStock   from '../pages/DashboardGestionStock';
import DashboardControleur     from '../pages/DashboardControleur';
import DashboardManutentionnaire from '../pages/DashboardManutentionnaire';

/* ───────── Responsable dépôt ─── */
import DashboardResponsableDepot from '../pages/DashboardResponsableDepot';

/* clé (fonction OU rôle) → composant ------------------------------- */
const mapping: Record<string, React.FC> = {
  /* back‑office */
  'Super Admin'               : DashboardSuperAdmin,
  'Admin'                     : DashboardAdmin,

  /* livraison */
  'Administrateur des ventes' : DashboardAdminVentes,
  'Livreur'                   : DashboardLivreur,
  'Chauffeur'                 : DashboardChauffeur,

  /* pré‑vente */
  'Superviseur des ventes'    : DashboardSuperviseurVentes,
  'Pré vendeur'               : DashboardPreVendeur,

  /* entrepôt */
  'Gestionnaire de stock'     : DashboardGestionStock,
  'Contrôleur'                : DashboardControleur,
  'Manutentionnaire'          : DashboardManutentionnaire,

  /* responsable dépôt */
  'responsable depot'         : DashboardResponsableDepot,      // ← nouveau
};

/* ───────── Composant principal ─────────────────────────────────── */
export default function RoleBasedDashboard() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;                                 // sécurité

  const { fonction, role } = JSON.parse(raw) as {
    fonction?: string; role: string;
  };

  /* on privilégie la fonction (si définie), sinon le rôle */
  const key  = (fonction ?? role)?.trim();
  const Dash = mapping[key.toLowerCase()] || mapping[key]; // tolère casse

  return Dash
    ? <Dash />
    : (
      <p style={{ padding: '1rem' }}>
        Rôle non reconnu&nbsp;: <code>{key}</code>
      </p>
    );
}
