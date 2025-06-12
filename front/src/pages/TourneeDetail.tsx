import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  prix_detail: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
}

interface Stop {
  stop_id: string;
  orders: Order[];
  products: OrderItem[];
  client_name?: string;
}

interface Vehicle {
  ordered_stops: Stop[];
  make?: string;
  model?: string;
  license_plate?: string;
  chauffeur?: { nom: string; prenom: string } | null;
  livreur?: { nom: string; prenom: string } | null;
  products_summary?: {
    productId: string;
    productName: string;
    quantity: number;
    prix_detail: number;
  }[];
}

interface Tournee {
  _id: string;
  depot: string;
  date: string;
  stops: string[];
  vehicles: string[];
  total_travel_time?: number;
  total_travel_distance?: number;
  statut_chargement: "en_cours" | "charge";
  solution?: {
    date1: Record<string, Vehicle>;
  };
  unscheduled?: any[];
}

export default function TourneeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournee, setTournee] = useState<Tournee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiBase = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isControleur = user.role === "Contrôleur";

  useEffect(() => {
    console.log("User:", user);
    console.log("Is Controleur:", isControleur);
    console.log("User Role:", user.role);
    console.log("User Role Type:", typeof user.role);
    console.log("Contrôleur Type:", typeof "Contrôleur");
    console.log("Role Comparison:", user.role === "Contrôleur");
    console.log("User Role Length:", user.role?.length);
    console.log("Contrôleur Length:", "Contrôleur".length);
    console.log(
      "User Role Chars:",
      user.role?.split("").map((c: string) => `${c} (${c.charCodeAt(0)})`)
    );
    console.log(
      "Contrôleur Chars:",
      "Contrôleur".split("").map((c: string) => `${c} (${c.charCodeAt(0)})`)
    );
    console.log("Tournee:", tournee);
    console.log("Statut Chargement:", tournee?.statut_chargement);
    console.log("Statut Type:", typeof tournee?.statut_chargement);
  }, [user, isControleur, tournee]);

  useEffect(() => {
    if (!id) {
      setError("ID de tournée manquant");
      setLoading(false);
      return;
    }

    fetch(`${apiBase}/tournees/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Données de la tournée:", data);
        console.log("Solution:", data.solution);
        if (data.solution?.date1) {
          Object.entries(data.solution.date1).forEach(
            ([vehicleId, vehicle]) => {
              const typedVehicle = vehicle as Vehicle;
              console.log(`Véhicule ${vehicleId}:`, typedVehicle);
              typedVehicle.ordered_stops.forEach(
                (stop: Stop, index: number) => {
                  console.log(`Arrêt ${index + 1} (${stop.stop_id}):`, {
                    orders: stop.orders,
                    products: stop.products,
                  });
                }
              );
            }
          );
        }
        setTournee(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération de la tournée:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [apiBase, token, id]);

  const updateLoadingStatus = async (status: "en_cours" | "charge") => {
    try {
      const res = await fetch(`${apiBase}/tournees/${id}/loading-status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updatedTournee = await res.json();
        setTournee(updatedTournee);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de chargement:",
        error
      );
    }
  };

  const getLoadingStatusColor = (status: string) => {
    switch (status) {
      case "en_cours":
        return "#3b82f6";
      case "charge":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getLoadingStatusText = (status: string) => {
    switch (status) {
      case "en_cours":
        return "Chargement en cours";
      case "charge":
        return "Chargé";
      default:
        return status;
    }
  };

  useEffect(() => {
    console.log("Rendu des boutons:", {
      isControleur,
      statut: tournee?.statut_chargement,
      showValidateButton:
        isControleur && tournee?.statut_chargement === "en_cours",
      showCancelButton: isControleur && tournee?.statut_chargement === "charge",
    });
  }, [isControleur, tournee]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!tournee) return <div>Aucune tournée trouvée</div>;

  return (
    <>
      <Header />
      <div
        style={{
          padding: "2rem",
          fontFamily: "Arial, sans-serif",
          maxWidth: "1100px",
          margin: "0 auto",
          background: "#ffffff",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2.5rem",
            borderRadius: "18px",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2.5rem",
            }}
          >
            <h1
              style={{
                color: "#1a1a1a",
                fontSize: "2.3rem",
                fontWeight: 800,
                letterSpacing: "-1px",
                borderBottom: "none",
                paddingBottom: 0,
                margin: 0,
              }}
            >
              Détails de la tournée
            </h1>
            <button
              onClick={() => navigate("/tournees")}
              style={{
                padding: "0.7rem 1.7rem",
                background: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: "999px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1.05rem",
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background 0.2s",
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2.5rem",
              marginTop: "2rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <fieldset
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "2rem",
                background: "#fafafa",
                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
              }}
            >
              <legend
                style={{
                  padding: "0 1rem",
                  color: "#1a1a1a",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  letterSpacing: "0.5px",
                }}
              >
                Informations générales
              </legend>
              <p style={{ marginBottom: "1.1rem" }}>
                <strong style={{ color: "#1a1a1a" }}>Date :</strong>
                <br />
                <span style={{ color: "#666" }}>
                  {new Date(tournee.date).toLocaleDateString()}
                </span>
              </p>
              <p style={{ marginBottom: "1.1rem" }}>
                <strong style={{ color: "#1a1a1a" }}>
                  Nombre de véhicules :
                </strong>
                <br />
                <span style={{ color: "#666" }}>{tournee.vehicles.length}</span>
              </p>
              <p style={{ marginBottom: "1.1rem" }}>
                <strong style={{ color: "#1a1a1a" }}>
                  Statut de chargement :
                </strong>
                <br />
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.3rem 1.1rem",
                    borderRadius: "9999px",
                    background:
                      tournee.statut_chargement === "charge"
                        ? "#10b981"
                        : "#3b82f6",
                    color: "white",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    marginTop: "0.5rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  {getLoadingStatusText(tournee.statut_chargement)}
                </span>
              </p>
              {tournee.total_travel_time && (
                <p style={{ marginBottom: "1.1rem" }}>
                  <strong style={{ color: "#1a1a1a" }}>
                    Temps de trajet total :
                  </strong>
                  <br />
                  <span style={{ color: "#666" }}>
                    {tournee.total_travel_time} minutes
                  </span>
                </p>
              )}
              {tournee.total_travel_distance && (
                <p>
                  <strong style={{ color: "#1a1a1a" }}>
                    Distance totale :
                  </strong>
                  <br />
                  <span style={{ color: "#666" }}>
                    {tournee.total_travel_distance} km
                  </span>
                </p>
              )}
            </fieldset>

            {isControleur && (
              <fieldset
                style={{
                  border: "none",
                  borderRadius: "14px",
                  padding: "2rem",
                  background: "#fafafa",
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                }}
              >
                <legend
                  style={{
                    padding: "0 1rem",
                    color: "#1a1a1a",
                    fontWeight: 700,
                    fontSize: "1.15rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Actions
                </legend>
                <div style={{ display: "flex", gap: "1.2rem" }}>
                  {tournee.statut_chargement === "en_cours" && (
                    <button
                      onClick={() => updateLoadingStatus("charge")}
                      style={{
                        padding: "0.7rem 1.7rem",
                        background: "#1a1a1a",
                        color: "white",
                        border: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.1)",
                        transition: "background 0.2s",
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Valider le chargement
                    </button>
                  )}
                  {tournee.statut_chargement === "charge" && (
                    <button
                      onClick={() => updateLoadingStatus("en_cours")}
                      style={{
                        padding: "0.7rem 1.7rem",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "999px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "1.05rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        boxShadow: "0 2px 8px 0 rgba(220,38,38,0.1)",
                        transition: "background 0.2s",
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Annuler la validation
                    </button>
                  )}
                </div>
              </fieldset>
            )}
          </div>

          {tournee.solution?.date1 && (
            <div style={{ marginTop: "2.5rem" }}>
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "1.45rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "0.5rem",
                  letterSpacing: "-0.5px",
                }}
              >
                Produits à charger par véhicule
              </h2>
              {Object.entries(tournee.solution.date1)
                .filter(([_, vehicle]) =>
                  vehicle.ordered_stops.some(
                    (stop) =>
                      !stop.stop_id.startsWith("end_") &&
                      stop.products &&
                      stop.products.length > 0
                  )
                )
                .map(([vehicleId, vehicle]) => (
                  <div
                    key={vehicleId}
                    style={{
                      marginBottom: "2.2rem",
                      padding: "1.7rem",
                      border: "1px solid #e0e0e0",
                      borderRadius: "14px",
                      background: "#fafafa",
                      boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                    }}
                  >
                    <h3
                      style={{
                        color: "#1a1a1a",
                        fontSize: "1.18rem",
                        marginBottom: "0.5rem",
                        fontWeight: 700,
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Véhicule {vehicle.model ?? ""} -{" "}
                      {vehicle.license_plate ?? vehicleId}
                    </h3>
                    <div
                      style={{
                        color: "#4b5563",
                        marginBottom: "1rem",
                        fontSize: "0.95rem",
                      }}
                    >
                      {vehicle.make && <span>{vehicle.make} </span>}
                      {vehicle.chauffeur && (
                        <span>
                          {" "}
                          | Chauffeur: {vehicle.chauffeur.prenom}{" "}
                          {vehicle.chauffeur.nom}
                        </span>
                      )}
                      {vehicle.livreur && (
                        <span>
                          {" "}
                          | Livreur: {vehicle.livreur.prenom}{" "}
                          {vehicle.livreur.nom}
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      {vehicle.ordered_stops
                        .filter(
                          (stop) =>
                            !stop.stop_id.startsWith("end_") &&
                            stop.products &&
                            stop.products.length > 0
                        )
                        .map((stop, index) => (
                          <div
                            key={stop.stop_id}
                            style={{ marginBottom: "1.5rem" }}
                          >
                            <h4
                              style={{
                                color: "#1a1a1a",
                                fontSize: "1.08rem",
                                fontWeight: 600,
                                marginBottom: "1rem",
                                letterSpacing: "-0.5px",
                              }}
                            >
                              Arrêt {index + 1} -{" "}
                              {stop.client_name || "Client " + stop.stop_id}
                            </h4>
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: "0.5rem",
                                background: "#fff",
                                borderRadius: "8px",
                                overflow: "hidden",
                                boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th
                                    style={{
                                      textAlign: "left",
                                      padding: "0.85rem",
                                      background: "#f3f4f6",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Produit
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "right",
                                      padding: "0.85rem",
                                      background: "#f3f4f6",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Quantité
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "right",
                                      padding: "0.85rem",
                                      background: "#f3f4f6",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Prix unitaire
                                  </th>
                                  <th
                                    style={{
                                      textAlign: "right",
                                      padding: "0.85rem",
                                      background: "#f3f4f6",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {stop.products.map((product, pIndex) => (
                                  <tr key={pIndex}>
                                    <td
                                      style={{
                                        padding: "0.85rem",
                                        borderBottom: "1px solid #e0e0e0",
                                        color: "#1a1a1a",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {product.productName}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        padding: "0.85rem",
                                        borderBottom: "1px solid #e0e0e0",
                                        color: "#1a1a1a",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {product.quantity}
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        padding: "0.85rem",
                                        borderBottom: "1px solid #e0e0e0",
                                        color: "#1a1a1a",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {product.prix_detail.toFixed(2)} €
                                    </td>
                                    <td
                                      style={{
                                        textAlign: "right",
                                        padding: "0.85rem",
                                        borderBottom: "1px solid #e0e0e0",
                                        color: "#1a1a1a",
                                        fontWeight: 500,
                                      }}
                                    >
                                      {(
                                        product.quantity * product.prix_detail
                                      ).toFixed(2)}{" "}
                                      €
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                    </div>
                    {vehicle.products_summary &&
                      vehicle.products_summary.length > 0 && (
                        <div style={{ marginTop: "1rem" }}>
                          <table
                            style={{
                              width: "100%",
                              borderCollapse: "collapse",
                              background: "#fff",
                              borderRadius: "8px",
                              overflow: "hidden",
                              boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                            }}
                          >
                            <thead>
                              <tr>
                                <th
                                  style={{
                                    textAlign: "left",
                                    padding: "0.85rem",
                                    background: "#f3f4f6",
                                    borderBottom: "1px solid #e0e0e0",
                                    color: "#1a1a1a",
                                    fontWeight: 700,
                                  }}
                                >
                                  Produit
                                </th>
                                <th
                                  style={{
                                    textAlign: "right",
                                    padding: "0.85rem",
                                    background: "#f3f4f6",
                                    borderBottom: "1px solid #e0e0e0",
                                    color: "#1a1a1a",
                                    fontWeight: 700,
                                  }}
                                >
                                  Quantité
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {vehicle.products_summary.map((prod, idx) => (
                                <tr key={idx}>
                                  <td
                                    style={{
                                      padding: "0.85rem",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {prod.productName}
                                  </td>
                                  <td
                                    style={{
                                      textAlign: "right",
                                      padding: "0.85rem",
                                      borderBottom: "1px solid #e0e0e0",
                                      color: "#1a1a1a",
                                      fontWeight: 500,
                                    }}
                                  >
                                    {prod.quantity}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </div>
                ))}
            </div>
          )}

          {tournee.unscheduled && tournee.unscheduled.length > 0 && (
            <div style={{ marginTop: "2.5rem" }}>
              <h2
                style={{
                  color: "#1a1a1a",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid #e0e0e0",
                  paddingBottom: "0.5rem",
                  letterSpacing: "-0.5px",
                }}
              >
                Arrêts non planifiés
              </h2>
              <div
                style={{
                  background: "#fafafa",
                  padding: "1.7rem",
                  borderRadius: "14px",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 1px 4px 0 rgba(0,0,0,0.03)",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    color: "#1a1a1a",
                    fontWeight: 500,
                  }}
                >
                  {JSON.stringify(tournee.unscheduled, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
