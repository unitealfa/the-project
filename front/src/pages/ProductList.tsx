import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';
import { Product } from '../types';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/products')
      .then((res: Response) => res.json() as Promise<Product[]>)
      .then(data => setProducts(data))
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
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Liste des produits</h1>

        {/* Bouton d'ajout */}
        <button
          onClick={() => navigate('/gestion-produit/ajouter')}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            backgroundColor: '#28a745',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          + Ajouter un produit
        </button>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prix gros</th>
              <th>Prix détail</th>
              <th>Quantité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td>
                  <Link to={`/gestion-produit/${p._id}`}>{p.nom_product}</Link>
                </td>
                <td>{p.prix_gros}</td>
                <td>{p.prix_detail}</td>
                <td>{p.quantite_stock}</td>
                <td>
                  <Link to={`/gestion-produit/${p._id}/edit`} style={{ marginRight: '0.5rem' }}>
                    ✏️
                  </Link>
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
