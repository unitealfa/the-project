// front/src/pages/PreventeTeam.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header                        from "../components/Header";
import { PaginationSearch }          from "../components/PaginationSearch";
import { apiFetch }                  from "../utils/api";
import "../pages-css/PreventeTeam.css";          /* ← NOUVEAU */

interface Member {
  _id:    string;
  nom:    string;
  prenom: string;
  role:   string;
  pfp:    string;        // miniature
}

export default function PreventeTeam() {
  const { depotId = "" } = useParams<{ depotId: string }>();
  const nav              = useNavigate();
  const loc              = useLocation();

  /* state */
  const [list,       setList]       = useState<Member[]>([]);
  const [filtered,   setFiltered]   = useState<Member[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page,       setPage]       = useState(1);

  const PER_PAGE = 10;
  const api      = import.meta.env.VITE_API_URL;
  const user     = JSON.parse(localStorage.getItem("user") || "{}") as { role?:string };

  /* chargement */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const r        = await apiFetch(`/api/teams/${depotId}?role=prevente`);
        const data     = await r.json();
        const members  = Array.isArray(data.prevente) ? data.prevente : [];
        setList(members);
        setFiltered(members);
      } catch { setError("Impossible de charger l’équipe"); }
      finally { setLoading(false); }
    })();
  }, [depotId, loc.key]);

  /* filtre */
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const f = list.filter(m =>
      m.nom.toLowerCase().includes(lower)     ||
      m.prenom.toLowerCase().includes(lower)  ||
      m.role.toLowerCase().includes(lower)
    );
    setFiltered(f);
    setPage(1);
  }, [searchTerm, list]);

  /* pagination */
  const first = (page-1)*PER_PAGE;
  const slice = filtered.slice(first, first+PER_PAGE);

  /* suppression */
  const del = async (id:string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await apiFetch(`/api/teams/members/${id}`, { method:"DELETE" });
      setList(l => l.filter(m => m._id!==id));
    } catch { setError("Erreur lors de la suppression"); }
  };

  /* ------------------------------------------------------------ */

  return (
    <>
      <Header />

      <div className="pt-page">

        {/* cartouche titre */}
        <div className="pt-title-card">
          <h1 className="pt-title">Équipe Pré-vente</h1>
        </div>

        {user.role === "responsable depot" && (
          <button
            className="pt-btn-add"
            onClick={() => nav(`/teams/${depotId}/prevente/add`)}
          >
            + Ajouter un membre
          </button>
        )}

        {error && <p className="pt-error">{error}</p>}

        {loading ? (
          <p className="pt-loading">Chargement…</p>
        ) : (
          <>
            <PaginationSearch
              totalItems={filtered.length}
              itemsPerPage={PER_PAGE}
              currentPage={page}
              onPageChange={setPage}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Rechercher un membre…"
            />

            <div className="pt-table-wrap">
              <table className="pt-table">
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
                          src={`${api}/${m.pfp}`}
                          alt={`${m.nom} ${m.prenom}`}
                          className="pt-avatar"
                        />
                      </td>
                      <td>{m.nom}</td>
                      <td>{m.prenom}</td>
                      <td>{m.role}</td>
                      <td className="pt-actions">
                        <button onClick={() => nav(`/teams/members/${m._id}/detail-prevente`)}>Détails</button>
                        <button onClick={() => nav(`/teams/members/${m._id}/edit-prevente`)}>Éditer</button>
                        <button className="danger" onClick={() => del(m._id)}>Supprimer</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="pt-empty">Aucun membre</td></tr>
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
