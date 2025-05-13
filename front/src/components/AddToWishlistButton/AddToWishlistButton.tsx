import React, { useState, useEffect } from 'react';
import { wishlistService } from '@/services/wishlistService';

interface AddToWishlistButtonProps {
  productId: string;
}

export const AddToWishlistButton: React.FC<AddToWishlistButtonProps> = ({ productId }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkWishlistStatus = async () => {
      try {
        const wishlist = await wishlistService.getWishlist();
        if (isMounted) {
          const isProductInWishlist = wishlist.products.some(
            (product: any) => product._id === productId
          );
          setIsInWishlist(isProductInWishlist);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de la wishlist:', error);
      }
    };

    checkWishlistStatus();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleWishlistToggle = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(productId);
      } else {
        await wishlistService.addToWishlist(productId);
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error('Erreur lors de la modification de la wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={isLoading}
      style={{
        padding: '0.5rem 1rem',
        backgroundColor: isInWishlist ? '#dc3545' : '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}
    >
      {isLoading ? (
        'Chargement...'
      ) : isInWishlist ? (
        <>
          <span>❤️</span> Retirer des favoris
        </>
      ) : (
        <>
          <span>🤍</span> Ajouter aux favoris
        </>
      )}
    </button>
  );
}; 