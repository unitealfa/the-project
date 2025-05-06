import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';
import { Product } from '../types';

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Omit<Product, '_id'>>({
    nom_product: '',
    prix_gros: 0,
    prix_detail: 0,
    date_expiration: '',
    quantite_stock: 0,
    description: '',
    categorie: '',
    images: [''],
    specifications: { poids: '', volume: '' },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/products/${id}`)
      .then((res: Response) => res.json() as Promise<Product>)
      .then(data => {
        const { _id, ...rest } = data;
        setForm(rest);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['prix_gros', 'prix_detail', 'quantite_stock'].includes(name)) {
      setForm(prev => ({ ...prev, [name]: Number(value) }));
    } else if (name === 'poids' || name === 'volume') {
      setForm(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [name]: value }
      }));
    } else if (name === 'images') {
      setForm(prev => ({ ...prev, images: [value] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    }).then(() => navigate('/gestion-produit'));
  };

  if (loading) return <p>Chargement du produit…</p>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Modifier le produit</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
          <label>
            Nom du produit
            <input name="nom_product" value={form.nom_product} onChange={handleChange} required />
          </label>
          <label>
            Prix gros
            <input type="number" name="prix_gros" value={form.prix_gros} onChange={handleChange} required />
          </label>
          <label>
            Prix détail
            <input type="number" name="prix_detail" value={form.prix_detail} onChange={handleChange} required />
          </label>
          <label>
            Quantité en stock
            <input type="number" name="quantite_stock" value={form.quantite_stock} onChange={handleChange} required />
          </label>
          <label>
            Date d'expiration
            <input type="date" name="date_expiration" value={form.date_expiration} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>
          <label>
            Catégorie
            <input name="categorie" value={form.categorie} onChange={handleChange} />
          </label>
          <label>
            URL Image
            <input name="images" value={form.images[0]} onChange={handleChange} />
          </label>
          <fieldset style={{ border: '1px solid #ccc', padding: '1rem' }}>
            <legend>Spécifications</legend>
            <label>
              Poids
              <input name="poids" value={form.specifications.poids} onChange={handleChange} />
            </label>
            <label>
              Volume
              <input name="volume" value={form.specifications.volume} onChange={handleChange} />
            </label>
          </fieldset>
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Enregistrer
          </button>
        </form>
      </main>
    </>
  );
}
