import React, { useEffect, useState } from 'react';
import { cartService, Cart as CartType, CartItem } from '@/services/cartService';

export const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Erreur lors du chargement du panier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    try {
      const updatedCart = await cartService.updateCartItem(productId, newQuantity);
      setCart(updatedCart);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité');
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article');
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      console.error('Erreur lors du vidage du panier');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Votre panier est vide</h2>
        <p>Ajoutez des articles à votre panier pour commencer vos achats</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <h2>Votre Panier</h2>
      {cart.items.map((item: CartItem) => (
        <div key={item.productId} className="cart-item">
          <span>Article ID: {item.productId}</span>
          <div className="cart-item-actions">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
            />
            <button onClick={() => handleRemoveItem(item.productId)}>
              Supprimer
            </button>
          </div>
        </div>
      ))}
      <button onClick={handleClearCart} className="clear-cart">
        Vider le panier
      </button>
    </div>
  );
}; 