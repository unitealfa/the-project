import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { cartService } from '@/services/cartService';

interface Product {
  _id: string;
  nom_product: string;
  prix_detail: number;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: Product | null;
}

interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      console.log('Données du panier reçues:', data);
      if (data && data.items) {
        setCart(data.items);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await cartService.updateCartItem(productId, newQuantity);
      fetchCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      fetchCart();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
    } catch (error) {
      console.error('Erreur lors de la vidange du panier:', error);
    }
  };

  const total = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (item.product.prix_detail * item.quantity);
  }, 0);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem' }}>
          <p>Chargement du panier...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Mon panier</h2>
          <button 
            onClick={() => navigate('/productclient')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retour aux produits
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Votre panier est vide</p>
            <button 
              onClick={() => navigate('/productclient')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              {cart.map((item) => (
                item.product && (
                  <div 
                    key={item._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderBottom: '1px solid #e5e7eb',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0 }}>{item.product.nom_product}</h3>
                      <p style={{ margin: '0.5rem 0' }}>Prix unitaire : {item.product.prix_detail} €</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#e5e7eb',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#e5e7eb',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div>
                <h3 style={{ margin: 0 }}>Total: {total.toFixed(2)} €</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleClearCart}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Vider le panier
                </button>
                <button
                  onClick={() => {/* TODO: Implémenter la validation de la commande */}}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Valider la commande
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
} 