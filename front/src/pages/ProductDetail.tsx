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
    <div key={product._id} style={{
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '2rem', padding: '0.75rem 1.5rem', backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>← Retour</button>
        <h2 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>Détails du produit : {product.nom_product}</h2>
        <p><strong>Description :</strong> {product.description}</p>
        <p><strong>Catégorie :</strong> {product.categorie}</p>
        <p><strong>Type :</strong> {product.type?.join(', ')}</p>
        <p><strong>Prix de gros :</strong> {product.prix_gros}</p>
        <p><strong>Prix de détail :</strong> {product.prix_detail}</p>
        <p><strong>Poids :</strong> {product.specifications?.poids}</p>
        <p><strong>Volume :</strong> {product.specifications?.volume}</p>
        <div>
          <strong>Images :</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
            {(Array.isArray(product.images) ? product.images : []).map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`Product ${index + 1}`}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #1a1a1a' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
