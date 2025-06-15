import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
      setCart(data?.items ?? []);

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

  const total = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.prix_detail * item.quantity;
  }, 0);

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

      const res = await orderService.createOrder({ items: orderItems, total });
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
              <button
                onClick={() => navigate("/productclient")}
                className="cart-summary action-btn primary-btn"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Prix</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(
                  (item) =>
                    item.product && (
                      <tr key={item._id}>
                        {/* Produit */}
                        <td>
                          <div className="product-info">
                            {item.product.images &&
                              item.product.images.length > 0 && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.nom_product}
                                />
                              )}
                            <div className="product-details">
                              <div className="product-name">
                                {item.product.nom_product}
                              </div>
                              <div className="product-price">
                                {item.product.prix_detail.toFixed(2)} € / unité
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Prix unitaire */}
                        <td>{item.product.prix_detail.toFixed(2)} €</td>
                        {/* Quantité */}
                        <td>
                          <div className="quantity-controls">
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
                            <span className="quantity-value">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        {/* Total */}
                        <td>
                          {(item.product.prix_detail * item.quantity).toFixed(2)} €
                        </td>
                        {/* Supprimer */}
                        <td>
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            className="delete-btn"
                            title="Supprimer"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          )}
        </section>
        {/* Colonne droite : récapitulatif */}
        <aside className="cart-summary">
          <h3>Récapitulatif</h3>
          <div className="total-section">
            <div className="total-row">
              <span>Total</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <div className="taxes-note">
              Taxes incluses. Livraison calculée à l'étape suivante.
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="action-btn primary-btn"
          >
            <ShoppingCart size={22} style={{ marginBottom: -2 }} /> Valider la commande
          </button>
          <button
            onClick={handleClearCart}
            className="action-btn danger-btn"
          >
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

      {/* --------  Modal Bon de Livraison (PRO) -------- */}
      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowModal(false);
            setConfirmedOrders([]);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Bon de Livraison</h3>
            <div className="bl-preview">
              {/* --------- AVANT confirmation --------- */}
              {confirmedOrders.length === 0 && (
                <>
                  <div>
                    <b>Client :</b> {user?.nom_client || "-"}
                    <br />
                    <b>Téléphone :</b>{" "}
                    {user?.contact?.telephone || user?.num || "-"}
                    <br />
                    <b>Adresse :</b>{" "}
                    {(user?.localisation?.adresse || "-") +
                      (user?.localisation?.ville
                        ? ", " + user?.localisation?.ville
                        : "") +
                      (user?.localisation?.code_postal
                        ? ", " + user?.localisation?.code_postal
                        : "")}
                    <br />
                    <b>Date :</b> {new Date().toLocaleString()}
                    <br />
                    <b>Nom du dépôt :</b>{" "}
                    {user?.depot_name || user?.depot || "-"}
                    <br />
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map(
                        (item) =>
                          item.product && (
                            <tr key={item.productId}>
                              <td>{item.product.nom_product}</td>
                              <td>{item.quantity}</td>
                              <td>{item.product.prix_detail.toFixed(2)} €</td>
                              <td>
                                {(item.product.prix_detail * item.quantity).toFixed(2)} €
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </table>
                  <div className="total-row">
                    Total général : {total.toFixed(2)} €
                  </div>
                </>
              )}

              {/* --------- APRÈS confirmation --------- */}
              {confirmedOrders.map((confirmedOrder, idx) => (
                <div
                  key={idx}
                  ref={(el) => {
                    if (el) {
                      blRefs.current[idx] = el;
                    }
                  }}
                >
                  <div>
                    <b>Numéro de commande :</b>{" "}
                    {confirmedOrder.numero ||
                      confirmedOrder._id?.slice(-6).toUpperCase() ||
                      "-"}
                    <br />
                    <b>Client :</b> {confirmedOrder.nom_client || "-"}
                    <br />
                    <b>Téléphone :</b> {confirmedOrder.telephone || "-"}
                    <br />
                    <b>Adresse :</b>{" "}
                    {(confirmedOrder.adresse_client?.adresse || "-") +
                      (confirmedOrder.adresse_client?.ville
                        ? ", " + confirmedOrder.adresse_client.ville
                        : "") +
                      (confirmedOrder.adresse_client?.code_postal
                        ? ", " + confirmedOrder.adresse_client.code_postal
                        : "")}
                    <br />
                    <b>Date :</b>{" "}
                    {new Date(confirmedOrder.createdAt).toLocaleString()}
                    <br />
                    <b>Nom du dépôt :</b> {confirmedOrder.depot_name || "-"}
                    <br />
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedOrder.items?.map(
                        (item: any, idx2: number) =>
                          item && (
                            <tr key={idx}>
                              <td>{item.productName}</td>
                              <td>{item.quantity}</td>
                              <td>{item.prix_detail?.toFixed(2)} €</td>
                              <td>
                                {(item.prix_detail * item.quantity).toFixed(2)} €
                              </td>
                            </tr>
                          )
                      )}
                    </tbody>
                  </table>
                  <div className="total-row">
                    Total général : {confirmedOrder.total?.toFixed(2)} €
                  </div>
                  <button
                    onClick={() => handleExportPDF(idx)}
                    className="action-btn primary-btn"
                  >
                    Exporter le BL en PDF
                  </button>
                </div>
              ))}
            </div>
            {/* ----------- BOUTONS MODAL ----------- */}
            {confirmedOrders.length === 0 ? (
              <div className="action-buttons">
                <button
                  onClick={handleSendOrder}
                  className="confirm-btn"
                  disabled={sending}
                >
                  {sending ? "Envoi..." : "Confirmer la commande"}
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
              </div>
            ) : (
              <div className="action-buttons">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setConfirmedOrders([]);
                  }}
                  className="close-btn"
                >
                  Fermer
                </button>
              </div>
            )}
            {orderError && (
              <div className="error-message">{orderError}</div>
            )}
          </div>
        </div>
      )}

      {/* --------  Modal Édition quantité -------- */}
      {editItemId && (
        <div
          className="quantity-editor"
          onClick={closeEditor}
        >
          <div
            className="quantity-editor-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Modifier la quantité</h4>
            <div className="controls">
              <button
                onClick={() => setEditQty(Math.max(1, editQty - 1))}
              >
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
              <button
                onClick={() => setEditQty(editQty + 1)}
              >
                +
              </button>
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
              <button
                onClick={closeEditor}
                className="cancel-btn"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast succès */}
      {orderSuccess && (
        <div className="success-toast">
          {orderSuccess}
        </div>
      )}
    </>
  );
}