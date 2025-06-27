"use client";

import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Header from "../components/Header";
import "../pages-css/LoyaltyAdmin.css";

interface Tier {
  _id: string;
  points: number;
  reward: string;
  image?: string;
}
interface Reward {
  _id: string;
  client: { _id: string; nom_client: string };
  points: number;
  type: "points" | "spend" | "repeat";
  amount?: number;
   rewardName?: string;
}
interface RepeatReward {
  _id: string;
  every: number;
  reward: string;
  image?: string;
}

export default function LoyaltyAdmin() {
  const api = import.meta.env.VITE_API_URL || "";
  const token = localStorage.getItem("token") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = user?.company as string;

  /* ────────────────── STATES ────────────────── */
  const [ratioAmount, setRatioAmount] = useState(0);
  const [ratioPoints, setRatioPoints] = useState(0);

  const [tiers, setTiers] = useState<Tier[]>([]);
  const [editedTiers, setEditedTiers] = useState<
    Record<string, { points: number; reward: string; imageFile?: File | null }>
  >({});

  const [repeatRewards, setRepeatRewards] = useState<RepeatReward[]>([]);
  const [editedRepeats, setEditedRepeats] = useState<
    Record<string, { every: number; reward: string; imageFile?: File | null }>
  >({});
  const [newRepeat, setNewRepeat] = useState({
    every: 0,
    reward: "",
    imageFile: null as File | null,
    preview: null as string | null,
  });

  const [pending, setPending] = useState<Reward[]>([]);

  /* ────────────────── LOAD DATA ────────────────── */
  useEffect(() => {
    if (!companyId || !token) return;

    Promise.all([
      fetch(`${api}/loyalty/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
      fetch(`${api}/loyalty/${companyId}/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json()),
    ])
      .then(([main, repeat, pending]) => {
        setRatioAmount(main.ratio.amount);
        setRatioPoints(main.ratio.points);
        setTiers(main.tiers);

        const initT: Record<string, { points: number; reward: string; imageFile: null }> = {};
        main.tiers.forEach((t: Tier) => {
          initT[t._id] = { points: t.points, reward: t.reward, imageFile: null };
        });
        setEditedTiers(initT);

        const list = Array.isArray(repeat) ? repeat : repeat.repeatRewards; // Ensure it's a list
        setRepeatRewards(list);

        const initR: Record<string, { every: number; reward: string; imageFile: null }> = {};
        list.forEach((rr: RepeatReward) => {
          initR[rr._id] = { every: rr.every, reward: rr.reward, imageFile: null };
        });
        setEditedRepeats(initR);

        setPending(pending);
      })
      .catch(console.error);
  }, [api, token, companyId]);

  /* ────────────────── RATIO ────────────────── */
  const submitRatio = (e: FormEvent) => {
    e.preventDefault();
    if (!ratioAmount || !ratioPoints) return alert("Champs ratio manquants");

    fetch(`${api}/loyalty/${companyId}/ratio`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: ratioAmount, points: ratioPoints }),
    })
      .then((r) => {
        if (r.ok) alert(" Ratio enregistré");
        else alert("Erreur lors de la mise à jour du ratio");
      })
      .catch(() => alert("Erreur réseau"));
  };

  /* ────────────────── TIERS CRUD ────────────────── */
  const saveTier = async (id: string) => {
    const fallback = { points: 0, reward: "", imageFile: null };
    const current = editedTiers[id] ?? fallback;
    const { points, reward, imageFile } = current;

    if (!points || !reward.trim()) {
      alert("Points & récompense requis");
      return;
    }

    const fd = new FormData();
    fd.append("points", points.toString());
    fd.append("reward", reward);
    if (imageFile) fd.append("image", imageFile);

    const res = await fetch(`${api}/loyalty/${companyId}/tiers/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (res.ok) {
      const d = await res.json(); // { tiers: Tier[] }
      setTiers(d.tiers);

      // Find the updated tier in the response
      const updated = d.tiers.find((t: Tier) => t._id === id)!;

      // Reset state: remove "unsaved" flag
      setEditedTiers((et) => ({
        ...et,
        [id]: {
          points: updated.points,
          reward: updated.reward,
          imageFile: null,
        },
      }));
    }
  };
  const delTier = async (id: string) => {
    await fetch(`${api}/loyalty/${companyId}/tiers/${id}/delete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTiers((t) => t.filter((x) => x._id !== id));
    setEditedTiers((e) => {
      delete e[id];
      return { ...e };
    });
  };
  const addTier = () => {
    const p = prompt("Points requis ?");
    const r = prompt("Nom de la récompense ?");
    if (!p || !r) return;
    fetch(`${api}/loyalty/${companyId}/tiers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ points: +p, reward: r }),
    })
      .then((r) => r.json())
      .then((d) => setTiers(d.tiers));
  };

  /* ────────────────── REPEAT CRUD ────────────────── */
  const saveRepeat = async (id: string) => {
    const fallback = { every: 0, reward: "", imageFile: null };
    const current = editedRepeats[id] ?? fallback; // ← plus jamais undefined
    const { every, reward, imageFile } = current;

    if (!every || !reward.trim()) {
      alert("Champs manquants");
      return;
    }

    const fd = new FormData();
    fd.append("every", every.toString());
    fd.append("reward", reward);
    if (imageFile) fd.append("image", imageFile);

    const res = await fetch(`${api}/loyalty/${companyId}/repeat-rewards/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) {
      alert("Erreur mise à jour défi");
      return;
    }

    // Handle various backend responses
    const d = await res.json();
    const array: RepeatReward[] = 
      Array.isArray(d) ? d
      : Array.isArray(d.repeatRewards) ? d.repeatRewards
      : Array.isArray(d.repeat) ? d.repeat
      : d._id ? repeatRewards.map(
          (item: RepeatReward) => item._id === d._id ? d as RepeatReward : item
        )
      : repeatRewards;

    setRepeatRewards(array); // Ensure it's always an array

    // Reset "unsaved" state
    const updated = array.find((x) => x._id === id)!;
    setEditedRepeats((er) => ({
      ...er,
      [id]: { every: updated.every, reward: updated.reward, imageFile: null },
    }));
  };
  const delRepeat = async (id: string) => {
    const res = await fetch(`${api}/loyalty/${companyId}/repeat-rewards/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json(); // { repeatRewards: [...] }
      const list = Array.isArray(data) ? data : data.repeatRewards; // Ensure it's a list
      setRepeatRewards(list);
    } else {
      setRepeatRewards((rr) => rr.filter((r) => r._id !== id)); // Fallback
    }

    setEditedRepeats((er) => {
      delete er[id];
      return { ...er };
    });
  };
  const addRepeat = async () => {
    if (!newRepeat.every || !newRepeat.reward.trim())
      return alert("Champs manquants");
    const fd = new FormData();
    fd.append("every", newRepeat.every.toString());
    fd.append("reward", newRepeat.reward);
    if (newRepeat.imageFile) fd.append("image", newRepeat.imageFile);
    const r = await fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (r.ok) {
      const d = await r.json();
      setRepeatRewards(d.repeatRewards);
    }
    setNewRepeat({ every: 0, reward: "", imageFile: null, preview: null });
  };

  /* ────────────────── LIVRAISON ────────────────── */
  const deliver = (cid: string, pts: number) => {
    fetch(`${api}/loyalty/${companyId}/deliver/${cid}/${pts}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() =>
      setPending((p) =>
        p.filter((x) => x.client._id !== cid || x.points !== pts)
      )
    );
  };
  const deliverAll = () =>
    fetch(`${api}/loyalty/${companyId}/deliver-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => setPending([]));

  /* helper étoiles */
  const stars = (n: number) => (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="star">
          ★
        </span>
      ))}
    </>
  );

  /* ────────────────── RENDER ────────────────── */
  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main className="container">
        <h1 className="page-title">Programme Fidélité</h1>

        {/* RATIO */}
        <section className="section">
          <h2 className="section-title">Ratio</h2>

          <div className="tokens">
            <div className="token">
              <span className="token-value">{ratioAmount}DZD</span>
            </div>
            <div className="arrow">
              <div className="arrow-line" />
              <div className="arrow-head" />
            </div>
            <div className="token">
              <span className="token-value">{ratioPoints} pts</span>
            </div>
          </div>

          {/* === FORMULAIRE RATIO === */}
          <form onSubmit={submitRatio} className="ratio-form">
            <div className="form-group">
              <label className="form-label">Montant (DZD)</label>
              <input
                type="number"
                min={1}
                value={ratioAmount}
                onChange={(e) => setRatioAmount(+e.target.value)}
                className="input w-20"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Points</label>
              <input
                type="number"
                min={1}
                value={ratioPoints}
                onChange={(e) => setRatioPoints(+e.target.value)}
                className="input w-20"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
          </form>
        </section>

        {/* PALIERS */}
        <section className="section">
          <h2 className="section-title">Paliers</h2>

          {/* VISUALISATION DES PALIERS */}
          <div className="tiers">
            {tiers
              .sort((a, b) => a.points - b.points)
              .map((t, i, arr) => (
                <React.Fragment key={t._id}>
                  <div className="tier-card">
                    {/* vignette ronde */}
                    <div className="thumb">
                      {t.image ? (
                        <img
                          src={`${api}/${t.image}`}
                          className="thumb-img"
                          alt={t.reward}
                        />
                      ) : (
                        <span className="thumb-placeholder">📷</span>
                      )}
                    </div>

                    {/* infos */}
                    <div className="tier-points">{t.points} pts</div>
                    <div className="tier-reward">{t.reward}</div>
                  </div>

                  {/* flèche entre cartes */}
                  {i < arr.length - 1 && (
                    <div className="arrow-small">
                      <div className="arrow-small-line"></div>
                      <div className="arrow-small-head"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
          </div>

          {/* TABLE DES PALIERS */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Récompense</th>
                  <th>Pts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => {
                  const edit = editedTiers[t._id] ?? { points: t.points, reward: t.reward, imageFile: null }; // Fallback values

                  /* 1️⃣ L’image à afficher : nouvelle ↔ existante */
                  const preview = edit.imageFile
                    ? URL.createObjectURL(edit.imageFile) // aperçu immédiat
                    : t.image
                      ? `${api}/${t.image}`
                      : null;

                  /* 2️⃣ Détecte les champs modifiés */
                  const hasUnsaved =
                    edit.points !== t.points ||
                    edit.reward !== t.reward ||
                    !!edit.imageFile;

                  const btnClass = hasUnsaved ? "unsaved" : "just-saved";

                  return (
                    <tr key={t._id}>
                      {/* ------ IMAGE ------ */}
                      <td>
                        <div className="img-up">
                          <div className="preview">
                            {preview ? (
                              <img src={preview} className="w-full h-full object-cover" />
                            ) : (
                              <span>📷</span>
                            )}
                          </div>

                          {/* input upload */}
                          <label className="choose">
                            Choisir
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const f = e.target.files?.[0] || null;
                                setEditedTiers((et) => ({
                                  ...et,
                                  [t._id]: {
                                    points: et[t._id]?.points ?? t.points,
                                    reward: et[t._id]?.reward ?? t.reward,
                                    imageFile: f,
                                  },
                                }));
                              }}
                            />
                          </label>
                        </div>
                      </td>

                      {/* ------ POINTS ------ */}
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={edit.points}
                          onChange={(e) =>
                            setEditedTiers((et) => ({
                              ...et,
                              [t._id]: { ...edit, points: +e.target.value },
                            }))
                          }
                          className="input w-20"
                        />
                      </td>

                      {/* ------ RÉCOMPENSE ------ */}
                      <td>
                        <input
                          type="text"
                          value={edit.reward}
                          onChange={(e) =>
                            setEditedTiers((et) => ({
                              ...et,
                              [t._id]: { ...edit, reward: e.target.value },
                            }))
                          }
                          className="input w-full"
                        />
                      </td>

                      {/* ------ ACTIONS ------ */}
                      <td>
                        <button
                          className={`btn btn-primary btn-sm ${btnClass}`}
                          onClick={() => saveTier(t._id)}
                        >
                          Enregistrer
                        </button>{" "}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => delTier(t._id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    <button className="btn btn-secondary" onClick={addTier}>
                      + Ajouter un palier
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* RÉPÉTITIFS */}
        <section className="section">
          <h2 className="section-title">Défis Répétitifs</h2>

          {/* Cartes */}
          {repeatRewards?.length ? (
            <div className="tiers">
              {repeatRewards.map((r) => (
                <div key={r._id} className="card">
                  {/* vignette ronde */}
                  <div className="thumb">
                    {r.image ? (
                      <img src={`${api}/${r.image}`} alt={r.reward} />
                    ) : (
                      <span className="thumb-placeholder">📷</span>
                    )}
                  </div>

                  {/* infos */}
                  <div className="tier-points">Tous les {r.every}</div>
                  <div className="tier-reward">{r.reward}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="client-empty">Aucun défi enregistré</p>
          )}

          {/* table repeat */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pts</th>
                  <th>Récompense</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(repeatRewards ?? []).map((r) => {
                  const edit = editedRepeats[r._id] ?? {
                    every: r.every,
                    reward: r.reward,
                  };
                  return (
                    <tr key={r._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={edit.every}
                            onChange={(e) =>
                              setEditedRepeats((er) => ({
                                ...er,
                                [r._id]: { ...edit, every: +e.target.value },
                              }))
                            }
                            className="input w-20"
                          />
                          {stars(Math.min(edit.every, 5))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={edit.reward}
                          onChange={(e) =>
                            setEditedRepeats((er) => ({
                              ...er,
                              [r._id]: { ...edit, reward: e.target.value },
                            }))
                          }
                          className="input w-full"
                        />
                      </td>
                      <td>
                        <div className="img-up">
                          <div className="preview">
                            {r.image ? (
                              <img
                                src={`${api}/${r.image}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>📷</span>
                            )}
                          </div>
                          <label className="choose">
                            Choisir
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const f = e.target.files?.[0];
                                if (f)
                                  setEditedRepeats((er) => ({
                                    ...er,
                                    [r._id]: { ...edit, imageFile: f },
                                  }));
                              }}
                            />
                          </label>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveRepeat(r._id)}
                        >
                          Enregistrer
                        </button>{" "}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => delRepeat(r._id)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* ADD line */}
                <tr>
                  <td>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={newRepeat.every}
                        onChange={(e) =>
                          setNewRepeat((n) => ({
                            ...n,
                            every: +e.target.value,
                          }))
                        }
                        className="input w-20"
                      />
                      {stars(Math.min(newRepeat.every, 5))}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={newRepeat.reward}
                      onChange={(e) =>
                        setNewRepeat((n) => ({ ...n, reward: e.target.value }))
                      }
                      className="input w-full"
                    />
                  </td>
                  <td>
                    <div className="img-up">
                      <div className="preview">
                        {newRepeat.preview ? (
                          <img
                            src={newRepeat.preview}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>📷</span>
                        )}
                      </div>
                      <label className="choose">
                        Choisir
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;
                            setNewRepeat((n) => ({
                              ...n,
                              imageFile: f,
                              preview: f ? URL.createObjectURL(f) : null,
                            }));
                          }}
                        />
                      </label>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={addRepeat}
                    >
                      Ajouter
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CLIENTS */}
        <section className="section">
          <div className="clients-header">
            <h3 className="clients-title">Clients à récompenser</h3>
            <button className="btn btn-primary" onClick={deliverAll}>
              Livrer tout le monde
            </button>
          </div>
          {pending.length === 0 ? (
            <p className="client-empty">Aucune récompense en attente</p>
          ) : (
            <ul className="clients-list">
              {pending.map((p) => (
                <li key={p._id} className="client-item">
                  <div>
                    <span className="client-name">{p.client.nom_client } </span>
                    <span className=" client-points">
                      {p.rewardName || (p.type === "spend"
                        ? `${p.amount} dépensés`
                        : `${p.points} pts`)}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => deliver(p.client._id, p.points)}
                  >
                    Livrer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
