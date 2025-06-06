import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton/AddToWishlistButton";
import { cartService } from '@/services/cartService';

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
  images: string[];
  categorie: string; // ajouté
  company_id: string; // ajouté
}

export default function ProductClient() {
  const [produits, setProduits] = useState<Product[]>([]);
  const [searchName, setSearchName] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch("/api/products/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data: Product[] = await res.json();
        setProduits(data);

        const types = Array.from(new Set(data.map((p: Product) => p.categorie))).sort();
        const companies = Array.from(new Set(data.map((p: Product) => p.company_id))).sort();
        setAvailableTypes(types);
        setAvailableCompanies(companies);
      } catch (err) {
        console.error("Erreur lors du chargement des produits", err);
      }
    };
    fetchProduits();
  }, []);

  const filteredProduits = produits.filter((p) => {
    const matchesName = p.nom_product
      .toLowerCase()
      .includes(searchName.toLowerCase().trim());

    const matchesType = selectedType === "" || p.categorie === selectedType;

    const matchesCompany = selectedCompany === "" || p.company_id === selectedCompany;

    return matchesName && matchesType && matchesCompany;
  });

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, newQuantity)
    }));
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setLoadingId(productId);
      setMessageId(null);
      setMessageType(null);
      const quantity = quantities[productId] || 1;
      await cartService.addToCart(productId, quantity);
      setMessageId(productId);
      setMessageType('success');
      setTimeout(() => setMessageId(null), 2000);
    } catch (error) {
      setMessageId(productId);
      setMessageType('error');
      setTimeout(() => setMessageId(null), 2000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Header />
      <div style={{
        padding: '2rem',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#fafafa',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: '#fafafa',
          padding: '2rem 0',
          borderRadius: '8px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <h1 style={{
              color: '#1a1a1a',
              fontSize: '1.3rem',
              borderBottom: '2px solid #1a1a1a',
              paddingBottom: '0.5rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              margin: 0
            }}>Catalogue des produits</h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => navigate('/cart')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
              >
                🛒 Voir mon panier
              </button>
              <button
                onClick={() => navigate('/wishlist')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#fff',
                  color: '#4f46e5',
                  border: '2px solid #4f46e5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#f3f4f6';e.currentTarget.style.color = '#4338ca';}}
                onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#fff';e.currentTarget.style.color = '#4f46e5';}}
              >
                ❤️ Ma liste de souhaits
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              flex: '1',
              minWidth: '250px'
            }}>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s',
                  background: '#fff',
                  fontWeight: 500
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: '#fff',
                minWidth: '200px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <option value="">Tous les types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: '#fff',
                minWidth: '200px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            >
              <option value="">Toutes les entreprises</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchName('');
                setSelectedType('');
                setSelectedCompany('');
              }}
              disabled={!searchName && !selectedType && !selectedCompany}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f3f4f6',
                color: '#1a1a1a',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                cursor: !searchName && !selectedType && !selectedCompany ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                opacity: !searchName && !selectedType && !selectedCompany ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (searchName || selectedType || selectedCompany) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseOut={(e) => {
                if (searchName || selectedType || selectedCompany) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>

          {filteredProduits.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              fontWeight: 500
            }}>
              <p style={{
                fontSize: '1.2rem',
                color: '#666',
                margin: 0
              }}>Aucun produit ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2.5rem',
              marginTop: '1.5rem'
            }}>
              {filteredProduits.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '2rem 1.2rem 1.5rem 1.2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxSizing: 'border-box',
                    minHeight: 420,
                    border: 'none',
                    boxShadow: 'none',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    position: 'relative',
                    outline: '1.5px solid #f3f4f6',
                  }}
                  onMouseOver={e => {e.currentTarget.style.transform='translateY(-2px) scale(1.01)';e.currentTarget.style.outline='2.5px solid #e0e0e0';}}
                  onMouseOut={e => {e.currentTarget.style.transform='none';e.currentTarget.style.outline='1.5px solid #f3f4f6';}}
                >
                  {p.images && p.images.length > 0 && (
                    <div style={{
                      width: 120,
                      height: 120,
                      borderRadius: 10,
                      background: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.2rem',
                      border: '1px solid #f3f4f6',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={p.images[0]}
                        alt={p.nom_product}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 10,
                        }}
                      />
                    </div>
                  )}
                  <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.2rem' }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1.08rem',
                      marginBottom: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: '#1a1a1a',
                    }}>{p.nom_product}</div>
                    <div style={{ color: '#aaa', fontSize: '0.97rem', fontWeight: 400, marginBottom: 8 }}>{p.description}</div>
                    <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#4f46e5', marginBottom: 8 }}>{p.prix_detail.toFixed(2)} €</div>
                  </div>
                  {/* Bloc quantité seul */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f3f4f6',
                    borderRadius: 20,
                    padding: '0.5rem 1.2rem',
                    marginBottom: '1.1rem',
                    gap: '.5rem',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    <button
                      onClick={() => handleQuantityChange(p._id, (quantities[p._id] || 1) - 1)}
                      disabled={(quantities[p._id] || 1) <= 1}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        color: '#1a1a1a',
                        fontSize: 18,
                        cursor: (quantities[p._id] || 1) <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s, transform 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      –
                    </button>
                    <span style={{ minWidth: 32, textAlign: 'center', fontWeight: 600, fontSize: '1.08rem' }}>{quantities[p._id] || 1}</span>
                    <button
                      onClick={() => handleQuantityChange(p._id, (quantities[p._id] || 1) + 1)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background: '#fff',
                        color: '#1a1a1a',
                        fontSize: 18,
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.2s, transform 0.15s',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseOut={e => e.currentTarget.style.background = '#fff'}
                    >
                      +
                    </button>
                  </div>
                  {/* Bouton ajouter au panier + wishlist côte à côte */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    marginBottom: '0.5rem',
                  }}>
                    <button
                      onClick={() => handleAddToCart(p._id)}
                      disabled={loadingId === p._id}
                      style={{
                        flex: 1,
                        padding: '0.75rem 0',
                        background: '#1a1a1a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: '1rem',
                        letterSpacing: '1px',
                        cursor: loadingId === p._id ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s, transform 0.15s',
                        boxShadow: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                      }}
                      onMouseOver={e => !loadingId && (e.currentTarget.style.background = '#333')}
                      onMouseOut={e => !loadingId && (e.currentTarget.style.background = '#1a1a1a')}
                    >
                      🛒 {loadingId === p._id ? 'Ajout...' : 'Ajouter au panier'}
                    </button>
                    <AddToWishlistButton productId={p._id} />
                  </div>
                  {messageId === p._id && (
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      color: messageType === 'success' ? '#10b981' : '#ef4444',
                      fontSize: '0.95rem',
                      textAlign: 'center',
                      fontWeight: 500
                    }}>
                      {messageType === 'success' ? 'Produit ajouté au panier !' : 'Erreur lors de l\'ajout au panier'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
