import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then(res => res.json())
      .then((data: Product) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    navigate('/gestion-produit');
  };

  if (loading) return <p>Chargement…</p>;
  if (!product) return <p>Produit non trouvé</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Détail : {product.nom_product}</h1>
      <p><strong>Prix gros :</strong> {product.prix_gros}</p>
      <p><strong>Prix détail :</strong> {product.prix_detail}</p>
      <p><strong>Quantité stock :</strong> {product.quantite_stock}</p>
      <p><strong>Expiration :</strong> {product.date_expiration}</p>
      <p><strong>Catégorie :</strong> {product.categorie}</p>
      <p><strong>Description :</strong> {product.description}</p>
      <p><strong>Spécifications :</strong> poids {product.specifications.poids}, volume {product.specifications.volume}</p>
      {product.images.map((url, i) => (
        <img key={i} src={url} alt={product.nom_product} style={{ maxWidth: '200px', marginRight: '1rem' }} />
      ))}

      <div style={{ marginTop: '2rem' }}>
        <Link to={`/gestion-produit/${id}/edit`} style={{ marginRight: '1rem' }}>✏️ Modifier</Link>
        <button onClick={handleDelete}>🗑️ Supprimer</button>
      </div>
    </main>
  );
}
