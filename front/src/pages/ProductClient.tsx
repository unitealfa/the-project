import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { AddToCartButton } from "@/components/AddToCartButton/AddToCartButton";
import { AddToWishlistButton } from "@/components/AddToWishlistButton/AddToWishlistButton";

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
  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const res = await fetch("/api/products/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data: Product[] = await res.json();
        setProduits(data);

        const types = Array.from(new Set(data.map((p: Product) => p.categorie))).sort();
        const companies = Array.from(new Set(data.map((p: Product) => p.company_id))).sort();
        setAvailableTypes(types);
        setAvailableCompanies(companies);
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

    const matchesCompany = selectedCompany === "" || p.company_id === selectedCompany;

    return matchesName && matchesType && matchesCompany;
  });

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
          <h2>Produits disponibles</h2>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Rechercher par nom…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              <option value="">Tous types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                background: "#fff",
              }}
            >
              <option value="">Toutes entreprises</option>
              {availableCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchName("");
                setSelectedType("");
                setSelectedCompany("");
              }}
              disabled={!searchName && !selectedType && !selectedCompany}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#f3f4f6",
                color: "#333",
                border: "1px solid #ccc",
                borderRadius: "4px",
                cursor:
                  !searchName && !selectedType && !selectedCompany
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "2rem",
          }}
        >
          {filteredProduits.length === 0 ? (
            <p>Aucun produit trouvé.</p>
          ) : (
            filteredProduits.map((p) => (
              <div
                key={p._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {p.images && p.images.length > 0 && (
                  <img
                    src={p.images[0]}
                    alt={p.nom_product}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                )}
                <h3 style={{ margin: 0 }}>{p.nom_product}</h3>
                <p style={{ margin: 0 }}>{p.description}</p>
                <p style={{ margin: 0, fontWeight: "bold" }}>
                  Prix : {p.prix_detail} €
                </p>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <AddToCartButton productId={p._id} />
                  <AddToWishlistButton productId={p._id} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
