import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';             // ← chemin corrigé
import { Product } from '../types';

export default function GestionProduit() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/products')
      .then((res: Response) => res.json() as Promise<Product[]>)
      .then((data) => setProducts(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <>
      <Header/>
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>CRUD des produits</h1>
        <button onClick={() => navigate('/gestion-produit/ajouter')} style={{ marginBottom: '1rem' }}>
          Ajouter un produit
        </button>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nom</th><th>Prix gros</th><th>Prix détail</th><th>Quantité</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>{p.nom_product}</td>
                <td>{p.prix_gros}</td>
                <td>{p.prix_detail}</td>
                <td>{p.quantite_stock}</td>
                <td>
                  <button onClick={() => navigate(`/gestion-produit/${p._id}/edit`)}>✏️</button>{' '}
                  <button onClick={() => handleDelete(p._id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
