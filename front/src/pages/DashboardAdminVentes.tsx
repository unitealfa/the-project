// front/src/pages/DashboardAdminVentes.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header'; // Assuming Header is used by the version you want to keep

// Keeping the version that includes the "Gérer les véhicules" button
// and assuming it might use the Header component as well.
// If the Header was only for the removed version, you can remove its import.
const DashboardAdminVentes: React.FC = () => {
  const rawUser = localStorage.getItem('user');
  // It's good practice to type the parsed user object more specifically if possible
  const user: { nom: string; prenom: string; company?: string; role?: string; depot?: string } | null 
    = rawUser ? JSON.parse(rawUser) : null;

  // Optional: Add a check if the user is actually an Admin des Ventes if needed
  // if (!user || user.role !== 'Administrateur des ventes') {
  //   // Redirect or show an unauthorized message
  //   return <p>Accès non autorisé.</p>;
  // }
  
  if (!user) {
    // Handle case where user is not found, perhaps redirect to login
    return <p>Utilisateur non trouvé. Veuillez vous reconnecter.</p>; 
  }

  return (
    <>
      <Header /> {/* Assuming this Header is part of the desired layout */}
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Tableau de Bord - Administrateur des Ventes</h1>
        <p>Bonjour {user.prenom} {user.nom}</p>
        {user.company && <p>Société: <strong>{user.company}</strong></p>}
        {user.depot && <p>Dépôt: <strong>{user.depot}</strong></p>} {/* Assuming depot info might be relevant */}
        
        <div style={{ marginTop: '2rem' }}>
          <Link to="/admin-ventes/vehicules">
            <button type="button" style={{ padding: '10px 15px', fontSize: '16px', cursor: 'pointer' }}>
              Gérer les véhicules
            </button>
          </Link>
        </div>

        <section style={{ marginTop: '2rem' }}>
          <h2>📈 Suivi des comptes-clients</h2>
          <p style={{ opacity: .7 }}>Module en développement…</p>
        </section>
      </main>
    </>
  );
};

export default DashboardAdminVentes;
