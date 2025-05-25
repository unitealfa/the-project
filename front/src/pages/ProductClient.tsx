import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton/AddToWishlistButton";
import { API_URL } from "@/constants";

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
  images?: string[];
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

  // Fonction utilitaire pour l'URL d'image
  const resolveImageUrl = (img?: string) => {
    if (!img) return "/default-product.jpg";
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

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
                  background: "#fff"
                }}
              >
                {/* Affichage photo principale du produit */}
                <div style={{ width: 120, height: 120, margin: "0 auto" }}>
                  {p.images && p.images.length > 0 && p.images[0] ? (
                    <img
                      src={resolveImageUrl(p.images[0])}
                      alt={p.nom_product}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid #eee",
                        background: "#f8f9fa"
                      }}
                      onError={e => (e.currentTarget.src = "/default-product.jpg")}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                        borderRadius: 10,
                        color: "#bbb",
                        fontSize: 13,
                        border: "1px solid #eee"
                      }}
                    >
                      Pas d'image
                    </div>
                  )}
                </div>
                <h3 style={{ margin: 0 }}>{p.nom_product}</h3>
                <p style={{ margin: 0 }}>{p.description}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Prix : {p.prix_detail} €
                </p>

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
