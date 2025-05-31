import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  nom_client: string;
  numero?: string;
  items: OrderItem[];
  etat_livraison: 'en_attente' | 'en_cours' | 'livree';
  photosLivraison?: Array<{ url: string; takenAt: string }>;
}

export default function LivreurCommandeDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBase = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/api/orders/${orderId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setError('Commande non trouvée');
        }
      } catch (e) {
        setError('Erreur lors du chargement de la commande');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, apiBase]);

  const handleFileChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedPhotos(prev => ([...prev, ...newFiles].slice(0, 4)));
    setPreviews(prev => ([...prev, ...newFiles.map(f => URL.createObjectURL(f))].slice(0, 4)));
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    setPreviews(prev => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index]);
      copy.splice(index, 1);
      return copy;
    });
  };

  const uploadPhotos = async () => {
    if (!order || selectedPhotos.length === 0) return;
    const form = new FormData();
    selectedPhotos.forEach(f => form.append('photos', f));
    const res = await fetch(`${apiBase}/api/orders/${order._id}/photos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: form
    });
    if (res.ok) {
      setSelectedPhotos([]);
      setPreviews([]);
      // Rafraîchir la commande pour voir les nouvelles preuves
      const data = await res.json();
      setOrder(data);
    } else {
      alert('Erreur lors de l\'upload des photos');
    }
  };

  const deletePhoto = async (photoIdx: number) => {
    if (!order) return;
    const res = await fetch(`${apiBase}/api/orders/${order._id}/photos/${photoIdx}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      // Rafraîchir la commande
      const data = await res.json();
      setOrder(data);
    } else {
      alert("Erreur lors de la suppression de la photo");
    }
  };

  const updateDeliveryStatus = async (orderId: string, status: 'en_attente' | 'en_cours' | 'livree') => {
    const res = await fetch(`${apiBase}/api/orders/${orderId}/delivery-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const data = await res.json();
      setOrder(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#f59e0b';
      case 'en_cours': return '#3b82f6';
      case 'livree': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'en_cours': return 'En cours';
      case 'livree': return 'Livrée';
      default: return status;
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!order) return null;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: 600, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' }}>← Retour</button>
        <h2 style={{ marginBottom: 0 }}>{order.nom_client}</h2>
        {order.numero && (
          <div style={{ color: '#6b7280', fontWeight: 500, marginBottom: 8 }}>
            N° commande : {order.numero}
          </div>
        )}
        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: getStatusColor(order.etat_livraison), color: 'white', fontSize: '0.875rem', marginBottom: 16, display: 'inline-block' }}>
          {getStatusText(order.etat_livraison)}
        </span>
        <h3>Produits de la commande</h3>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {order.items.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{item.productName} × {item.quantity}</li>
          ))}
        </ul>
        <h3 style={{ marginTop: 24 }}>Preuves de livraison</h3>
        {order.photosLivraison && order.photosLivraison.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {order.photosLivraison.map((p, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img
                  src={`${apiBase}${p.url}`}
                  alt={`Preuve ${i+1}`}
                  style={{ maxWidth: 120, maxHeight: 120, objectFit: 'cover', borderRadius: 4 }}
                />
                <button
                  onClick={() => deletePhoto(i)}
                  style={{
                    position: 'absolute',
                    top: -6, right: -6,
                    background: 'red',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20, height: 20,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: 16
                  }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : <p style={{ color: '#6b7280' }}>Aucune preuve pour cette commande.</p>}

        {order.etat_livraison === 'en_cours' && (
          <div style={{ marginTop: 16 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFileChange(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}>
              Prendre / Choisir photos
            </button>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {previews.map((url, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={url}
                      alt={`Aperçu ${i+1}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }}
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: 'absolute',
                        top: -6, right: -6,
                        background: 'red',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20, height: 20,
                        color: 'white',
                        cursor: 'pointer'
                      }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={uploadPhotos}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem', marginRight: '0.5rem' }}>
              Valider les preuves
            </button>
            <button
              onClick={() => updateDeliveryStatus(order._id, 'livree')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '0.5rem' }}>
              Valider la livraison
            </button>
          </div>
        )}
        {order.etat_livraison === 'livree' && (
          <div style={{ marginTop: 16 }}>
            <button
              onClick={() => updateDeliveryStatus(order._id, 'en_cours')}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Annuler la validation
            </button>
          </div>
        )}
      </main>
    </>
  );
} 