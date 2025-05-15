import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService'; // AJOUT

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
  const [showModal, setShowModal] = useState(false); // AJOUT
  const [sending, setSending] = useState(false); // AJOUT
  const [orderError, setOrderError] = useState<string | null>(null); // AJOUT
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null); // AJOUT
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      if (data && data.items) {
        setCart(data.items);
      } else {
        setCart([]);
      }
    } catch (error) {
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
      // handle error
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      fetchCart();
    } catch (error) {
      // handle error
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
    } catch (error) {
      // handle error
    }
  };

  const total = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + (item.product.prix_detail * item.quantity);
  }, 0);

  // AJOUT : Handler pour valider la commande
  const handleSendOrder = async () => {
    setSending(true);
    setOrderError(null);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.product?.nom_product ?? '',
        prix_detail: item.product?.prix_detail ?? 0,
        quantity: item.quantity
      }));
      await orderService.createOrder({
        items: orderItems,
        total
      });
      await cartService.clearCart();
      setCart([]);
      setOrderSuccess('Commande envoyée avec succès !');
      setShowModal(false);
    } catch (err) {
      setOrderError('Erreur lors de la validation');
    } finally {
      setSending(false);
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

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
                {/* AJOUT : bouton valider la commande */}
                <button
                  onClick={() => setShowModal(true)}
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
        
        {/* AJOUT : Modal de confirmation */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              left: 0, top: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '2rem',
                minWidth: '320px',
                maxWidth: '95vw'
              }}
            >
              <h3>Confirmer la commande</h3>
              <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                {cart.map(item => item.product && (
                  <div key={item.productId} style={{ borderBottom: '1px solid #eee', padding: 4 }}>
                    <b>{item.product.nom_product}</b> x {item.quantity} = {(item.product.prix_detail * item.quantity).toFixed(2)} €
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <b>Total:</b> {total.toFixed(2)} €
              </div>
              {orderError && <div style={{ color: 'red', marginBottom: 8 }}>{orderError}</div>}
              <button
                onClick={handleSendOrder}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: 4,
                  marginRight: 8
                }}
                disabled={sending}
              >
                {sending ? "Envoi..." : "Confirmer la commande"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        {orderSuccess && (
          <div style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#10b981',
            color: 'white',
            padding: 12,
            borderRadius: 8,
            zIndex: 2000
          }}>
            {orderSuccess}
          </div>
        )}
      </main>
    </>
  );
}
