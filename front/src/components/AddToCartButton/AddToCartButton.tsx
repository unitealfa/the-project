import React, { useState } from 'react';
import { cartService } from '@/services/cartService';
import { Plus, Minus } from "lucide-react"; // Assure-toi d'avoir installé lucide-react

interface AddToCartButtonProps {
  productId: string;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ productId }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await cartService.addToCart(productId, quantity);
      setMessage('Produit ajouté au panier !');
      setQuantity(1);
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setMessage('Erreur lors de l\'ajout au panier');
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  const inc = () => setQuantity(q => q + 1);
  const dec = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
      {/* Contrôles quantité sans input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={dec}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 22
          }}
        >
          <Minus size={20} />
        </button>
        <span style={{ fontSize: 18, width: 32, textAlign: "center" }}>{quantity}</span>
        <button
          onClick={inc}
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 22
          }}
        >
          <Plus size={20} />
        </button>
      </div>
      {/* Bouton Ajouter au panier */}
      <button 
        onClick={handleAddToCart} 
        disabled={loading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: loading ? '#9ca3af' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: 160,
          fontSize: 16
        }}
      >
        {loading ? 'Ajout...' : 'Ajouter au panier'}
      </button>
      {message && (
        <p style={{ 
          margin: 0,
          color: message.includes('Erreur') ? '#ef4444' : '#10b981',
          fontSize: '0.875rem'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};
