import React, { useState } from 'react';
import { cartService } from '@/services/cartService';

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
      // Effacer le message après 2 secondes
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setMessage('Erreur lors de l\'ajout au panier');
      // Effacer le message d'erreur après 2 secondes
      setTimeout(() => setMessage(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: '60px',
            padding: '0.25rem',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}
        />
        <button 
          onClick={handleAddToCart} 
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#9ca3af' : '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter au panier'}
        </button>
      </div>
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