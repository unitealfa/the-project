import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";

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
  const navigate = useNavigate();

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
        console.log("🧪 Produits reçus côté client :", data);
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h2>Produits disponibles</h2>
          <button 
            onClick={() => navigate('/cart')}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Consulter mon panier
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {produits.length === 0 ? (
            <p>Aucun produit trouvé.</p>
          ) : (
            produits.map((p) => (
              <div 
                key={p._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}
              >
                <h3 style={{ margin: 0 }}>{p.nom_product}</h3>
                <p style={{ margin: 0 }}>{p.description}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>Prix: {p.prix_detail} €</p>
                <AddToCartButton productId={p._id} />
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
