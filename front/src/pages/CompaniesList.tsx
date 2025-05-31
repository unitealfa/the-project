// front/src/pages/CompaniesList.tsx
import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

interface Company {
  _id: string;
  nom_company: string;
  admin: { nom: string; prenom: string; email: string } | null;
}

export default function CompaniesList() {
  const [list, setList] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Pour la barre de recherche
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 15;
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data: Company[]) => setList(data))
      .catch(err => setError(err.message));
  }, [apiBase, token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette entreprise ?')) return;
    const res = await fetch(`${apiBase}/companies/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.message || `Erreur ${res.status}`);
    } else {
      setList(l => l.filter(c => c._id !== id));
      // Ajuster la pagination si on supprime sur la dernière page
      const filteredAfterDelete = filteredList.filter(c => c._id !== id);
      const lastPageAfterDelete = Math.ceil(filteredAfterDelete.length / companiesPerPage);
      if (currentPage > lastPageAfterDelete) {
        setCurrentPage(Math.max(lastPageAfterDelete, 1));
      }
    }
  };

  // Gestion de la recherche
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const resetFilter = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filtrer par nom_company, admin.nom+prenom ou admin.email
  const filteredList = list.filter(company => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const nomSociete = company.nom_company.toLowerCase();
    const adminNomPrenom = company.admin
      ? `${company.admin.nom.toLowerCase()} ${company.admin.prenom.toLowerCase()}`
      : '';
    const adminEmail = company.admin ? company.admin.email.toLowerCase() : '';

    return (
      nomSociete.includes(term) ||
      adminNomPrenom.includes(term) ||
      adminEmail.includes(term)
    );
  });

  // Pagination
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredList.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredList.length / companiesPerPage);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  if (error) {
    return (
      <>
        <Header />
        <div style={{ padding: 16, color: 'red' }}>{error}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ padding: 16, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Liste des entreprises</h1>
          <Link
            to="/create-company"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: '#fff',
              borderRadius: 4,
              textDecoration: 'none',
            }}
          >
            ➕ Nouvelle entreprise
          </Link>
        </div>

        {/* Barre de recherche + Reset */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            marginBottom: '1rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Recherche par Société, Admin ou Email Admin..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <button
            onClick={resetFilter}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f3f4f6',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            disabled={!searchTerm}
          >
            Réinitialiser
          </button>
        </div>

        {filteredList.length === 0 ? (
          <p>Aucune entreprise trouvée.</p>
        ) : (
          <>
            <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Société
                  </th>
                  <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Admin
                  </th>
                  <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Email Admin
                  </th>
                  <th style={{ padding: '.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentCompanies.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '.75rem' }}>{c.nom_company}</td>
                    <td style={{ padding: '.75rem' }}>
                      {c.admin ? `${c.admin.nom} ${c.admin.prenom}` : '—'}
                    </td>
                    <td style={{ padding: '.75rem' }}>{c.admin?.email ?? '—'}</td>
                    <td style={{ padding: '.75rem', display: 'flex', gap: 8 }}>
                      <Link to={`/companies/${c._id}`} style={{ color: '#4f46e5' }}>
                        Voir
                      </Link>
                      <Link to={`/companies/${c._id}/edit`} style={{ color: '#4f46e5' }}>
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(c._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          cursor: 'pointer',
                        }}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Contrôles de pagination */}
            {filteredList.length > companiesPerPage && (
              <div
                style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === 1 ? '#ddd' : '#4f46e5',
                    color: currentPage === 1 ? '#666' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ← Précédent
                </button>
                <span style={{ alignSelf: 'center' }}>
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: currentPage === totalPages ? '#ddd' : '#4f46e5',
                    color: currentPage === totalPages ? '#666' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
