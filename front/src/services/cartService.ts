import axios from 'axios';
import { API_URL } from '@/constants';

export interface Product {
  _id: string;
  nom_product: string;
  prix_detail: number;
}

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export const cartService = {
  async addToCart(productId: string, quantity: number): Promise<Cart> {
    console.log('Ajout au panier:', { productId, quantity });
    const response = await axios.post(`${API_URL}/api/cart`, {
      productId,
      quantity,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Réponse ajout au panier:', response.data);
    return response.data;
  },

  async getCart(): Promise<Cart> {
    console.log('Récupération du panier');
    const response = await axios.get(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Réponse panier:', response.data);
    return response.data;
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    console.log('Mise à jour du panier:', { productId, quantity });
    const response = await axios.put(`${API_URL}/api/cart/${productId}`, {
      quantity,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Réponse mise à jour:', response.data);
    return response.data;
  },

  async removeFromCart(productId: string): Promise<Cart> {
    console.log('Suppression du panier:', { productId });
    const response = await axios.delete(`${API_URL}/api/cart/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Réponse suppression:', response.data);
    return response.data;
  },

  async clearCart(): Promise<Cart> {
    console.log('Vidage du panier');
    const response = await axios.delete(`${API_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Réponse vidage:', response.data);
    return response.data;
  },
}; 