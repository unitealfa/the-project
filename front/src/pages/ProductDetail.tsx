import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from "@/constants";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Chargement...</p>;

  // Fonction utilitaire
  const resolveImageUrl = (img: string) => {
    if (!img) return "/default-product.jpg";
    return img.startsWith("http") ? img : `${API_URL}${img}`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: "auto" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>← Retour</button>
      <h2 style={{ marginTop: 0 }}>
        Détails du produit : {product.nom_product}
      </h2>
      {/* ===== Galerie d'images ===== */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        {(product.images && product.images.length > 0) ? (
          product.images.map((img: string, idx: number) =>
            img ? (
              <img
                key={idx}
                src={resolveImageUrl(img)}
                alt={`Produit-img-${idx}`}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #eee",
                  background: "#f8f9fa"
                }}
                onError={e => (e.currentTarget.src = "/default-product.jpg")}
              />
            ) : null
          )
        ) : (
          <div style={{
            width: 120, height: 120, background: "#eee", borderRadius: 10,
            color: "#bbb", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            Pas d’image
          </div>
        )}
      </div>
      <p><strong>Description :</strong> {product.description}</p>
      <p><strong>Catégorie :</strong> {product.categorie}</p>
      <p><strong>Type :</strong> {product.type?.join(', ')}</p>
      <p><strong>Prix de gros :</strong> {product.prix_gros}</p>
      <p><strong>Prix de détail :</strong> {product.prix_detail}</p>
      <p><strong>Poids :</strong> {product.specifications?.poids}</p>
      <p><strong>Volume :</strong> {product.specifications?.volume}</p>
    </div>
  );
}
