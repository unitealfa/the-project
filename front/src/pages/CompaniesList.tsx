import React, { useEffect, useState, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { PaginationSearch } from '../components/PaginationSearch';
import '../pages-css/CompaniesList.css';

interface Company {
  _id: string;
  nom_company: string;
  pfp: string;
  admin: { nom: string; prenom: string; email: string } | null;
}

export default function CompaniesList() {
  const [list, setList] = useState<Company[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      const filteredAfter = filteredList.filter(c => c._id !== id);
      const lastPage = Math.ceil(filteredAfter.length / companiesPerPage);
      if (currentPage > lastPage) setCurrentPage(Math.max(lastPage, 1));
    }
  };

  const filteredList = list.filter(company => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nom = company.nom_company.toLowerCase();
    const adminName = company.admin
      ? `${company.admin.nom.toLowerCase()} ${company.admin.prenom.toLowerCase()}`
      : '';
    const adminEmail = company.admin?.email.toLowerCase() || '';
    return nom.includes(term) || adminName.includes(term) || adminEmail.includes(term);
  });

  const indexLast = currentPage * companiesPerPage;
  const indexFirst = indexLast - companiesPerPage;
  const currentCompanies = filteredList.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredList.length / companiesPerPage);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const resetFilter = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <>
      <Header />
      <main className="main">

        <div className="card header-card">
          <h1>Liste des entreprises</h1>
          <Link to="/create-company" className="btn btn-add">
           Nouvelle entreprise
          </Link>
        </div>

        {error && <div className="card error-card">{error}</div>}

        <div className="card search-card">
          <input
            type="text"
            placeholder="Recherche Société, Admin ou Email…"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            onClick={resetFilter}
            className="btn btn-reset"
            disabled={!searchTerm}
          >
            Réinitialiser
          </button>
        </div>

        <div className="card table-card">
          {filteredList.length === 0 ? (
            <p>Aucune entreprise trouvée.</p>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Société</th>
                    <th>Admin</th>
                    <th>Email Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCompanies.map(c => (
                    <tr key={c._id}>
                      <td>
                        <img
                          src={`${apiBase}/${c.pfp}`}
                          alt={`Logo ${c.nom_company}`}
                          className="table-avatar"
                        />
                      </td>
                      <td>{c.nom_company}</td>
                      <td>{c.admin ? `${c.admin.nom} ${c.admin.prenom}` : '—'}</td>
                      <td>{c.admin?.email ?? '—'}</td>
                      <td className="cell-actions">
                        <Link to={`/companies/${c._id}`} className="icon-btn">👁️</Link>
                        <Link to={`/companies/${c._id}/edit`} className="icon-btn">✏️</Link>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="icon-btn danger"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredList.length > companiesPerPage && (
                <div className="pagination-controls">
                  <button onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}>
                    ← Précédent
                  </button>
                  <span>{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </>
  );
}
