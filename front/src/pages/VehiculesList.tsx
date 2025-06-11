import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { PaginationSearch } from '../components/PaginationSearch';
import { API_URL } from '../constants';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Car as CarIcon,
  MoreHorizontal,
} from 'lucide-react';
import '../pages-css/VehiculesList.css';

interface Vehicule {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id?: { nom: string; prenom: string };
  livreur_id?:  { nom: string; prenom: string };
}

interface LocationState { message?: string }

const VehiculesList: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [filtered, setFiltered] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(state?.message || null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toDelete, setToDelete] = useState<string|null>(null);
  const [deleting, setDeleting] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<Vehicule[]>(`${API_URL}/vehicles`, {
          headers:{ Authorization:`Bearer ${token}` }
        });
        setVehicules(res.data);
      } catch (e:any) {
        setError(
          e.response?.status === 403
            ? "Vous n'avez pas l'autorisation."
            : "Erreur de chargement."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filtre
  useEffect(() => {
    setFiltered(
      vehicules.filter(v =>
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.license_plate.toLowerCase().includes(search.toLowerCase())
      )
    );
    setCurrentPage(1);
  }, [search, vehicules]);

  // Suppression
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/vehicles/${id}`, {
        headers:{ Authorization:`Bearer ${token}` }
      });
      setVehicules(v => v.filter(x => x._id !== id));
      setSuccess("Véhicule supprimé avec succès.");
      setTimeout(()=>setSuccess(null),3000);
    } catch {
      setError("Impossible de supprimer.");
      setTimeout(()=>setError(null),3000);
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const toggleActionMenu = (id: string) => {
    setOpenActionMenu(openActionMenu === id ? null : id);
  };

  const goDetail = (id: string) => {
    setOpenActionMenu(null);
    navigate(`/admin-ventes/vehicules/${id}`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-8 px-4">
          <p>Chargement en cours…</p>
        </div>
      </>
    );
  }

  // Pagination slice
  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  return (
    <>
      <Header />

      {/* main avec marge-top pour ne pas coller le header */}
      <main className="container mx-auto py-8 px-4 mt-20">

        {/* Titre + bouton Ajouter */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Véhicules</h1>
            <p className="text-muted-foreground">
              Gérez votre flotte et ses assignations
            </p>
          </div>
          <Link to="/admin-ventes/vehicules/ajouter">
            <button className="inline-flex items-center gap-2 px-5 py-2 bg-black text-white rounded-md shadow-sm">
              <Plus className="h-4 w-4"/> Ajouter un véhicule
            </button>
          </Link>
        </div>

        {/* Messages */}
        {error  && <div className="alert-destructive">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        {/* Barre de recherche */}

        {/* PaginationSearch au-dessus du tableau */}
        <div className="mb-4">
          <PaginationSearch
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchTerm={search}
            onSearchChange={setSearch}
            placeholder="Rechercher un véhicule..."
          />
        </div>

        {/* Tableau */}
        <div className="table-wrapper mb-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Véhicule</th>
                <th>Plaque</th>
                <th>Chauffeur</th>
                <th>Livreur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map(v => (
                <tr key={v._id}>
                  <td className="cell-vehicle">
                    <CarIcon className="cell-icon"/>
                    <div>
                      <div className="cell-title">{v.make} {v.model}</div>
                      <div className="cell-sub">Année {v.year}</div>
                    </div>
                  </td>
                  <td><span className="badge">{v.license_plate}</span></td>
                  <td>
                    {v.chauffeur_id
                      ? `${v.chauffeur_id.prenom} ${v.chauffeur_id.nom}`
                      : <span className="text-gray">Non assigné</span>}
                  </td>
                  <td>
                    {v.livreur_id
                      ? `${v.livreur_id.prenom} ${v.livreur_id.nom}`
                      : <span className="text-gray">Non assigné</span>}
                  </td>
                  <td className="cell-actions">
                    {/* Desktop */}
                    <div className="desktop-actions">
                      <button onClick={() => goDetail(v._id)}><Eye /></button>
                      <button onClick={() => navigate(`/admin-ventes/vehicules/${v._id}/modifier`)}><Edit /></button>
                      <button className="text-red" onClick={() => setToDelete(v._id)}><Trash2 /></button>
                    </div>
                    {/* Mobile */}
                    <div className="mobile-actions">
                      <button className="ellipsis-btn" onClick={() => toggleActionMenu(v._id)}>⋯</button>
                      {openActionMenu === v._id && (
                        <div className="action-menu">
                          <button onClick={() => goDetail(v._id)}>Voir</button>
                          <button onClick={() => navigate(`/admin-ventes/vehicules/${v._id}/modifier`)}>Modifier</button>
                          <button onClick={() => setToDelete(v._id)}>Supprimer</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Dialog suppression */}
      <div className={toDelete ? 'dialog-backdrop' : 'hidden'}>
        <div className="dialog-box">
          <h2>Confirmer la suppression</h2>
          <p>Cette action est irréversible.</p>
          <div className="dialog-actions">
            <button onClick={()=>setToDelete(null)}>Annuler</button>
            <button
              onClick={() => toDelete && handleDelete(toDelete)}
              disabled={deleting}
              className="btn-danger"
            >
              {deleting ? 'Suppression…' : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehiculesList;
