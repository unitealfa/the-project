// front/src/pages/DeliveryTeam.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { PaginationSearch } from "../components/PaginationSearch";
import { apiFetch } from "../utils/api";
import "../pages-css/DeliveryTeam.css";

interface Member { _id: string; nom: string; prenom: string; role: string; pfp: string }
interface Depot  { _id: string; nom_depot: string }

export default function DeliveryTeam() {
  const { depotId = "" } = useParams<{ depotId: string }>();
  const nav               = useNavigate();
  const loc               = useLocation();
  const [members, setMembers]           = useState<Member[]>([]);
  const [filtered, setFiltered]         = useState<Member[]>([]);
  const [depot,    setDepot]            = useState<Depot | null>(null);
  const [loading,  setLoading]          = useState(true);
  const [error,    setError]            = useState("");
  const [search,   setSearch]           = useState("");
  const [page,     setPage]             = useState(1);
  const perPage                          = 10;
  const user = JSON.parse(localStorage.getItem("user") || "{}") as { role:string };

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [dRes, tRes] = await Promise.all([
          apiFetch(`/api/depots/${depotId}`),
          apiFetch(`/api/teams/${depotId}?role=livraison`)
        ]);
        if (cancel) return;
        setDepot(await dRes.json());
        const raw = await tRes.json();
        const list: Member[] = Array.isArray(raw) ? raw : raw.livraison ?? [];
        setMembers(list);
        setFiltered(list);
      } catch {
        if (!cancel) setError("Impossible de charger");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [depotId, loc.key]);

  useEffect(() => {
    const f = members.filter(m =>
      `${m.nom} ${m.prenom} ${m.role}`.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setPage(1);
  }, [search, members]);

  const iLast  = page * perPage;
  const iFirst = iLast - perPage;
  const slice  = filtered.slice(iFirst, iLast);

  const del = async (id:string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await apiFetch(`/api/teams/members/${id}`, { method:"DELETE" });
      setMembers(l => l.filter(m => m._id !== id));
    } catch { setError("Erreur lors de la suppression"); }
  };

  return (
    <>
      <Header />
      <div className="dt-page">

        {/* TITRE */}
        <div className="dt-title-card">
          <h1 className="dt-title">
            Équipe Livraison
            {depot && <> du dépôt « {depot.nom_depot} »</>}
          </h1>
        </div>

        {/* BOUTON TOUJOURS EN DESSOUS */}
        {user.role === "responsable depot" && (
          <button
            className="dt-btn-add"
            onClick={() => nav(`/teams/${depotId}/livraison/add`)}
          >
            + Ajouter un membre
          </button>
        )}

        {error && <p className="dt-error">{error}</p>}
        {loading ? (
          <p className="dt-loading">Chargement…</p>
        ) : (
          <>
            <PaginationSearch
              totalItems    ={filtered.length}
              itemsPerPage  ={perPage}
              currentPage   ={page}
              onPageChange  ={setPage}
              searchTerm    ={search}
              onSearchChange={setSearch}
              placeholder   ="Rechercher un membre…"
            />

            <div className="et-table-wrap">
              <table className="et-table">
                <thead>
                  <tr>
                    {["Photo","Nom","Prénom","Rôle","Actions"].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slice.length ? slice.map(m => (
                    <tr key={m._id}>
                      <td>
                        <img
                          className="dt-avatar"
                          src={`${import.meta.env.VITE_API_URL}/${m.pfp}`}
                          alt={`Profil de ${m.nom} ${m.prenom}`}
                        />
                      </td>
                      <td>{m.nom}</td>
                      <td>{m.prenom}</td>
                      <td>{m.role}</td>
                      <td className="dt-actions">
                        <button onClick={()=>nav(`/teams/members/${m._id}/detail-delivery`)}>Détails</button>
                        <button onClick={()=>nav(`/teams/members/${m._id}/edit-delivery`)}>Éditer</button>
                        {(user.role === "admin" || user.role === "responsable depot") && (
                          <button className="danger" onClick={()=>del(m._id)}>Supprimer</button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="dt-empty">Aucun membre trouvé</td>
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
