import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton/AddToWishlistButton";
import { cartService } from "@/services/cartService";
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { API_BASE_URL } from "../constants";
import "./ProductClient.css";

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
  interface CompanyInfo {
    id: string;
    nom_company: string;
  }
  const [availableCompanies, setAvailableCompanies] = useState<CompanyInfo[]>(
    []
  );
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [messageId, setMessageId] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12); // 12 products per page

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/clients`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data: Product[] = await res.json();
        // Transform image paths into absolute URLs
        const withFullPaths = data.map((p) => ({
          ...p,
          images: p.images.map(
            (imgPath) =>
              imgPath.startsWith("http")
                ? imgPath
                : `${API_BASE_URL}/${imgPath.replace(/^\//, "")}`
          ),
        }));
        setProduits(withFullPaths);

        const types = Array.from(
          new Set(data.map((p: Product) => p.categorie))
        ).sort();
        const companyIds = Array.from(
          new Set(data.map((p: Product) => p.company_id))
        );
        setAvailableTypes(types);
        try {
          const cRes = await fetch(`${API_BASE_URL}/loyalty/available`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          const comps: { _id: string; nom_company: string }[] =
            await cRes.json();
          const map = new Map(comps.map((c) => [c._id, c.nom_company]));
          const list = companyIds.map((id) => ({
            id,
            nom_company: map.get(id) || id,
          }));
          setAvailableCompanies(list);
        } catch {
          // Fallback: use raw IDs if lookup fails
          setAvailableCompanies(
            companyIds.map((id) => ({ id, nom_company: id }))
          );
        }
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

    const matchesCompany =
      selectedCompany === "" || p.company_id === selectedCompany;

    return matchesName && matchesType && matchesCompany;
  });

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProduits.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProduits.length / productsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, selectedType, selectedCompany]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, newQuantity),
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
      setMessageType("success");
      setTimeout(() => setMessageId(null), 2000);
    } catch (error) {
      setMessageId(productId);
      setMessageType("error");
      setTimeout(() => setMessageId(null), 2000);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Header />
      <div className="product-client-container">
        <div className="product-client-header">
          <div className="product-client-filters">
            <h1 className="product-client-title">Catalogue des produits</h1>
            <div className="search-input">
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
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
              className="filter-select"
            >
              <option value="">Toutes les entreprises</option>
              {availableCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom_company}
                </option>
              ))}
            </select>
          </div>
          <div className="quick-actions header-actions-right">
            <button
              className="header-action-btn wishlist"
              onClick={() => navigate("/wishlist")}
            >
              <Heart size={18} style={{ stroke: "#dc2626", marginRight: 2 }} />
              Ma wishlist
            </button>
            <button
              className="header-action-btn cart"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart
                size={18}
                style={{ stroke: "#4f46e5", marginRight: 2 }}
              />
              Mon panier
            </button>
          </div>
          {filteredProduits.length === 0 ? (
            <div className="no-products">
              <p>Aucun produit ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="products-grid">
              {currentProducts.map((p) => (
                <div key={p._id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={p.images[0]}
                      alt={p.nom_product}
                      className="product-image"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.startsWith(API_BASE_URL)) {
                          target.src = target.src.replace(API_BASE_URL + "/", "/");
                        }
                      }}
                    />
                  </div>
                  <div className="product-name">{p.nom_product}</div>
                  <div className="product-description">{p.description}</div>
                  <div className="product-price">
                    {p.prix_detail.toFixed(2)} DZD
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          p._id,
                          (quantities[p._id] || 1) - 1
                        )
                      }
                      disabled={(quantities[p._id] || 1) <= 1}
                      className="quantity-btn"
                    >
                      –
                    </button>
                    <span className="quantity-value">
                      {quantities[p._id] || 1}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          p._id,
                          (quantities[p._id] || 1) + 1
                        )
                      }
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div className="product-actions">
                    <button
                      onClick={() => handleAddToCart(p._id)}
                      disabled={loadingId === p._id}
                      className="add-to-cart-btn"
                    >
                      🛒{" "}
                      {loadingId === p._id ? "Ajout..." : "Ajouter au panier"}
                    </button>
                    <AddToWishlistButton productId={p._id} />
                  </div>

                  {messageId === p._id && (
                    <p className={`message ${messageType}`}>
                      {messageType === "success"
                        ? "Produit ajouté au panier !"
                        : "Erreur lors de l'ajout au panier"}
                    </p>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Affichage de {indexOfFirstProduct + 1} à{" "}
                    {Math.min(indexOfLastProduct, filteredProduits.length)} sur{" "}
                    {filteredProduits.length} produits
                  </div>
                  <div className="pagination-controls">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <ChevronLeft size={16} />
                      Précédent
                    </button>

                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`pagination-number ${
                              currentPage === page ? "active" : ""
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Suivant
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
