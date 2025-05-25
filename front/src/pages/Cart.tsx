import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Pencil } from "lucide-react";
import { API_URL } from "@/constants";

// Types
export interface Product {
  _id: string;
  nom_product: string;
  prix_detail: number;
  images?: string[];
}

export interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: Product | null;
}

// ----------- Utilitaire anti-clignotement -----------
function resolveImageUrl(url: string | undefined) {
  if (!url) return "/default-product.jpg";
  // Si c'est un lien http(s)
  if (url.startsWith("http")) return url;
  // Si ça vient du backend
  return `${API_URL}${url}`;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(1);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const navigate = useNavigate();
  const blRef = useRef<HTMLDivElement>(null);

  // User depuis localStorage
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw);
      return null;
    } catch {
      return null;
    }
  })();

  // API
  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      setCart(data?.items ?? []);
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
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

  // PDF BL
  const handleExportPDF = async () => {
    if (!blRef.current) return;
    const canvas = await html2canvas(blRef.current);
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

  // Commande
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
      setConfirmedOrder(res);
      setOrderSuccess("Commande envoyée avec succès !");
    } catch {
      setOrderError("Erreur lors de la validation");
    } finally {
      setSending(false);
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

  // Éditeur quantité (local)
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
      <main style={{ padding: "2rem" }}>
        {/* En-tête */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2>Mon panier</h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => navigate("/productclient")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retour aux produits
            </button>
            <button
              onClick={() => navigate("/historiqueorders")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Historique des commandes
            </button>
          </div>
        </div>

        {/* Contenu */}
        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Votre panier est vide</p>
            <button
              onClick={() => navigate("/productclient")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginTop: "1rem",
              }}
            >
              Continuer mes achats
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "2rem" }}>
              {cart.map(
                (item) =>
                  item.product && (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem",
                        borderBottom: "1px solid #e5e7eb",
                        gap: "1rem",
                      }}
                    >
                      {/* ========== IMAGE PRODUIT ========== */}
                      <div style={{ minWidth: 64, minHeight: 64 }}>
                        <img
                          src={resolveImageUrl(item.product.images?.[0])}
                          alt={item.product.nom_product}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #e5e7eb",
                            background: "#fafafa",
                          }}
                          // Pour éviter clignotement, désactive l'onerror après set (sinon boucle infinie)
                          onError={e => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/default-product.jpg";
                          }}
                        />
                      </div>
                      {/* Produit + prix */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{item.product.nom_product}</h3>
                        <p style={{ margin: "0.5rem 0" }}>
                          Prix unitaire : {item.product.prix_detail} €
                        </p>
                      </div>
                      {/* Quantité + actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <span style={{ minWidth: 24, textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => openEditor(item)}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#e5e7eb",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                          title="Modifier la quantité"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )
              )}
            </div>

            {/* Total + actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Total: {total.toFixed(2)} €</h3>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  onClick={handleClearCart}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Vider le panier
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Valider la commande
                </button>
              </div>
            </div>
          </>
        )}

        {/* --------  Modal Bon de Livraison -------- */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => {
              setShowModal(false);
              setConfirmedOrder(null);
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "2rem",
                minWidth: "320px",
                maxWidth: "95vw",
              }}
            >
              <h3>Bon de Livraison</h3>
              <div
                ref={blRef}
                style={{
                  background: "#f3f4f6",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
              >
                {/* --------- AVANT confirmation --------- */}
                {!confirmedOrder && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <b>Client :</b> {user?.nom_client || "-"}
                      <br />
                      <b>Téléphone :</b> {user?.contact?.telephone || user?.num || "-"}
                      <br />
                      <b>Adresse :</b>{" "}
                      {(user?.localisation?.adresse || "-") +
                        (user?.localisation?.ville ? ", " + user?.localisation?.ville : "") +
                        (user?.localisation?.code_postal ? ", " + user?.localisation?.code_postal : "")}
                      <br />
                      <b>Date :</b> {new Date().toLocaleString()}
                      <br />
                      <b>Nom du dépôt :</b> {user?.depot_name || user?.depot || "-"}
                      <br />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Entreprise :</b> {user?.entreprise?.nom_company || "-"}
                      <br />
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: 8,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Produit</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Quantité</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Prix unitaire</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map(
                          (item) =>
                            item.product && (
                              <tr key={item.productId}>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {item.product.nom_product}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4, textAlign: "center" }}>
                                  {item.quantity}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {item.product.prix_detail.toFixed(2)} €
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {(item.product.prix_detail * item.quantity).toFixed(2)} €
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                    <div style={{ textAlign: "right", fontWeight: "bold" }}>
                      Total général : {total.toFixed(2)} €
                    </div>
                  </>
                )}

                {/* --------- APRÈS confirmation --------- */}
                {confirmedOrder && (
                  <>
                    <div style={{ marginBottom: 8 }}>
                      <b>Numéro de commande :</b> {confirmedOrder.numero || confirmedOrder._id?.slice(-6).toUpperCase() || "-"}
                      <br />
                      <b>Client :</b> {confirmedOrder.nom_client || "-"}
                      <br />
                      <b>Téléphone :</b> {confirmedOrder.telephone || "-"}
                      <br />
                      <b>Adresse :</b>{" "}
                      {(confirmedOrder.adresse_client?.adresse || "-") +
                        (confirmedOrder.adresse_client?.ville ? ", " + confirmedOrder.adresse_client.ville : "") +
                        (confirmedOrder.adresse_client?.code_postal ? ", " + confirmedOrder.adresse_client.code_postal : "")}
                      <br />
                      <b>Date :</b> {new Date(confirmedOrder.createdAt).toLocaleString()}
                      <br />
                      <b>Nom du dépôt :</b> {confirmedOrder.depot_name || "-"}
                      <br />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <b>Entreprise :</b> {confirmedOrder.entreprise?.nom_company || "-"}
                      <br />
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: 8,
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Produit</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Quantité</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Prix unitaire</th>
                          <th style={{ border: "1px solid #ddd", padding: 4 }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {confirmedOrder.items?.map(
                          (item: any, idx: number) =>
                            item && (
                              <tr key={idx}>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {item.productName}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4, textAlign: "center" }}>
                                  {item.quantity}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {item.prix_detail?.toFixed(2)} €
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: 4 }}>
                                  {(item.prix_detail * item.quantity).toFixed(2)} €
                                </td>
                              </tr>
                            )
                        )}
                      </tbody>
                    </table>
                    <div style={{ textAlign: "right", fontWeight: "bold" }}>
                      Total général : {confirmedOrder.total?.toFixed(2)} €
                    </div>
                  </>
                )}
              </div>
              {/* ----------- BOUTONS MODAL ----------- */}
              {!confirmedOrder ? (
                <>
                  <button
                    onClick={handleSendOrder}
                    style={{
                      background: "#10b981",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                    disabled={sending}
                  >
                    {sending ? "Envoi..." : "Confirmer la commande"}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setConfirmedOrder(null);
                    }}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleExportPDF}
                    style={{
                      background: "#1c1917",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  >
                    Exporter le BL en PDF
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setConfirmedOrder(null);
                    }}
                    style={{
                      background: "#6366f1",
                      color: "white",
                      padding: "0.5rem 1rem",
                      border: "none",
                      borderRadius: 4,
                      marginRight: 8,
                    }}
                  >
                    Fermer
                  </button>
                </>
              )}
              {orderError && (
                <div style={{ color: "red", marginTop: 12 }}>{orderError}</div>
              )}
            </div>
          </div>
        )}

        {/* --------  Modal Édition quantité -------- */}
        {editItemId && (
          <div
            onClick={closeEditor}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1100,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 8,
                padding: "1.5rem",
                width: 300,
                textAlign: "center",
              }}
            >
              <h4 style={{ marginBottom: 16 }}>Modifier la quantité</h4>
              <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
                <button
                  onClick={() => setEditQty(Math.max(1, editQty - 1))}
                  style={{ padding: ".25rem .6rem" }}
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
                  style={{
                    width: 60,
                    textAlign: "center",
                    padding: ".25rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 4,
                  }}
                />
                <button
                  onClick={() => setEditQty(editQty + 1)}
                  style={{ padding: ".25rem .6rem" }}
                >
                  +
                </button>
              </div>
              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={async () => {
                    await handleQuantityChange(editItemId!, editQty);
                    closeEditor();
                  }}
                  style={{
                    backgroundColor: "#4f46e5",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: 4,
                  }}
                >
                  OK
                </button>
                <button
                  onClick={closeEditor}
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast succès */}
        {orderSuccess && (
          <div
            style={{
              position: "fixed",
              top: 16,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#10b981",
              color: "white",
              padding: 12,
              borderRadius: 8,
              zIndex: 2000,
            }}
          >
            {orderSuccess}
          </div>
        )}
      </main>
    </>
  );
}
