import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { wishlistService } from '@/services/wishlistService';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
import { AddToWishlistButton } from '@/components/AddToWishlistButton/AddToWishlistButton';
import { API_URL } from '@/constants';

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
  images?: string[];
}

export default function Wishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.getWishlist();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Erreur lors du chargement de la wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Centralise la gestion de l'URL de l'image (externe ou backend)
  const resolveImageUrl = (img?: string) => {
    if (!img) return "/default-product.jpg";
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: '2rem' }}>
          <p>Chargement de vos favoris...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2>Mes produits favoris</h2>
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

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Vous n'avez pas encore de produits favoris</p>
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
              Découvrir les produits
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: '#fff'
                }}
              >
                {/* --- Image principale produit --- */}
                <div style={{ width: 120, height: 120, margin: "0 auto" }}>
                  {product.images && product.images.length > 0 && product.images[0] ? (
                    <img
                      src={resolveImageUrl(product.images[0])}
                      alt={product.nom_product}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid #eee",
                        background: "#f8f9fa"
                      }}
                      onError={e => (e.currentTarget.src = "/default-product.jpg")}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                        borderRadius: 10,
                        color: "#bbb",
                        fontSize: 13,
                        border: "1px solid #eee"
                      }}
                    >
                      Pas d'image
                    </div>
                  )}
                </div>
                <h3 style={{ margin: 0 }}>{product.nom_product}</h3>
                <p style={{ margin: 0 }}>{product.description}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Prix: {product.prix_detail} €</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <AddToCartButton productId={product._id} />
                  <AddToWishlistButton productId={product._id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
