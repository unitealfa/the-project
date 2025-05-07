// FRONTEND - ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product) return <p>Chargement...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Détails du produit : {product.nom_product}</h2>
      <p><strong>Description :</strong> {product.description}</p>
      <p><strong>Catégorie :</strong> {product.categorie}</p>
      <p><strong>Prix de gros :</strong> {product.prix_gros}</p>
      <p><strong>Prix de détail :</strong> {product.prix_detail}</p>
      <p><strong>Poids :</strong> {product.specifications?.poids}</p>
      <p><strong>Volume :</strong> {product.specifications?.volume}</p>
      <p><strong>Images :</strong> {product.images?.join(', ')}</p>

      <button onClick={() => navigate(-1)}>Retour</button>
    </div>
  );
}
