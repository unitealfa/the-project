// front/src/pages/GestionDepot.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import Header from "../components/Header";

interface Disponibilite {
  depot_id: string;
  quantite: number;
}

interface Product {
  _id: string;
  nom_product: string;
  categorie: string;
  disponibilite: Disponibilite[];
}

interface ExcelRow {
  nom_product: string;
  quantite: number;
}

export default function GestionDepot() {
  const { depotId } = useParams<{ depotId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // États pour la recherche et le filtre
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    if (!depotId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/products/by-depot/${depotId}`);
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        setError("Erreur lors du chargement des produits");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [depotId]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Supprimer ce produit de ce dépôt ?")) return;
    try {
      const product = products.find((p) => p._id === productId);
      if (!product) return;

      const updatedDispo = product.disponibilite.filter(
        (d) => d.depot_id !== depotId
      );
      await axios.put(`/api/products/${productId}`, {
        disponibilite: updatedDispo,
      });

      const updated = await axios.get(`/api/products/by-depot/${depotId}`);
      setProducts(updated.data);
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
    }
  };

  // Extraire la liste des catégories uniques
  const categories = Array.from(
    new Set(products.map((p) => p.categorie))
  ).sort();

  // Appliquer le filtrage par nom et catégorie
  const filteredProducts = products.filter((product) => {
    const matchesName = product.nom_product
      .toLowerCase()
      .includes(searchName.toLowerCase().trim());
    const matchesCategory =
      selectedCategory === "" || product.categorie === selectedCategory;
    return matchesName && matchesCategory;
  });

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const resetFilters = () => {
    setSearchName("");
    setSelectedCategory("");
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

          console.log("Données Excel lues:", jsonData);

          // Vérifier que les colonnes requises sont présentes
          if (jsonData.length === 0) {
            setUploadError("Le fichier Excel est vide");
            return;
          }

          const firstRow = jsonData[0];
          if (!('nom_product' in firstRow) || !('quantite' in firstRow)) {
            setUploadError("Le fichier Excel doit contenir les colonnes 'nom_product' et 'quantite'");
            return;
          }

          let updatedCount = 0;
          let errorCount = 0;

          // Mettre à jour le stock pour chaque produit
          for (const row of jsonData) {
            console.log("Traitement du produit:", row.nom_product);
            const product = products.find(p => p.nom_product.toLowerCase() === row.nom_product.toLowerCase());
            
            if (product) {
              console.log("Produit trouvé:", product._id);
              try {
                // Trouver la quantité actuelle du produit dans ce dépôt
                const currentDispo = product.disponibilite.find(d => d.depot_id === depotId);
                const currentQuantity = currentDispo?.quantite || 0;
                const newQuantity = currentQuantity + parseInt(row.quantite.toString());

                const response = await axios.put(`/api/products/${product._id}/depot/${depotId}`, {
                  quantite: newQuantity
                });
                console.log("Réponse de mise à jour:", response.data);
                updatedCount++;
              } catch (err) {
                console.error(`Erreur lors de la mise à jour du produit ${row.nom_product}:`, err);
                errorCount++;
              }
            } else {
              console.log("Produit non trouvé:", row.nom_product);
              errorCount++;
            }
          }

          // Rafraîchir la liste des produits
          const updated = await axios.get(`/api/products/by-depot/${depotId}`);
          setProducts(updated.data);
          
          if (updatedCount > 0) {
            setUploadSuccess(`${updatedCount} produits mis à jour avec succès${errorCount > 0 ? `, ${errorCount} erreurs` : ''}`);
          } else {
            setUploadError("Aucun produit n'a pu être mis à jour");
          }
        } catch (err) {
          console.error("Erreur lors du traitement du fichier Excel:", err);
          setUploadError("Erreur lors du traitement du fichier Excel");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("Erreur lors de la lecture du fichier:", err);
      setUploadError("Erreur lors de la lecture du fichier");
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <>
    <Header />
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h2>Produits de votre dépôt</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
          onClick={() => navigate(`/add-product?depot=${depotId}`)}
          style={{
            padding: "0.5rem 1rem",
            fontSize: "1rem",
          }}
        >
          ➕ Ajouter un nouveau produit
        </button>

        <div style={{ position: "relative" }}>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelUpload}
            style={{ display: "none" }}
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "#fff",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            📊 Mettre à jour le stock via Excel
          </label>
        </div>
      </div>

      {uploadError && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{uploadError}</div>
      )}
      {uploadSuccess && (
        <div style={{ color: "green", marginBottom: "1rem" }}>{uploadSuccess}</div>
      )}

      {/* Barre de recherche par nom et filtre par catégorie */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchName}
          onChange={handleNameChange}
          style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            background: "#fff",
          }}
        >
          <option value="">Toutes catégories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={resetFilters}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#f3f4f6",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          disabled={!searchName && !selectedCategory}
        >
          Réinitialiser
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé dans ce dépôt.</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          cellSpacing={0}
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const dispo = product.disponibilite.find(
                (d) => d.depot_id === depotId
              );
              return (
                <tr key={product._id}>
                  <td>{product.nom_product}</td>
                  <td>{product.categorie}</td>
                  <td>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const quantiteInput = (
                          e.currentTarget.elements.namedItem(
                            "quantite"
                          ) as HTMLInputElement
                        ).value;
                        try {
                          await axios.put(
                            `/api/products/${product._id}/depot/${depotId}`,
                            {
                              quantite: parseInt(quantiteInput),
                            }
                          );
                          const updated = await axios.get(
                            `/api/products/by-depot/${depotId}`
                          );
                          setProducts(updated.data);
                        } catch (err) {
                          console.error("Erreur maj quantité", err);
                          alert("Erreur lors de la mise à jour");
                        }
                      }}
                    >
                      <input
                        type="number"
                        name="quantite"
                        defaultValue={dispo?.quantite ?? 0}
                        style={{ width: "60px" }}
                      />
                      <button type="submit">💾</button>
                    </form>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/product-detail/${product._id}`)}
                    >
                      Détails
                    </button>{" "}
                    <button
                      onClick={() =>
                        navigate(
                          `/product-edit/${product._id}?fromDepot=${depotId}`
                        )
                      }
                    >
                      Modifier
                    </button>{" "}
                    <button onClick={() => handleDelete(product._id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
}
