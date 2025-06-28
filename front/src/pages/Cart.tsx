import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { API_BASE_URL } from "../constants";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";
import "./Cart.css";

interface Product {
  _id: string;
  nom_product: string;
  prix_detail: number;
  images: string[];
  disponibilite: Array<{
    depot_id: string;
    quantite: number;
  }>;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: Product | null;
}

interface DepotStock {
  depot_id: string;
  quantite: number;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<Record<string, number>>({});

  // ---- État pour édition quantité
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(1);

  // ---- Commandes confirmées (retournées par backend)
  const [confirmedOrders, setConfirmedOrders] = useState<any[]>([]);

  const navigate = useNavigate();
  const blRefs = useRef<Array<HTMLDivElement | null>>([]);

  // ---- User depuis localStorage
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw);
      return null;
    } catch {
      return null;
    }
  })();

  // ------------------ API ------------------
  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      console.log("Données du panier:", data);
            const base = API_BASE_URL || "";
      const cleaned = (data?.items ?? []).map((it) => ({
        ...it,
        product: it.product
          ? {
              ...it.product,
              images: (it.product.images || []).map((img) =>
                img.replace(/^http:\/\/localhost:5000/i, base)
              ),
            }
          : null,
      }));
      setCart(cleaned);

      // Récupérer les informations de stock pour chaque produit
      const stockData: Record<string, number> = {};
      for (const item of data?.items ?? []) {
        if (item.product?.disponibilite) {
          const depotId = user?.affectations?.[0]?.depot;
          const depotStock = item.product.disponibilite.find(
            (d: DepotStock) => d.depot_id === depotId
          );
          if (depotStock) {
            stockData[item.productId] = depotStock.quantite;
          }
        }
      }
      setStockInfo(stockData);
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;
    
    // Vérifier le stock disponible
    const availableStock = stockInfo[productId];
    if (availableStock && newQuantity > availableStock) {
      alert(`Stock insuffisant. Il ne reste que ${availableStock} unité(s) disponible(s).`);
      return;
    }
    
    try {
      await cartService.updateCartItem(productId, newQuantity);
      fetchCart();
    } catch {}
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      fetchCart();
    } catch {}
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
    } catch {}
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Montant total du panier courant
  const cartTotal = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.prix_detail * item.quantity;
  }, 0);
  // Total à afficher (panier ou commande confirmée)
  const displayTotal =
    confirmedOrders.length > 0 ? confirmedOrders[0].total : cartTotal;

  // ----------- PDF BL (pour après confirmation) -----------
  const handleExportPDF = async (idx: number) => {
    const el = blRefs.current[idx];
    if (!el) return;
    const canvas = await html2canvas(el);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const imgWidth = 500;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 50, 40, imgWidth, imgHeight);
    pdf.save("bon-de-livraison.pdf");
  };

  // ------------- Confirmer la commande ----------------
  const handleSendOrder = async () => {
    setSending(true);
    setOrderError(null);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        productName: item.product?.nom_product ?? "",
        prix_detail: item.product?.prix_detail ?? 0,
        quantity: item.quantity,
      }));

      // Utilise le montant du panier avant nettoyage
      const res = await orderService.createOrder({
        items: orderItems,
        total: cartTotal,
      });
      await cartService.clearCart();
      setCart([]);
      setConfirmedOrders(res); // <= stocke la commande complète
      setOrderSuccess("Commande envoyée avec succès !");
      // NE PAS fermer la modale ici, attends l'action du client
    } catch (error: any) {
      console.error("Erreur lors de la validation:", error);
      const message =
        error?.message ||
        error.response?.data?.message ||
        "Erreur lors de la validation de la commande";
      setOrderError(message);
      alert(message);
    } finally {
      setSending(false);
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

  // --------- Éditeur de quantité (local) -----------
  const openEditor = (item: CartItem) => {
    setEditItemId(item.productId);
    setEditQty(item.quantity);
  };
  const closeEditor = () => setEditItemId(null);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ padding: "2rem" }}>
          <p>Chargement du panier...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="cart-container">
        {/* Colonne gauche : produits */}
        <section className="cart-products">
          <h2>Votre panier</h2>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 0" }}>
              <p style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
                Votre panier est vide
              </p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(
                (item) =>
                  item.product && (
                    <div key={item._id} className="cart-item">
                      {/* image + nom + Qté */}
                      <div className="item-info">
                        <img
                          src={item.product.images?.[0] || "/placeholder.png"}
                          alt={item.product.nom_product}
                        />
                        <div className="item-text">
                          <p className="item-name">
                            {item.product.nom_product}
                          </p>
                          <p className="item-qty">Qté : {item.quantity}</p>
                          {/* Affichage de l'alerte de stock limité */}
                          {stockInfo[item.productId] && stockInfo[item.productId] <= 10 && (
                            <p className="stock-warning" style={{ 
                              color: '#dc2626', 
                              fontSize: '0.85rem', 
                              margin: '4px 0 0 0',
                              fontWeight: '500'
                            }}>
                              ⚠️ Plus que {stockInfo[item.productId]} dispo en stock
                            </p>
                          )}
                        </div>
                      </div>

                      {/* boutons +/- et supprimer */}
                      <div className="item-actions">
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="quantity-btn"
                        >
                          –
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          onClick={() =>
                            handleQuantityChange(
                              item.productId,
                              item.quantity + 1
                            )
                          }
                          disabled={stockInfo[item.productId] ? item.quantity >= stockInfo[item.productId] : false}
                          className="quantity-btn"
                          title={stockInfo[item.productId] && item.quantity >= stockInfo[item.productId] ? 
                            `Stock limité : ${stockInfo[item.productId]} disponible(s)` : 
                            "Augmenter la quantité"
                          }
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="delete-btn"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </section>
        {/* Colonne droite : récapitulatif */}
        <aside className="cart-summary">
          <h3>Récapitulatif</h3>
          <div className="total-section">
            <div className="total-row">
              <span>Total</span>
              <span>{cartTotal.toFixed(2)} DZD</span>
            </div>
            <div className="taxes-note">
              Taxes incluses. Livraison calculée à l'étape suivante.
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="action-btn primary-btn"
          >
            <ShoppingCart size={22} style={{ marginBottom: -2 }} /> Valider la
            commande
          </button>
          <button onClick={handleClearCart} className="action-btn danger-btn">
            <Trash2 size={20} style={{ marginBottom: -2 }} /> Vider le panier
          </button>
          <button
            onClick={() => navigate("/productclient")}
            className="action-btn secondary-btn"
          >
            Continuer les achats
          </button>
        </aside>
      </main>

      {/* ========= Modal BL – Version épurée ========= */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setConfirmedOrders([]);
          }}
        >
          <div
            className="modal-content bl-clean"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bandeau latéral couleur + titre */}
            <aside className="bl-aside" />

            <section
              className="bl-body"
              ref={(el) => {
                blRefs.current[0] = el as HTMLDivElement | null;
              }}
            >
              {/* ---------- En-tête ---------- */}
              <header className="bl-top">
                <h2>Bon de Livraison</h2>
                <small className="bl-ref">
                  Réf. {confirmedOrders[0]?.numero || "PROV."}
                </small>
              </header>

              {/* ---------- Coordonnées ---------- */}
              <div className="bl-grid">
                <div>
                  <h4>Client</h4>
                  <p>
                    {user?.nom_client || "-"}
                    <br />
                    {user?.contact?.telephone || user?.num || "-"}
                    <br />
                    {(user?.localisation?.adresse || "-") +
                      (user?.localisation?.ville
                        ? ", " + user?.localisation.ville
                        : "")}
                  </p>
                </div>
                <div>
                  <h4>Dépôt</h4>
                  <p>
                    {user?.depot_name || user?.depot || "-"}
                    <br />
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* ---------- Détail des articles ---------- */}
              <table className="bl-clean-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Qté</th>
                    <th>PU&nbsp;(DZD)</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {(confirmedOrders.length > 0
                    ? confirmedOrders[0].items
                    : cart
                  ).map((it: any) => (
                    <tr key={it.productId}>
                      <td>{it.productName || it.product?.nom_product}</td>
                      <td>{it.quantity}</td>
                      <td>
                        {(it.prix_detail ?? it.product?.prix_detail)?.toFixed(
                          2
                        )}
                      </td>
                      <td>
                        {(
                          (it.prix_detail ?? it.product?.prix_detail ?? 0) *
                          it.quantity
                        ).toFixed(2)}{" "}
                        DZD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* ---------- Total ---------- */}
              <p className="bl-total">TOTAL : {displayTotal.toFixed(2)} DZD</p>

              {/* ---------- Boutons ---------- */}
              <div className="bl-actions" data-html2canvas-ignore="true">
                {confirmedOrders.length === 0 ? (
                  <>
                    <button
                      onClick={handleSendOrder}
                      disabled={sending}
                      className="confirm-btn"
                    >
                      {sending ? "Envoi..." : "Valider"}
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setConfirmedOrders([]);
                      }}
                      className="cancel-btn"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleExportPDF(0)}
                      className="primary-btn"
                    >
                      Télécharger PDF
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setConfirmedOrders([]);
                      }}
                      className="close-btn"
                    >
                      Fermer
                    </button>
                  </>
                )}
              </div>
              {orderError && <div className="error-message">{orderError}</div>}
            </section>
          </div>
        </div>
      )}

      {/* --------  Modal Édition quantité -------- */}
      {editItemId && (
        <div className="quantity-editor" onClick={closeEditor}>
          <div
            className="quantity-editor-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Modifier la quantité</h4>
            <div className="controls">
              <button onClick={() => setEditQty(Math.max(1, editQty - 1))}>
                -
              </button>
              <input
                type="number"
                min={1}
                value={editQty}
                onChange={(e) =>
                  setEditQty(Math.max(1, Number(e.target.value)))
                }
              />
              <button onClick={() => setEditQty(editQty + 1)}>+</button>
            </div>
            <div className="buttons">
              <button
                onClick={async () => {
                  await handleQuantityChange(editItemId!, editQty);
                  closeEditor();
                }}
                className="ok-btn"
              >
                OK
              </button>
              <button onClick={closeEditor} className="cancel-btn">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast succès */}
      {orderSuccess && <div className="success-toast">{orderSuccess}</div>}
    </>
  );
}
