// front/src/pages/LoyaltyClient.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";

interface Tier {
  points: number;
  reward: string;
  image?: string;
}
interface SpendProgress {
  targetAmount: number;
  currentAmount: number;
}
interface RepeatReward {
  _id: string;
  every: number;
  reward: string;
  image?: string;
}

export default function LoyaltyClient() {
  const { companyId } = useParams<{ companyId: string }>();
  const api = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token") || "";
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [points, setPoints] = useState(0);
  const [spend, setSpend] = useState<SpendProgress | null>(null);
  const [repeatRewards, setRepeatRewards] = useState<RepeatReward[]>([]);
  const [progress, setProgress] = useState<{ [id: string]: number | undefined }>({});

  useEffect(() => {
    if (!companyId) return;

    // programme + points client
    fetch(`${api}/loyalty/${companyId}/client-data`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setTiers(data.tiers || []);
        setPoints(data.points || 0);
      })
      .catch(console.error);

    // progrès dépenses (peut ne pas exister)
    fetch(`${api}/loyalty/${companyId}/spend-progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 404) {
          // l’entreprise n’a pas configuré ce système
          setSpend(null);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setSpend(data);
      })
      .catch(() => setSpend(null));

    fetch(`${api}/loyalty/${companyId}/repeat-rewards`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then((rewards: RepeatReward[]) => {
        setRepeatRewards(rewards)
        rewards.forEach(rr => {
          fetch(`${api}/loyalty/${companyId}/repeat-progress/${rr._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(data => {
              setProgress(p => ({ ...p, [rr._id]: data.current }))
            })
            .catch(() => setProgress(p => ({ ...p, [rr._id]: undefined })))
        })
      })
      .catch(console.error)
  }, [api, token, companyId]);

  const totalRequired = tiers.length ? tiers[tiers.length - 1].points : 0;
  const percent =
    totalRequired > 0 ? Math.min(100, (points / totalRequired) * 100) : 0;

  const spendPercent =
    spend && spend.targetAmount > 0
      ? Math.min(100, (spend.currentAmount / spend.targetAmount) * 100)
      : 0;

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h1>Mes Points</h1>

        {/* barre de progression points */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 24,
            background: "#eee",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "#4f46e5",
              transition: "width .5s ease",
            }}
          />
          {tiers.map((t) => {
            const pos = totalRequired ? (t.points / totalRequired) * 100 : 0;
            return (
              <div
                key={t.points + "-" + t.reward}
                style={{
                  position: "absolute",
                  left: `${pos}%`,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "#555",
                  transform: "translateX(-1px)",
                }}
              />
            );
          })}
        </div>

        {/* légende points */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {tiers.map((t, i) => (
            <div
              key={t.points + "-" + i}
              style={{
                textAlign: "center",
                flex: 1,
                fontSize: 12,
              }}
            >
              {t.image && (
                <img
                  src={`${api}/${t.image}`}
                  alt={t.reward}
                  style={{
                    width: 32,
                    height: 32,
                    objectFit: "cover",
                    borderRadius: 4,
                    marginBottom: 4,
                  }}
                />
              )}
              <div>{t.points} pts</div>
              <div style={{ fontWeight: 500 }}>{t.reward}</div>
            </div>
          ))}
        </div>

{repeatRewards.map(r => {
          const curr = progress[r._id];
          if (curr === undefined) return null;
          const percent = Math.min(100, (curr / r.every) * 100);
          return (
            <div key={r._id} style={{ marginTop: '2rem' }}>
              <h2>Récompense tous les {r.every} pts</h2>
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 24,
                  background: '#eee',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: 'orange',
                    transition: 'width .5s ease'
                  }}
                />
              </div>
              <p style={{ marginTop: 8 }}>
                {curr} / {r.every} pts
              </p>
            </div>
          );
        })}
        {/* barre dépenses – affichée seulement si configurée */}
        {spend && spend.targetAmount > 0 && (
          <>
            <h2 style={{ marginTop: "2rem" }}>Progrès dépenses</h2>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 24,
                background: "#eee",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${spendPercent}%`,
                  height: "100%",
                  background: "#16a34a",
                  transition: "width .5s ease",
                }}
              />
            </div>
            <p style={{ marginTop: 8 }}>
              {spend.currentAmount} / {spend.targetAmount} DA
            </p>
          </>
        )}

        <p style={{ marginTop: 12 }}>
          Vous avez <strong>{points}</strong> / <strong>{totalRequired}</strong>{" "}
          pts
        </p>
      </main>
    </>
  );
}
