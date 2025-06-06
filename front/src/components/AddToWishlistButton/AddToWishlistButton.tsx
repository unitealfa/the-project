import React, { useState, useEffect } from 'react';
import { wishlistService } from '@/services/wishlistService';
import { Heart } from 'lucide-react';

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
      title={isInWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={{
        width: '40px',
        height: '40px',
        padding: '0',
        backgroundColor: isInWishlist ? '#fef2f2' : '#f8fafc',
        color: isInWishlist ? '#dc2626' : '#64748b',
        border: `1px solid ${isInWishlist ? '#fecaca' : '#e2e8f0'}`,
        borderRadius: '8px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
      onMouseOver={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = isInWishlist ? '#fee2e2' : '#f1f5f9';
          e.currentTarget.style.borderColor = isInWishlist ? '#fca5a5' : '#cbd5e1';
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseOut={(e) => {
        if (!isLoading) {
          e.currentTarget.style.backgroundColor = isInWishlist ? '#fef2f2' : '#f8fafc';
          e.currentTarget.style.borderColor = isInWishlist ? '#fecaca' : '#e2e8f0';
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      <Heart 
        size={20} 
        style={{
          fill: isInWishlist ? '#dc2626' : 'none',
          stroke: isInWishlist ? '#dc2626' : '#64748b',
          transition: 'all 0.2s'
        }}
      />
    </button>
  );
}; 