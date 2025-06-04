import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { PaginationSearch } from '../components/PaginationSearch';
import { apiFetch } from '../utils/api';

/* ─── 1. Étendre l’interface Member pour inclure `pfp` ──────── */
interface Member {
  _id:    string;
  nom:    string;
  prenom: string;
  role:   string;
  pfp:    string; // ← nouveau champ
}

export default function PreventeTeam() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const [list, setList] = useState<Member[]>([]);
  const [filteredList, setFilteredList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role: string };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await apiFetch(`/api/teams/${depotId}?role=prevente`);
        const data = await r.json();
        // data.prevente doit être un tableau de Member (incluant pfp)
        const membersData: Member[] = Array.isArray(data.prevente)
          ? data.prevente
          : data.prevente ?? [];
        setList(membersData);
        setFilteredList(membersData);
      } catch {
        setError('Impossible de charger');
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId, loc.key]);

  useEffect(() => {
    const filtered = list.filter(member =>
      member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredList(filtered);
    setCurrentPage(1);
  }, [searchTerm, list]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

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
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ margin: 0 }}>Équipe Pré-vente</h1>
          {user.role === 'responsable depot' && (
            <button
              onClick={() => nav(`/teams/${depotId}/prevente/add`)}
              style={{
                padding: '.5rem 1rem',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
              }}
            >
              + Ajouter un membre
            </button>
          )}
        </div>

        {error && <p style={{ color:'red' }}>{error}</p>}

        {loading ? (
          <p>Chargement…</p>
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

            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:'1rem' }}>
              <thead>
                <tr>
                  {/* ─── Colonne “Photo” ajoutée ──────────────────────── */}
                  {['Photo','Nom','Prénom','Rôle','Actions'].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: '.5rem',
                        borderBottom: '1px solid #ccc',
                        textAlign: 'left'
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(m => (
                    <tr key={m._id}>
                      {/* ◀◀ Affichage de la miniature 32×32 px */}
                      <td style={{ padding: '.5rem 0' }}>
                        <img
                          src={`${import.meta.env.VITE_API_URL}/${m.pfp}`}
                          alt={`Profil de ${m.nom} ${m.prenom}`}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid #ccc'
                          }}
                        />
                      </td>

                      <td style={{ padding: '.5rem 0' }}>{m.nom}</td>
                      <td style={{ padding: '.5rem 0' }}>{m.prenom}</td>
                      <td style={{ padding: '.5rem 0' }}>{m.role}</td>
                      <td>
                        <button
                          style={{ marginRight: 8 }}
                          onClick={() => nav(`/teams/members/${m._id}/detail-prevente`)}
                        >
                          Détails
                        </button>
                        <button
                          style={{ marginRight: 8 }}
                          onClick={() => nav(`/teams/members/${m._id}/edit-prevente`)}
                        >
                          Éditer
                        </button>
                        <button
                          style={{
                            color: '#fff',
                            background: '#dc2626',
                            border: 'none',
                            borderRadius: 4,
                            padding: '0.25rem 0.75rem',
                          }}
                          onClick={() => handleDelete(m._id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* ─── colSpan passe à 5 (Photo, Nom, Prénom, Rôle, Actions) ─── */}
                    <td colSpan={5} style={{ padding: '.75rem', fontStyle: 'italic' }}>
                      Aucun membre trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
