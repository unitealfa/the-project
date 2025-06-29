import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { apiFetch } from "../utils/api";
import { cartService } from "../services/cartService";
import { PaginationSearch } from "../components/PaginationSearch";
import Toast from "../components/Toast";
import "../pages-css/Toast.css";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const clientId = query.get("clientId");

  const rawUser = localStorage.getItem("user");
  const user = rawUser ? JSON.parse(rawUser) : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les informations du client
        if (clientId) {
          const clientRes = await apiFetch(`/clients/${clientId}`);
          if (!clientRes.ok)
            throw new Error("Erreur lors de la récupération du client");
          const clientData = await clientRes.json();
          setClient(clientData);
        }

        // Récupérer la liste des produits du dépôt
        if (!user?.depot) {
          throw new Error("Aucun dépôt associé à votre compte");
        }

        const productsRes = await apiFetch(`/products/by-depot/${user.depot}`);
        if (!productsRes.ok)
          throw new Error("Erreur lors de la récupération des produits");
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Initialiser les quantités à 1 pour chaque produit
        const initialQuantities = productsData.reduce(
          (acc: { [key: string]: number }, product: Product) => {
            acc[product._id] = 1;
            return acc;
          },
          {}
        );
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
    const filtered = products.filter(
      (product) =>
        product.nom_product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1); // Réinitialiser la page courante lors d'une nouvelle recherche
  }, [searchTerm, products]);

  // Calculer les produits à afficher pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, Math.min(newQuantity, 100)), // Limite entre 1 et 100
    }));
  };

  const handleAddToCart = async (productId: string) => {
    if (!clientId) {
      setError("Aucun client sélectionné");
      return;
    }

    const quantity = quantities[productId] || 1;

    try {
      const res = await cartService.addToCart(productId, quantity, clientId);
      if (!res) throw new Error("Erreur lors de l'ajout au panier");
      setSuccessMessage("Produit ajouté au panier avec succès");
      // Effacer le message après 3 secondes
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message);
      // Effacer l'erreur après 3 secondes
      setTimeout(() => setError(""), 3000);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <Header />
      <main className="product-list-main">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2.5rem",
            padding: "0 1rem",
          }}
        >
          {client && (
            <div className="client-selected">
              <span>Client sélectionné :</span>
              <strong>{client.nom_client}</strong>
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              borderRadius: "14px",
              marginBottom: "1.5rem",
              border: "1px solid #fecaca",
              boxShadow: "0 1px 4px 0 rgba(220,38,38,0.03)",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <PaginationSearch
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Rechercher un produit..."
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem",
            padding: "0 1rem",
          }}
        >
          {currentItems.map((product) => {
            const depotStock = product.disponibilite.find(
              (d) => d.depot_id === user?.depot
            );
            const stock = depotStock?.quantite ?? 0;
            const quantity = quantities[product._id] || 1;

            return (
              <div
                key={product._id}
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "18px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.2rem",
                  background: "#fff",
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {product.images && product.images.length > 0 && (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "200px",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.nom_product}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {product.nom_product}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: "#666",
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {product.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "auto",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#1a1a1a",
                      }}
                    >
                      {product.prix_detail.toFixed(2)} DZD
                    </p>
                    <span
                      style={{
                        padding: "0.4rem 0.8rem",
                        borderRadius: "999px",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        backgroundColor: stock > 0 ? "#f0fdf4" : "#fef2f2",
                        color: stock > 0 ? "#16a34a" : "#dc2626",
                        border: `1px solid ${
                          stock > 0 ? "#bbf7d0" : "#fecaca"
                        }`,
                      }}
                    >
                      Stock : {stock}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.8rem",
                      padding: "0.5rem",
                      backgroundColor: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleQuantityChange(product._id, quantity - 1)
                      }
                      disabled={quantity <= 1}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        cursor: quantity <= 1 ? "not-allowed" : "pointer",
                        color: quantity <= 1 ? "#9ca3af" : "#1a1a1a",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        transition: "all 0.2s",
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={stock}
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          product._id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      style={{
                        width: "60px",
                        padding: "0.4rem",
                        textAlign: "center",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "1rem",
                        fontWeight: 500,
                      }}
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(product._id, quantity + 1)
                      }
                      disabled={quantity >= stock}
                      style={{
                        padding: "0.4rem 0.8rem",
                        backgroundColor: "#fff",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        cursor: quantity >= stock ? "not-allowed" : "pointer",
                        color: quantity >= stock ? "#9ca3af" : "#1a1a1a",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        transition: "all 0.2s",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={stock === 0}
                    style={{
                      padding: "0.8rem 1.5rem",
                      backgroundColor: stock > 0 ? "#1a1a1a" : "#f3f4f6",
                      color: stock > 0 ? "#fff" : "#9ca3af",
                      border: "none",
                      borderRadius: "12px",
                      cursor: stock > 0 ? "pointer" : "not-allowed",
                      fontSize: "1rem",
                      fontWeight: 600,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {successMessage && (
        <Toast
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </>
  );
}
