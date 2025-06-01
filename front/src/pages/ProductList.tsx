import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { apiFetch } from '../utils/api';
import { cartService } from '../services/cartService';
import { PaginationSearch } from '../components/PaginationSearch';

interface Product {
  _id: string;
  nom_product: string;
  description: string;
  prix_detail: number;
  images: string[];
  disponibilite: { depot_id: string; quantite: number }[];
}

interface Client {
  _id: string;
  nom_client: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const clientId = query.get('clientId');

  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du client
        if (clientId) {
          const clientRes = await apiFetch(`/clients/${clientId}`);
          if (!clientRes.ok) throw new Error('Erreur lors de la récupération du client');
          const clientData = await clientRes.json();
          setClient(clientData);
        }

        // Récupérer la liste des produits du dépôt
        if (!user?.depot) {
          throw new Error('Aucun dépôt associé à votre compte');
        }

        const productsRes = await apiFetch(`/products/by-depot/${user.depot}`);
        if (!productsRes.ok) throw new Error('Erreur lors de la récupération des produits');
        const productsData = await productsRes.json();
        setProducts(productsData);
        
        // Initialiser les quantités à 1 pour chaque produit
        const initialQuantities = productsData.reduce((acc: { [key: string]: number }, product: Product) => {
          acc[product._id] = 1;
          return acc;
        }, {});
        setQuantities(initialQuantities);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId, user?.depot]);

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

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, Math.min(newQuantity, 100)) // Limite entre 1 et 100
    }));
  };

  const handleAddToCart = async (productId: string) => {
    if (!clientId) {
      setError('Aucun client sélectionné');
      return;
    }

    const quantity = quantities[productId] || 1;

    try {
      const res = await cartService.addToCart(productId, quantity, clientId);
      if (!res) throw new Error('Erreur lors de l\'ajout au panier');
      setSuccessMessage('Produit ajouté au panier avec succès');
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      // Effacer l'erreur après 3 secondes
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>📦 Catalogue des produits</h1>
          {client && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span>Client sélectionné :</span>
              <strong>{client.nom_client}</strong>
            </div>
          )}
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

        {successMessage && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            {successMessage}
          </div>
        )}

        <PaginationSearch
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Rechercher un produit..."
        />

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '2rem' 
        }}>
          {currentItems.map(product => {
            const depotStock = product.disponibilite.find(d => d.depot_id === user?.depot);
            const stock = depotStock?.quantite ?? 0;
            const quantity = quantities[product._id] || 1;

            return (
              <div key={product._id} style={{
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {product.images && product.images.length > 0 && (
                  <img
                    src={product.images[0]}
                    alt={product.nom_product}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                )}
                <h3 style={{ margin: 0 }}>{product.nom_product}</h3>
                <p style={{ margin: 0 }}>{product.description}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>
                  Prix : {product.prix_detail} €
                </p>
                <p style={{ margin: 0, color: stock > 0 ? '#10b981' : '#ef4444' }}>
                  Stock : {stock}
                </p>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleQuantityChange(product._id, quantity - 1)}
                      disabled={quantity <= 1}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: quantity <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={stock}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                      style={{
                        width: '60px',
                        padding: '0.25rem',
                        textAlign: 'center',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      onClick={() => handleQuantityChange(product._id, quantity + 1)}
                      disabled={quantity >= stock}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: quantity >= stock ? 'not-allowed' : 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={stock === 0}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: stock > 0 ? '#10b981' : '#9ca3af',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: stock > 0 ? 'pointer' : 'not-allowed',
                      fontSize: '1rem',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
} 