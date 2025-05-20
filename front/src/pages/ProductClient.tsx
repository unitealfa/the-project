import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton/AddToWishlistButton";

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
}

export default function ProductClient() {
  const [produits, setProduits] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch("/api/products/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2>Produits disponibles</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/wishlist")}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Mes favoris
            </button>
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "0.6rem 1.2rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Mon panier
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {produits.length === 0 ? (
            <p>Aucun produit trouvé.</p>
          ) : (
            produits.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <h3 style={{ margin: 0 }}>{p.nom_product}</h3>
                <p style={{ margin: 0 }}>{p.description}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Prix : {p.prix_detail} €
                </p>

                {/* Le AddToCartButton gère la quantité lui-même */}
                <div style={{ display: "flex", gap: "1rem" }}>
                  <AddToCartButton productId={p._id} />
                  <AddToWishlistButton productId={p._id} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
