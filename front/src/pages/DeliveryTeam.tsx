import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { PaginationSearch } from '../components/PaginationSearch';
import { apiFetch } from '../utils/api';

interface Member { _id: string; nom: string; prenom: string; role: string; pfp: string }
interface Depot  { _id: string; nom_depot: string }

export default function DeliveryTeam() {
  const { depotId = '' } = useParams<{ depotId: string }>();
  const nav = useNavigate();
  const loc = useLocation();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const user = JSON.parse(localStorage.getItem('user') || '{}') as { role: string };

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [dRes, tRes] = await Promise.all([
          apiFetch(`/api/depots/${depotId}`),
          apiFetch(`/api/teams/${depotId}?role=livraison`),
        ]);
        if (cancel) return;
        setDepot(await dRes.json());
        const payload = await tRes.json();
        const membersData = Array.isArray(payload) ? payload : payload.livraison ?? [];
        setMembers(membersData);
        setFilteredMembers(membersData);
      } catch {
        if (!cancel) setError('Impossible de charger');
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [depotId, loc.key]);

  useEffect(() => {
    // Filtrer les membres en fonction du terme de recherche
    const filtered = members.filter(member => 
      member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
    setCurrentPage(1); // Réinitialiser la page courante lors d'une nouvelle recherche
  }, [searchTerm, members]);

  // Calculer les membres à afficher pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async (memberId: string) => {
    if (!window.confirm('Supprimer ce membre ?')) return;
    try {
      await apiFetch(`/api/teams/members/${memberId}`, { method: 'DELETE' });
      setMembers(members => members.filter(m => m._id !== memberId));
    } catch {
      setError('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding:'1rem', fontFamily:'Arial, sans-serif' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h1 style={{ margin:0 }}>
            Équipe Livraison {depot ? `du dépôt « ${depot.nom_depot} »` : ''}
          </h1>
          {user.role === 'responsable depot' && (
            <button onClick={() => nav(`/teams/${depotId}/livraison/add`)}
                    style={{ padding:'.5rem 1rem', background:'#4f46e5', color:'#fff', border:'none', borderRadius:8 }}>
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
              totalItems={filteredMembers.length}
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
                  {['Photo', 'Nom','Prénom','Rôle','Actions'].map(h => (
                    <th key={h} style={{ padding:'.5rem', borderBottom:'1px solid #ccc', textAlign:'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map(m => (
                  <tr key={m._id}>
                    <td style={{ padding:'.5rem 0' }}>
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${m.pfp}`}
                        alt={`Profil de ${m.nom} ${m.prenom}`}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #ccc',
                        }}
                      />
                    </td>
                    <td style={{ padding:'.5rem 0' }}>{m.nom}</td>
                    <td style={{ padding:'.5rem 0' }}>{m.prenom}</td>
                    <td style={{ padding:'.5rem 0' }}>{m.role}</td>
                    <td>
                      <button
                        style={{ marginRight:8 }}
                        onClick={() => nav(`/teams/members/${m._id}/detail-delivery`)}
                      >
                        Détails
                      </button>
                      <button
                        style={{ marginRight:8 }}
                        onClick={() => nav(`/teams/members/${m._id}/edit-delivery`)}
                      >
                        Éditer
                      </button>
                      {(user.role === 'admin' || user.role === 'responsable depot') && (
                        <button
                          style={{ color:'#fff', background:'#dc2626', border:'none', borderRadius:4, padding:'0.25rem 0.75rem' }}
                          onClick={() => handleDelete(m._id)}
                        >
                          Supprimer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr><td colSpan={5} style={{ padding:'.75rem', fontStyle:'italic' }}>Aucun membre trouvé</td></tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
}
