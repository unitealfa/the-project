import React, { useState } from 'react';
import { cartService } from '@/services/cartService';
import { Plus, Minus, ShoppingCart } from "lucide-react";

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        backgroundColor: '#f8fafc',
        padding: '0.5rem',
        borderRadius: '8px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <button
          onClick={dec}
          style={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#64748b'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <Minus size={16} />
        </button>
        <span style={{ 
          fontSize: '1rem', 
          fontWeight: '500',
          color: '#1e293b',
          minWidth: '2rem',
          textAlign: 'center'
        }}>
          {quantity}
        </span>
        <button
          onClick={inc}
          style={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#64748b'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <Plus size={16} />
        </button>
      </div>

      <button 
        onClick={handleAddToCart} 
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: loading ? '#94a3b8' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          fontSize: '0.875rem',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
        }}
        onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4338ca')}
        onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4f46e5')}
      >
        <ShoppingCart size={18} />
        {loading ? 'Ajout...' : 'Ajouter au panier'}
      </button>

      {message && (
        <p style={{ 
          margin: 0,
          color: message.includes('Erreur') ? '#ef4444' : '#10b981',
          fontSize: '0.875rem',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};
