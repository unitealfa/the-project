import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Pencil, Trash2, ShoppingCart } from "lucide-react";

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
      <main
        style={{
          display: "flex",
          gap: "3rem",
          background: "#fafafa",
          minHeight: "100vh",
          padding: "2rem",
          alignItems: "flex-start",
          flexWrap: "nowrap",
        }}
      >
        {cart.length === 0 ? (
          <div
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4rem 2rem",
              background: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <h2 style={{ fontSize: "1.8rem", color: "#333", marginBottom: "1.5rem" }}>
              Votre panier est vide
            </h2>
            <button
              onClick={() => navigate("/productclient")}
              style={{
                padding: "0.9rem 1.8rem",
                background: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: 24,
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                transition: "background 0.2s, transform 0.15s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#333";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#1a1a1a";
                e.currentTarget.style.transform = "none";
              }}
            >
              Continuer mes achats
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "3rem",
              width: "100%",
              alignItems: "flex-start",
            }}
          >
            <section
              style={{
                flex: 2,
                background: "#fff",
                borderRadius: 12,
                padding: "2.5rem 2rem",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#1a1a1a",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "2rem",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Votre panier
              </h2>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  background: "transparent",
                  fontSize: "1rem",
                  color: "#1a1a1a",
                  marginBottom: "2rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid #f3f4f6",
                      color: "#888",
                      fontWeight: 500,
                      fontSize: "0.98rem",
                      letterSpacing: "1px",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0 0 1rem 0",
                        fontWeight: 500,
                      }}
                    >
                      Produit
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0 0 1rem 0",
                        fontWeight: 500,
                      }}
                    >
                      Prix
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0 0 1rem 0",
                        fontWeight: 500,
                      }}
                    >
                      Qté
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0 0 1rem 0",
                        fontWeight: 500,
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "0 0 1rem 0",
                        fontWeight: 500,
                      }}
                    ></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(
                    (item) =>
                      item.product && (
                        <tr
                          key={item._id}
                          style={{
                            borderBottom: "1px solid #f3f4f6",
                            height: 90,
                          }}
                        >
                          {/* Produit */}
                          <td
                            style={{
                              padding: "1.2rem 0",
                              verticalAlign: "middle",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1.2rem",
                              }}
                            >
                              {item.product.images &&
                                item.product.images.length > 0 && (
                                  <img
                                    src={item.product.images[0]}
                                    alt={item.product.nom_product}
                                    style={{
                                      width: 64,
                                      height: 64,
                                      objectFit: "cover",
                                      borderRadius: 8,
                                      background: "#f8fafc",
                                      border: "1px solid #f3f4f6",
                                    }}
                                  />
                                )}
                              <div style={{ minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "1.08rem",
                                    marginBottom: 2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: 180,
                                  }}
                                >
                                  {item.product.nom_product}
                                </div>
                                <div
                                  style={{
                                    color: "#aaa",
                                    fontSize: "0.95rem",
                                    fontWeight: 400,
                                  }}
                                >
                                  {item.product.prix_detail.toFixed(2)} € / unité
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* Prix unitaire */}
                          <td style={{ textAlign: "center", fontWeight: 500 }}>
                            {item.product.prix_detail.toFixed(2)} €
                          </td>
                          {/* Quantité */}
                          <td style={{ textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: ".5rem",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1}
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  border: "none",
                                  background: "#f3f4f6",
                                  color: "#1a1a1a",
                                  fontSize: 18,
                                  cursor:
                                    item.quantity <= 1
                                      ? "not-allowed"
                                      : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s, transform 0.15s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#e5e7eb")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background = "#f3f4f6")
                                }
                              >
                                –
                              </button>
                              <span
                                style={{
                                  minWidth: 32,
                                  textAlign: "center",
                                  fontWeight: 600,
                                  fontSize: "1.08rem",
                                }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  border: "none",
                                  background: "#f3f4f6",
                                  color: "#1a1a1a",
                                  fontSize: 18,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "background 0.2s, transform 0.15s",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#e5e7eb")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.background = "#f3f4f6")
                                }
                              >
                                +
                              </button>
                            </div>
                          </td>
                          {/* Total */}
                          <td style={{ textAlign: "center", fontWeight: 700 }}>
                            {(item.product.prix_detail * item.quantity).toFixed(
                              2
                            )}{" "}
                            €
                          </td>
                          {/* Supprimer */}
                          <td style={{ textAlign: "center" }}>
                            <button
                              onClick={() => handleRemoveItem(item.productId)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                border: "none",
                                background: "#f3f4f6",
                                color: "#dc2626",
                                fontSize: 18,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "background 0.2s, transform 0.15s",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                                e.currentTarget.style.color = "#b91c1c";
                                e.currentTarget.style.transform = "scale(1.1)";
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = "#f3f4f6";
                                e.currentTarget.style.color = "#dc2626";
                                e.currentTarget.style.transform = "none";
                              }}
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
            </section>
            {/* Colonne droite : récapitulatif */}
            <aside
              style={{
                flex: 1,
                background: "#fbeeee",
                borderRadius: 12,
                padding: "2.5rem 2rem",
                minWidth: 320,
                maxWidth: 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxSizing: "border-box",
                justifyContent: "flex-start",
                boxShadow: "none",
              }}
            >
              <h3
                style={{
                  color: "#1a1a1a",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: "2.5rem",
                  borderBottom: "2px solid #1a1a1a",
                  width: "100%",
                  paddingBottom: "0.5rem",
                  textAlign: "left",
                }}
              >
                Récapitulatif
              </h3>
              <div style={{ width: "100%", marginBottom: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
                    fontSize: "1.15rem",
                    color: "#1a1a1a",
                    marginBottom: 8,
                  }}
                >
                  <span>Total</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div
                  style={{ color: "#888", fontSize: "0.98rem", marginBottom: 18 }}
                >
                  Taxes incluses. Livraison calculée à l'étape suivante.
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: "100%",
                  padding: "1.1rem 0",
                  background: "#1a1a1a",
                  color: "white",
                  border: "none",
                  borderRadius: 24,
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  marginBottom: "1.5rem",
                  transition: "background 0.2s, transform 0.15s",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: ".7rem",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#333";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <ShoppingCart size={22} style={{ marginBottom: -2 }} /> Valider la
                commande
              </button>
              <button
                onClick={handleClearCart}
                style={{
                  width: "100%",
                  padding: "1.1rem 0",
                  background: "#fff0f0",
                  color: "#dc2626",
                  border: "1.5px solid #fecaca",
                  borderRadius: 24,
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  transition:
                    "background 0.2s, color 0.2s, border 0.2s, transform 0.15s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: ".7rem",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#fee2e2";
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.borderColor = "#fca5a5";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff0f0";
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.borderColor = "#fecaca";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <Trash2 size={20} style={{ marginBottom: -2 }} /> Vider le panier
              </button>
              <button
                onClick={() => navigate("/productclient")}
                style={{
                  width: "100%",
                  padding: "1.1rem 0",
                  background: "#fff",
                  color: "#4f46e5",
                  border: "2px solid #4f46e5",
                  borderRadius: 24,
                  fontWeight: 700,
                  fontSize: "1.08rem",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  marginTop: "1.2rem",
                  transition:
                    "background 0.2s, color 0.2s, border 0.2s, transform 0.15s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: ".7rem",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.color = "#4338ca";
                  e.currentTarget.style.borderColor = "#4338ca";
                  e.currentTarget.style.transform = "scale(1.03)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#fff";
                  e.currentTarget.style.color = "#4f46e5";
                  e.currentTarget.style.borderColor = "#4f46e5";
                  e.currentTarget.style.transform = "none";
                }}
              >
                Continuer les achats
              </button>
            </aside>
          </div>
        )}
      </main>

      {/* --------  Modal Bon de Livraison (PRO) -------- */}
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
            setConfirmedOrders([]);
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              maxWidth: "90%",
              maxHeight: "90%",
              overflowY: "auto",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {confirmedOrders.length > 0 ? (
              <>
                <h2 style={{ color: "#1a1a1a", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                  Bon(s) de Livraison
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {confirmedOrders.map((order, idx) => (
                    <div
                      key={order._id}
                      ref={(el) => {
                        blRefs.current[idx] = el;
                        return undefined;
                      }}
                      style={{
                        background: "#f3f4f6",
                        padding: 16,
                        borderRadius: 8,
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <b>Numéro de commande :</b> {order.numero || order._id.slice(-6).toUpperCase()}
                        <br />
                        <b>Client :</b> {user?.nom} {user?.prenom}
                        <br />
                        <b>Téléphone :</b> {user?.telephone}
                        <br />
                        <b>Adresse :</b>{" "}
                        {(user?.adresse?.adresse || "-") +
                          (user?.adresse?.ville ? ", " + user.adresse.ville : "") +
                          (user?.adresse?.code_postal ? ", " + user.adresse.code_postal : "")}
                        <br />
                        <b>Date :</b> {new Date(order.createdAt).toLocaleString()}
                        <br />
                        <b>Nom du dépôt :</b> {user?.depot_name || "-"}
                        <br />
                        <b>Entreprise :</b> {user?.entreprise?.nom_company || "-"}
                      </div>
                      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
                        <thead>
                          <tr>
                            <th style={{ border: "1px solid #ddd", padding: 8, textAlign: "left" }}>Produit</th>
                            <th style={{ border: "1px solid #ddd", padding: 8 }}>Quantité</th>
                            <th style={{ border: "1px solid #ddd", padding: 8 }}>Prix U.</th>
                            <th style={{ border: "1px solid #ddd", padding: 8 }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item: any, itemIdx: number) => (
                            <tr key={itemIdx}>
                              <td style={{ border: "1px solid #ddd", padding: 8 }}>{item.productName}</td>
                              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>{item.quantity}</td>
                              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>{item.prix_detail.toFixed(2)} €</td>
                              <td style={{ border: "1px solid #ddd", padding: 8, textAlign: "center" }}>{(item.prix_detail * item.quantity).toFixed(2)} €</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ textAlign: "right", fontWeight: "bold" }}>
                        Total général : {order.total?.toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#6366f1",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: 4,
                    marginTop: "1rem",
                  }}
                >
                  Fermer
                </button>
              </>
            ) : (
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "green", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {orderSuccess}
                </p>
                <p style={{ color: "red", fontSize: "1.2rem", fontWeight: "bold" }}>
                  {orderError}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#6366f1",
                    color: "white",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: 4,
                    marginTop: "1rem",
                  }}
                >
                  Fermer
                </button>
              </div>
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
              <button onClick={closeEditor} style={{ padding: "0.5rem 1rem" }}>
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
    </>
  );
}
