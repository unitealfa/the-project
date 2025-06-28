import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PaginationSearch } from '@/components/PaginationSearch';
import { wishlistService } from '@/services/wishlistService';
import { AddToCartButton } from '@/components/AddToCartButton/AddToCartButton';
import { AddToWishlistButton } from '@/components/AddToWishlistButton/AddToWishlistButton';
import { Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../constants';

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
        const base = API_BASE_URL || "";
        const cleaned = (data.products || []).map((p: Product) => ({
          ...p,
          images: (p.images || []).map((img: string) =>
            img.replace(/^http:\/\/localhost:5000/i, base)
          )
        }));
        setProducts(cleaned);
        setFilteredProducts(cleaned);
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
      <style>
        {`
          @media (max-width: 768px) {
            .wishlist-container {
              padding: 0 1rem !important;
            }
            .wishlist-title {
              font-size: 2rem !important;
            }
            .wishlist-icon {
              font-size: 2.5rem !important;
            }
            .breadcrumb {
              font-size: 0.85rem !important;
              padding: 1.5rem 0 0.5rem 0 !important;
            }
            .wishlist-table {
              display: none !important;
            }
            .wishlist-cards {
              display: block !important;
            }
            .wishlist-card {
              display: flex;
              flex-direction: column;
              background: #fff;
              border: 1px solid #f3f4f6;
              border-radius: 12px;
              padding: 1rem;
              margin-bottom: 1rem;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .card-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 1rem;
            }
            .card-image {
              width: 80px;
              height: 80px;
              object-fit: cover;
              border-radius: 8px;
              background: #f8fafc;
              border: 1px solid #f3f4f6;
            }
            .card-content {
              flex: 1;
              margin-left: 1rem;
            }
            .card-title {
              font-weight: 700;
              font-size: 1.1rem;
              margin-bottom: 0.5rem;
              color: #1a1a1a;
            }
            .card-price {
              font-weight: 600;
              color: #4f46e5;
              font-size: 1.1rem;
              margin-bottom: 0.5rem;
            }
            .card-stock {
              color: #7cb342;
              font-weight: 600;
              font-size: 0.9rem;
              margin-bottom: 1rem;
            }
            .card-actions {
              display: flex;
              gap: 0.5rem;
              justify-content: space-between;
            }
            .card-button {
              flex: 1;
              padding: 0.75rem;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s;
            }
            .card-button-primary {
              background: #4f46e5;
              color: white;
            }
            .card-button-primary:hover {
              background: #4338ca;
            }
            .card-button-danger {
              background: #fee2e2;
              color: #dc2626;
            }
            .card-button-danger:hover {
              background: #fecaca;
            }
          }
          @media (min-width: 769px) {
            .wishlist-cards {
              display: none !important;
            }
            .wishlist-table {
              display: table !important;
            }
          }
          @media (max-width: 480px) {
            .wishlist-container {
              padding: 0 0.5rem !important;
            }
            .wishlist-title {
              font-size: 1.8rem !important;
            }
            .wishlist-icon {
              font-size: 2rem !important;
            }
            .card-image {
              width: 60px;
              height: 60px;
            }
            .card-title {
              font-size: 1rem;
            }
            .card-price {
              font-size: 1rem;
            }
            .card-actions {
              flex-direction: column;
            }
            .card-button {
              width: 100%;
            }
          }
        `}
      </style>
      <main style={{
        background: '#fff',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        padding: '0 0 4rem 0',
      }}>
        {/* Fil d'Ariane */}
        <div className="breadcrumb" style={{
          fontSize: '0.98rem',
          color: '#888',
          padding: '2rem 0 0.5rem 0',
          textAlign: 'center',
          letterSpacing: '1px',
        }}>
          ACCUEIL / FAVORIS
        </div>
        {/* En-tête centré */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="wishlist-icon" style={{ fontSize: '3rem', color: '#1a1a1a', marginBottom: '0.5rem' }}>♡</div>
          <h1 className="wishlist-title" style={{
            fontSize: '2.7rem',
            fontWeight: 800,
            color: '#222',
            margin: 0,
            letterSpacing: '-1px',
          }}>Ma liste de souhaits</h1>
        </div>
        <div className="wishlist-container" style={{ maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '0 0.5rem' }}>
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}
          {currentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>Vous n'avez pas encore de produits favoris</p>
              <button
                onClick={() => navigate('/productclient')}
                style={{
                  marginTop: "2rem",
                  padding: "0.75rem 1.5rem",
                  background: "#1a1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: "24px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '1px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#333'}
                onMouseOut={e => e.currentTarget.style.background = '#1a1a1a'}
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <>
              {/* Version Desktop - Tableau */}
              <table className="wishlist-table" style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'transparent',
                fontSize: '1.08rem',
                color: '#1a1a1a',
                marginTop: '2rem',
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#888', fontWeight: 700, fontSize: '1.08rem', letterSpacing: '1px' }}>
                    <th style={{ width: 40 }}></th>
                    <th style={{ textAlign: 'left', padding: '0 0 1rem 0', fontWeight: 700 }}>Produit</th>
                    <th style={{ textAlign: 'center', padding: '0 0 1rem 0', fontWeight: 700 }}>Prix unitaire</th>
                    <th style={{ textAlign: 'center', padding: '0 0 1rem 0', fontWeight: 700 }}>Statut stock</th>
                    <th style={{ textAlign: 'center', padding: '0 0 1rem 0', fontWeight: 700 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map(product => (
                    <tr key={product._id} style={{ borderBottom: '1px solid #f3f4f6', height: 90 }}>
                      {/* Supprimer */}
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <button
                          onClick={() => wishlistService.removeFromWishlist(product._id).then(() => setProducts(products.filter(p => p._id !== product._id)))}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            background: '#f3f4f6',
                            color: '#888',
                            fontSize: 18,
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s, color 0.2s, transform 0.15s',
                          }}
                          onMouseOver={e => {e.currentTarget.style.background = '#fee2e2';e.currentTarget.style.color='#dc2626';e.currentTarget.style.transform='scale(1.1)';}}
                          onMouseOut={e => {e.currentTarget.style.background = '#f3f4f6';e.currentTarget.style.color='#888';e.currentTarget.style.transform='none';}}
                          title="Supprimer"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                      {/* Image + nom */}
                      <td style={{ padding: '1.2rem 0', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.nom_product}
                              style={{
                                width: 56,
                                height: 56,
                                objectFit: 'cover',
                                borderRadius: 8,
                                background: '#f8fafc',
                                border: '1px solid #f3f4f6',
                              }}
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '1.08rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{product.nom_product}</div>
                          </div>
                        </div>
                      </td>
                      {/* Prix unitaire */}
                      <td style={{ textAlign: 'center', fontWeight: 500 }}>
                        {product.prix_detail.toFixed(2)} DZD
                      </td>
                      {/* Stock */}
                      <td style={{ textAlign: 'center', color: '#7cb342', fontWeight: 600 }}>En stock</td>
                      {/* Ajouter au panier */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => navigate('/productclient')}
                          style={{
                            padding: '0.6rem 1.5rem',
                            background: '#4f46e5',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 24,
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            letterSpacing: '1px',
                            cursor: 'pointer',
                            transition: 'background 0.2s, transform 0.15s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                          }}
                          onMouseOver={e => {e.currentTarget.style.background = '#4338ca';e.currentTarget.style.transform='scale(1.05)';}}
                          onMouseOut={e => {e.currentTarget.style.background = '#4f46e5';e.currentTarget.style.transform='none';}}
                        >
                          Ajouter au panier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Version Mobile - Cartes */}
              <div className="wishlist-cards">
                {currentItems.map(product => (
                  <div key={product._id} className="wishlist-card">
                    <div className="card-header">
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.nom_product}
                            className="card-image"
                          />
                        )}
                        <div className="card-content">
                          <div className="card-title">{product.nom_product}</div>
                          <div className="card-price">{product.prix_detail.toFixed(2)} DZD</div>
                          <div className="card-stock">En stock</div>
                        </div>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => navigate('/productclient')}
                        className="card-button card-button-primary"
                      >
                        Ajouter au panier
                      </button>
                      <button
                        onClick={() => wishlistService.removeFromWishlist(product._id).then(() => setProducts(products.filter(p => p._id !== product._id)))}
                        className="card-button card-button-danger"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
} 