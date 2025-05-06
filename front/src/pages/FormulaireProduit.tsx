import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';             // ← chemin corrigé
import { Product } from '../types';

interface FormulaireProduitProps {
  mode: 'create' | 'edit';
}

const FormulaireProduit: React.FC<FormulaireProduitProps> = ({ mode }) => {
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
    specifications: {
      poids: '',
      volume: '',
    },
  });
  const [loading, setLoading] = useState(mode === 'edit');

  useEffect(() => {
    if (mode === 'edit' && id) {
      apiFetch(`/products/${id}`)
        .then((res: Response) => res.json() as Promise<Product>)
        .then((data) => {
          const { _id, ...rest } = data;
          setForm(rest);
        })
        .finally(() => setLoading(false));
    }
  }, [mode, id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['prix_gros','prix_detail','quantite_stock'].includes(name)) {
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
    const method = mode === 'create' ? 'POST' : 'PUT';
    const endpoint = mode === 'create' ? '/products' : `/products/${id}`;
    apiFetch(endpoint, {
      method,
      body: JSON.stringify(form),
    }).then(() => navigate('/gestion-produit'));
  };

  if (loading) return <p>Chargement du produit…</p>;

  return (
    <>
      <Header/>
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>{mode === 'create' ? 'Ajouter' : 'Modifier'} un produit</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
          {/* ...les champs exactly comme avant... */}
          <label>
            Nom du produit
            <input type="text" name="nom_product" value={form.nom_product} onChange={handleChange} required />
          </label>
          {/* Les autres champs */}
          <button type="submit">
            {mode === 'create' ? 'Créer' : 'Enregistrer'}
          </button>
        </form>
      </main>
    </>
  );
};

export default FormulaireProduit;
