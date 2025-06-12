import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import '../pages-css/DepotsList.css';

interface Depot {
  _id: string;
  nom_depot: string;
  type_depot: string;
  capacite: number;
  date_creation: string;
  responsable_id?: { nom: string; prenom: string } | null;
}

export default function DepotsList() {
  const [list, setList] = useState<Depot[]>([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token') || '';
  const apiBase = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiBase}/api/depots`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Erreur ${r.status}`);
        return r.json();
      })
      .then((data: Depot[]) => setList(data))
      .catch(err => setError(err.message));
  }, [apiBase, token]);

  if (error) {
    return (
      <>
        <Header />
        <div className="brutalist-container" style={{ color: 'red' }}>
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="brutalist-container">
        {/* En-tête “Mes dépôts” */}
        <div className="brutalist-card brutalist-spacing-large">
          <div className="brutalist-card-header">
            <h1 className="brutalist-main-title">Mes dépôts</h1>
            <Link to="/create-depot" className="brutalist-action-button">
              ➕ Nouveau dépôt
            </Link>
          </div>
        </div>

        {/* Wrapper / tableau */}
        <div className="brutalist-table-wrapper">
          <table className="brutalist-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Capacité</th>
                <th>Responsable</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(d => (
                <tr key={d._id}>
                  <td>{d.nom_depot}</td>
                  <td>{d.type_depot}</td>
                  <td>{d.capacite}</td>
                  <td>
                    {d.responsable_id
                      ? `${d.responsable_id.prenom} ${d.responsable_id.nom}`
                      : '—'}
                  </td>
                  <td>
                    {new Date(d.date_creation).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="brutalist-action-group">
                      <Link
                        to={`/depots/${d._id}`}
                        className="brutalist-btn-action"
                      >
                        Voir
                      </Link>
                      <Link
                        to={`/depots/${d._id}/edit`}
                        className="brutalist-btn-action"
                      >
                        Modifier
                      </Link>
                      <button
                        className="brutalist-btn-delete"
                        onClick={async () => {
                          if (!confirm('Supprimer ce dépôt ?')) return;
                          const res = await fetch(
                            `${apiBase}/api/depots/${d._id}`,
                            {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (!res.ok) {
                            const err = await res.json();
                            alert(err.message || `Erreur ${res.status}`);
                          } else {
                            setList(l => l.filter(x => x._id !== d._id));
                          }
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
