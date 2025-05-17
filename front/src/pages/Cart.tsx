import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { cartService } from "@/services/cartService";
import { orderService } from "@/services/orderService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Product {
  _id: string;
  nom_product: string;
  prix_detail: number;
}

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: Product | null;
}

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const blRef = useRef<HTMLDivElement>(null);

  // Récupérer l'utilisateur (client connecté) pour afficher ses infos
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) return JSON.parse(raw);
      return null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await cartService.getCart();
      if (data && data.items) {
        setCart(data.items);
      } else {
        setCart([]);
      }
    } catch (error) {
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
    } catch (error) {}
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      fetchCart();
    } catch (error) {}
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
    } catch (error) {}
  };

  const total = cart.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.prix_detail * item.quantity;
  }, 0);

  // Export BL en PDF
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
    const pageHeight = 800;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 50, 40, imgWidth, imgHeight);
    pdf.save("bon-de-livraison.pdf");
  };

  // Handler validation commande
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
      await orderService.createOrder({
        items: orderItems,
        total,
      });
      await cartService.clearCart();
      setCart([]);
      setOrderSuccess("Commande envoyée avec succès !");
      setShowModal(false);
    } catch (err) {
      setOrderError("Erreur lors de la validation");
    } finally {
      setSending(false);
      setTimeout(() => setOrderSuccess(null), 3000);
    }
  };

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h2>Mon panier</h2>
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
        </div>

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
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>
                          {item.product.nom_product}
                        </h3>
                        <p style={{ margin: "0.5rem 0" }}>
                          Prix unitaire : {item.product.prix_detail} €
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#e5e7eb",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#e5e7eb",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>
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

        {/* Modal de confirmation + BL */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowModal(false)}
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
                {/* AJOUT ICI */}

                <div style={{ marginBottom: 8 }}>
                  <b>Numéro de commande :</b> {user?.numero || "-"}
                  <br />
                  <b>Client :</b> {user?.nom_client || "-"}
                  <br />
                  <b>Téléphone :</b>{" "}
                  {user?.contact?.telephone || user?.num || "-"}
                  <br />
                  <b>Adresse :</b>{" "}
                  {(user?.localisation?.adresse || "-") +
                    (user?.localisation?.ville
                      ? ", " + user?.localisation?.ville
                      : "") +
                    (user?.localisation?.code_postal
                      ? ", " + user?.localisation?.code_postal
                      : "")}
                  <br />
                  <b>Date :</b> {new Date().toLocaleString()}
                  <br />
                  <b>Nom du dépôt :</b> {user?.depot_name || user?.depot || "-"}
                  <br />
                </div>

                {/* ...Reste inchangé... */}
                <div style={{ marginBottom: 8 }}>
                  <b>Entreprise :</b> {user?.entreprise?.nom_company || "-"}
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
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Produit
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Quantité
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Prix unitaire
                      </th>
                      <th style={{ border: "1px solid #ddd", padding: 4 }}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(
                      (item) =>
                        item.product && (
                          <tr key={item.productId}>
                            <td
                              style={{ border: "1px solid #ddd", padding: 4 }}
                            >
                              {item.product.nom_product}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ddd",
                                padding: 4,
                                textAlign: "center",
                              }}
                            >
                              {item.quantity}
                            </td>
                            <td
                              style={{ border: "1px solid #ddd", padding: 4 }}
                            >
                              {item.product.prix_detail.toFixed(2)} €
                            </td>
                            <td
                              style={{ border: "1px solid #ddd", padding: 4 }}
                            >
                              {(
                                item.product.prix_detail * item.quantity
                              ).toFixed(2)}{" "}
                              €
                            </td>
                          </tr>
                        )
                    )}
                  </tbody>
                </table>
                <div style={{ textAlign: "right", fontWeight: "bold" }}>
                  Total général : {total.toFixed(2)} €
                </div>
              </div>
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
                onClick={() => setShowModal(false)}
                style={{ padding: "0.5rem 1rem" }}
              >
                Annuler
              </button>
              {orderError && (
                <div style={{ color: "red", marginTop: 12 }}>{orderError}</div>
              )}
            </div>
          </div>
        )}

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
