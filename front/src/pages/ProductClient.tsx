import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

interface Product {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  depot: string;
}

interface Affectation {
  entreprise: string;
  depot: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  affectations?: Affectation[];
}

export default function ProductClient() {
  const [produits, setProduits] = useState<Product[]>([]);
  const raw = localStorage.getItem('user');
  const user: User | null = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    const fetchProduits = async () => {
      if (!user || !user.affectations) return;

      const depotIds = user.affectations.map((a) => a.depot);
      const query = depotIds.map((id) => `depot=${id}`).join('&');

      const res = await fetch(`/api/produits/clients?${query}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      setProduits(data);
    };

    fetchProduits();
  }, [user]);

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <h2>Produits disponibles</h2>
        {produits.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <ul>
            {produits.map((p) => (
              <li key={p._id}>
                <h4>{p.nom}</h4>
                <p>{p.description}</p>
                <p>Prix: {p.prix} €</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
