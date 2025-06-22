import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  productName: string;
  quantity: number;
}

interface Order {
  _id: string;
  nom_client: string;
  numero?: string;
  items: OrderItem[];
  etat_livraison: "en_attente" | "en_cours" | "livree" | "non_livree";
  photosLivraison?: Array<{ url: string; takenAt: string }>;
  nonLivraisonCause?: string;
}

export default function LivreurCommandes() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<Record<string, File[]>>(
    {}
  );
  const [previews, setPreviews] = useState<Record<string, string[]>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement>>({});
  const livreurId = JSON.parse(localStorage.getItem("user") || "{}").id;
  const apiBase = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, [apiBase, livreurId]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${apiBase}/livreurs/${livreurId}/orders`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data: Order[] = await res.json();
        setOrders(data);
        const allDone = data.every(
          (o: Order) =>
            o.etat_livraison !== "en_cours" && o.etat_livraison !== "en_attente"
        );

        if (allDone && data.length > 0) {
          const delivered = data
            .filter((o) => o.etat_livraison === "livree")
            .map((o) => o.numero)
            .join(", ");
          const returned = data
            .filter((o) => o.etat_livraison === "non_livree")
            .map((o) => o.numero)
            .join(", ");

          let msg = "Tournée terminée.\n";
          if (delivered) msg += `Commandes livrées: ${delivered}.\n`;
          if (returned) msg += `Retours au dépôt: ${returned}.`;
          alert(msg);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };

  const updateDeliveryStatus = async (
    orderId: string,
    status: "en_attente" | "en_cours" | "livree" | "non_livree"
  ) => {
    try {
      const res = await fetch(
        `${apiBase}/api/orders/${orderId}/delivery-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) {
        fetchOrders(); // Rafraîchir la liste des commandes
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const uploadPhotos = async (orderId: string) => {
    if (!fileInputRefs.current[orderId]?.files) return;
    const form = new FormData();
    Array.from(fileInputRefs.current[orderId].files).forEach((f) =>
      form.append("photos", f)
    );
    const res = await fetch(`${apiBase}/api/orders/${orderId}/photos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });
    if (res.ok) fetchOrders();
    else console.error("Upload photos failed");
  };

  const handleFileChange = (orderId: string, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setSelectedPhotos((prev) => {
      const exist = prev[orderId] || [];
      const combined = [...exist, ...newFiles].slice(0, 4);
      return { ...prev, [orderId]: combined };
    });
    setPreviews((prev) => {
      const existP = prev[orderId] || [];
      const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
      const combinedP = [...existP, ...newPreviews].slice(0, 4);
      return { ...prev, [orderId]: combinedP };
    });
  };

  const removePhoto = (orderId: string, index: number) => {
    setSelectedPhotos((prev) => {
      const copy = [...(prev[orderId] || [])];
      copy.splice(index, 1);
      return { ...prev, [orderId]: copy };
    });
    setPreviews((prev) => {
      const copy = [...(prev[orderId] || [])];
      URL.revokeObjectURL(copy[index]);
      copy.splice(index, 1);
      return { ...prev, [orderId]: copy };
    });
  };

  const handleValidateWithPhotos = async (orderId: string) => {
    const files = selectedPhotos[orderId] || [];
    if (files.length > 0) {
      const form = new FormData();
      files.forEach((f) => form.append("photos", f));
      await fetch(`${apiBase}/api/orders/${orderId}/photos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
    }
    await updateDeliveryStatus(orderId, "livree");
    setSelectedPhotos((prev) => ({ ...prev, [orderId]: [] }));
    setPreviews((prev) => ({ ...prev, [orderId]: [] }));
  };

  const markNonDelivery = async (orderId: string) => {
    const reason = window.prompt(
      "Motif de non livraison (magasin fermé, responsable absent, autre...)"
    );
    if (!reason) return;
    try {
      const res = await fetch(`${apiBase}/api/orders/${orderId}/non-delivery`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) fetchOrders();
    } catch (err) {
      console.error("Erreur non livraison:", err);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(previews).flat().forEach(URL.revokeObjectURL);
    };
  }, [previews]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "en_attente":
        return "#f59e0b";
      case "en_cours":
        return "#3b82f6";
      case "livree":
        return "#10b981";
      case "non_livree":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "en_cours":
        return "En cours";
      case "livree":
        return "Livrée";
      case "non_livree":
        return "Non livrée";
      default:
        return status;
    }
  };

  return (
    <>
      <Header />
      <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
        <h1> Commandes à livrer</h1>
        <div style={{ display: "grid", gap: "1rem" }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1rem",
                backgroundColor: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <button
                  onClick={() => navigate(`/livreur/commandes/${o._id}`)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                    cursor: "pointer",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {o.nom_client}
                </button>
                {o.numero && (
                  <div
                    style={{ color: "#6b7280", fontWeight: 500, marginTop: 2 }}
                  >
                    N° commande : {o.numero}
                  </div>
                )}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    backgroundColor: getStatusColor(o.etat_livraison),
                    color: "white",
                    fontSize: "0.875rem",
                  }}
                >
                  {getStatusText(o.etat_livraison)}
                </span>
              </div>

              {o.etat_livraison === "en_cours" && false && (
                <>
                  <button
                    onClick={() => fileInputRefs.current[o._id]?.click()}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#6b7280",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "0.5rem",
                    }}
                  >
                    Prendre / Choisir photos
                  </button>

                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current[o._id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => handleFileChange(o._id, e.target.files)}
                  />

                  {o.etat_livraison === "en_cours" &&
                    previews[o._id]?.length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        {previews[o._id].map((url, i) => (
                          <div key={i} style={{ position: "relative" }}>
                            <img
                              src={url}
                              alt={`Aperçu ${i + 1}`}
                              style={{
                                width: 80,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 4,
                              }}
                            />
                            <button
                              onClick={() => removePhoto(o._id, i)}
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                background: "red",
                                border: "none",
                                borderRadius: "50%",
                                width: 20,
                                height: 20,
                                color: "white",
                                cursor: "pointer",
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  <button
                    onClick={() => handleValidateWithPhotos(o._id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "0.5rem",
                    }}
                  >
                    Valider la livraison
                  </button>
                </>
              )}

              {o.etat_livraison === "en_attente" && (
                <button
                  onClick={() => updateDeliveryStatus(o._id, "en_cours")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Commencer la livraison
                </button>
              )}

              {o.etat_livraison === "livree" && (
                <button
                  onClick={() => updateDeliveryStatus(o._id, "en_cours")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Annuler la validation
                </button>
              )}

              {o.etat_livraison === "en_cours" && (
                <button
                  onClick={() => updateDeliveryStatus(o._id, "livree")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "0.5rem",
                  }}
                >
                  Valider la livraison
                </button>
              )}

              {o.etat_livraison === "en_cours" && (
                <button
                  onClick={() => markNonDelivery(o._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginTop: "0.5rem",
                    marginLeft: "0.5rem",
                  }}
                >
                  Commande non livrée
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
