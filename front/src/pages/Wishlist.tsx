import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PaginationSearch } from '@/components/PaginationSearch';
import { wishlistService } from '@/services/wishlistService';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
import { AddToWishlistButton } from '@/components/AddToWishlistButton/AddToWishlistButton';

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
  images: string[];
}

export default function Wishlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await wishlistService.getWishlist();
        setProducts(data.products);
        setFilteredProducts(data.products);
      } catch (error) {
        console.error('Erreur lors du chargement de la wishlist:', error);
        setError('Impossible de charger votre liste de souhaits');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    // Filtrer les produits en fonction du terme de recherche
    const filtered = products.filter(product => 
      product.nom_product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Réinitialiser la page courante lors d'une nouvelle recherche
  }, [searchTerm, products]);

  // Calculer les produits à afficher pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Mes produits favoris</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/productclient')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🛍️ Retour aux produits
            </button>
            <button 
              onClick={() => navigate('/cart')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🛒 Voir mon panier
            </button>
          </div>
        </div>

        {error && (
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626', 
            borderRadius: '8px', 
            marginBottom: '1rem' 
          }}>
            {error}
          </div>
        )}

        <PaginationSearch
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Rechercher dans mes favoris..."
        />

        {currentItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Vous n'avez pas encore de produits favoris</p>
            <button 
              onClick={() => navigate('/productclient')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              Découvrir les produits
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
            {currentItems.map((product) => (
              <div 
                key={product._id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.nom_product}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
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