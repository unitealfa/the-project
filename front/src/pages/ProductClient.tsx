import React, { useEffect, useState } from "react";
import Header from "../components/Header";

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
}

interface ObjectIdLike {
  $oid: string;
}

interface Affectation {
  entreprise: string | ObjectIdLike;
  depot: string | ObjectIdLike;
}

interface User {
  id: string;
  email: string;
  role: string;
  affectations?: Affectation[];
}

export default function ProductClient() {
  const [produits, setProduits] = useState<Product[]>([]);

  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch(`/api/products/clients`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        console.log("🧪 Produits reçus côté client :", data); // ✅ LOG ICI
        setProduits(data);
      } catch (err) {
        console.error("Erreur lors du chargement des produits", err);
      }
    };

    fetchProduits();
  }, []);

  return (
    <>
      <Header />
      <main style={{ padding: "2rem" }}>
        <h2>Produits disponibles</h2>
        {produits.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <ul>
            {produits.map((p) => (
              <li key={p._id}>
                <h4>{p.nom_product}</h4>
                <p>{p.description}</p>
                <p>Prix: {p.prix_detail} €</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
