// FRONTEND - ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header'; // Assuming you have a Header component

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Erreur lors du chargement du produit.");
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <p>Chargement...</p>
          </div>
        </main>
      </>
    );
  }

   if (error) {
    return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
           <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: '#4a5568',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
            >
              ← Retour
            </button>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
     return (
      <>
        <Header />
        <main style={{
          padding: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: '#f4f7f6',
          minHeight: 'calc(100vh - 64px)',
          fontFamily: 'Arial, sans-serif'
        }}>
           <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
             <p>Produit non trouvé.</p>
             <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: '#4a5568',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s ease'
              }}
            >
              ← Retour
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header /> {/* Assuming you have a Header component */}
      <main style={{
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        backgroundColor: '#f4f7f6', // Soft background color
        minHeight: 'calc(100vh - 64px)',
        fontFamily: 'Arial, sans-serif'
      }}>
         <div style={{
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)', // Softer shadow
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: '#4a5568', // Darker gray for secondary action
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              marginBottom: '2rem',
              fontSize: '1rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            ← Retour
          </button>

          <h1 style={{ color: '#1a1a1a', fontSize: '2rem', marginBottom: '2rem', borderBottom: '2px solid #1a1a1a', paddingBottom: '0.5rem' }}>
            Détails du produit : {product.nom_product}
          </h1>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', // Responsive grid for layout
            gap: '2rem',
          }}>

            {/* Product Images */}
            <div style={{
              // Card-like styling for images section if needed, or just a container
            }}>
               <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Images</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                {(Array.isArray(product.images) ? product.images : []).map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    style={{
                      width: '150px', // Slightly larger image previews
                      height: '150px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0', // Lighter border
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' // Subtle shadow
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div style={{
              // Card-like styling for details section if needed, or just a container
            }}>
              <h2 style={{ color: '#1a1a1a', fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Informations</h2>
              <div style={{ marginBottom: '1rem' }}><strong style={{ color: '#555' }}>Description :</strong> <span style={{ color: '#333' }}>{product.description}</span></div>
              <div style={{ marginBottom: '1rem' }}><strong style={{ color: '#555' }}>Catégorie :</strong> <span style={{ color: '#333' }}>{product.categorie}</span></div>
              <div style={{ marginBottom: '1rem' }}><strong style={{ color: '#555' }}>Type :</strong> <span style={{ color: '#333' }}>{product.type?.join(', ') || '-'}</span></div>
               <div style={{ marginBottom: '1rem' }}><strong style={{ color: '#555' }}>Prix de gros :</strong> <span style={{ color: '#333' }}>{product.prix_gros ? `${product.prix_gros} €` : '-'}</span></div>
               <div style={{ marginBottom: '1rem' }}><strong style={{ color: '#555' }}>Prix de détail :</strong> <span style={{ color: '#333' }}>{product.prix_detail ? `${product.prix_detail} €` : '-'}</span></div>
              {product.specifications && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                  <h3 style={{ color: '#1a1a1a', fontSize: '1.1rem', marginBottom: '1rem' }}>Spécifications</h3>
                  <div style={{ marginBottom: '0.5rem' }}><strong style={{ color: '#555' }}>Poids :</strong> <span style={{ color: '#333' }}>{product.specifications.poids || '-'}</span></div>
                  <div><strong style={{ color: '#555' }}>Volume :</strong> <span style={{ color: '#333' }}>{product.specifications.volume || '-'}</span></div>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
