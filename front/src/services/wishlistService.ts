import axios from 'axios';
import { API_URL } from '../constants';

let wishlistCache: any = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5000; // 5 secondes

export const wishlistService = {
  getWishlist: async () => {
    const now = Date.now();
    if (wishlistCache && now - lastFetchTime < CACHE_DURATION) {
      console.log('Utilisation du cache de la wishlist');
      return wishlistCache;
    }

    try {
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Wishlist récupérée:', response.data);
      wishlistCache = response.data;
      lastFetchTime = now;
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (productId: string) => {
    try {
      console.log('Ajout du produit à la wishlist:', productId);
      const response = await axios.post(
        `${API_URL}/wishlist/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Produit ajouté à la wishlist:', response.data);
      wishlistCache = response.data;
      lastFetchTime = Date.now();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (productId: string) => {
    try {
      console.log('Suppression du produit de la wishlist:', productId);
      const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Produit supprimé de la wishlist:', response.data);
      wishlistCache = response.data;
      lastFetchTime = Date.now();
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la suppression de la wishlist:', error);
      throw error;
    }
  },

  clearCache: () => {
    wishlistCache = null;
    lastFetchTime = 0;
  }
}; 