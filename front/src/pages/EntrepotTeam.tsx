import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { PaginationSearch } from '@/components/PaginationSearch';
import { apiFetch } from '@/utils/api';
import "../pages-css/EntrepotTeam.css";

interface Member {
  _id: string;
  nom: string;
  prenom: string;
  role: string;
  pfp?: string;
}

interface Depot {
  _id: string;
  nom_depot: string;
}

interface UserLocal {
  role: string;
  depot: string | null;
}

export default function EntrepotTeam() {
  const nav = useNavigate();
  const loc = useLocation();

  const stored = localStorage.getItem('user') || '{}';
  const user: UserLocal = JSON.parse(stored);

  const [depot, setDepot] = useState<Depot | null>(null);
  const [list, setList] = useState<Member[]>([]);
  const [filteredList, setFilteredList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user.depot) {
      setError('Aucun dépôt assigné');
      setLoading(false);
      return;
    }

    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [dRes, tRes] = await Promise.all([
          apiFetch(`/api/depots/${user.depot}`),
          apiFetch('/api/teams/mine'),
        ]);

        if (cancel) return;

        const dJson = await dRes.json();
        setDepot(dJson);

        const tJson = await tRes.json();
        const membersData = tJson.entrepot ?? [];
        setList(membersData);
        setFilteredList(membersData);
      } catch {
        if (!cancel) setError('Impossible de charger');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [loc.key, user.depot]);

  useEffect(() => {
    const filtered = list.filter(
      member =>
        member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  }, [searchTerm, list]);

  const currentItems = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try {
      await apiFetch(`/api/teams/members/${memberId}`, { method: 'DELETE' });
      setList(list => list.filter(m => m._id !== memberId));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Header />
      <div className="et-page">
        <div className="bg-blob et-blob-1"></div>
        <div className="bg-blob et-blob-2"></div>

        <div className="et-title-card">
          <h1 className="et-title">
            Équipe Entrepôt {depot ? `du dépôt « ${depot.nom_depot} »` : ''}
          </h1>
        </div>

        {user.role === 'responsable depot' && user.depot && (
          <button
            className="et-btn-add"
            onClick={() => nav(`/teams/${user.depot}/entrepot/add`)}
          >
            + Ajouter un membre
          </button>
        )}

        {error && <p className="et-error">{error}</p>}

        {loading ? (
          <p className="et-loading">Chargement…</p>
        ) : (
          <>
            <PaginationSearch
              totalItems={filteredList.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Rechercher un membre..."
            />

            <div className="et-table-wrap">
              <table className="et-table">
                <thead>
                  <tr>
                    {['Photo', 'Nom', 'Prénom', 'Rôle', 'Actions'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length ? (
                    currentItems.map(m => (
                      <tr key={m._id}>
                        <td>
                          <img
                            className="et-avatar"
                            src={`${import.meta.env.VITE_API_URL}/${m.pfp}`}
                            alt={`Profil de ${m.nom} ${m.prenom}`}
                          />
                        </td>
                        <td>{m.nom}</td>
                        <td>{m.prenom}</td>
                        <td>{m.role}</td>
                        <td className="et-actions">
                          <button onClick={() => nav(`/teams/members/${m._id}/detail-entrepot`)}>Détails</button>
                          <button onClick={() => nav(`/teams/members/${m._id}/edit-entrepot`)}>Éditer</button>
                          <button className="danger" onClick={() => handleDelete(m._id)}>Supprimer</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="et-empty">Aucun membre trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
