// src/pages/GestionDepot.tsx
import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Header from "../components/Header";
import "../pages-css/GestionDepot.css";

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

  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [qtyPopup, setQtyPopup] = useState<{
    visible: boolean;
    product: Product | null;
    direction: "+" | "-" | null;
    amount: number;
  }>({ visible: false, product: null, direction: null, amount: 0 });

  useEffect(() => {
    if (!depotId) return;
    (async () => {
      try {
        const res = await axios.get(`/api/products/by-depot/${depotId}`);
        if (Array.isArray(res.data)) setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des produits");
      } finally {
        setLoading(false);
      }
    })();
  }, [depotId]);

  const handleDelete = async (productId: string) => {
    if (!confirm("Supprimer ce produit de ce dépôt ?")) return;
    const prod = products.find(p => p._id === productId);
    if (!prod) return;
    const updatedDispo = prod.disponibilite.filter(d => d.depot_id !== depotId);
    await axios.put(`/api/products/${productId}`, { disponibilite: updatedDispo });
    const fresh = await axios.get(`/api/products/by-depot/${depotId}`);
    setProducts(fresh.data);
  };

  const categories = Array.from(new Set(products.map(p => p.categorie))).sort();
  const filteredProducts = products.filter(p => {
    const nm = p.nom_product.toLowerCase().includes(searchName.toLowerCase());
    const ct = !selectedCategory || p.categorie === selectedCategory;
    return nm && ct;
  });

  const onExcelUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadSuccess(null);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(data), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: ExcelRow[] = XLSX.utils.sheet_to_json(ws);
      if (!json.length) { setUploadError("Fichier vide"); return; }
      if (!("nom_product" in json[0] && "quantite" in json[0])) {
        setUploadError("Colonnes requises manquantes"); return;
      }
      let ok = 0, err = 0;
      for (const row of json) {
        const prod = products.find(p =>
          p.nom_product.toLowerCase() === row.nom_product.toLowerCase()
        );
        if (!prod) { err++; continue; }
        const dispo = prod.disponibilite.find(d => d.depot_id === depotId);
        const base = dispo?.quantite || 0;
        const newQty = base + Number(row.quantite);
        try {
          await axios.put(`/api/products/${prod._id}/depot/${depotId}`, { quantite: newQty });
          ok++;
        } catch {
          err++;
        }
      }
      const fresh = await axios.get(`/api/products/by-depot/${depotId}`);
      setProducts(fresh.data);
      setUploadSuccess(`${ok} mis à jour${err ? `, ${err} erreurs` : ""}`);
    } catch (e) {
      console.error(e);
      setUploadError("Erreur traitement Excel");
    }
  };

  const openQtyPopup = (product: Product) => {
    setQtyPopup({ visible: true, product, direction: null, amount: 0 });
  };

  const applyQuantity = async () => {
    const { product, direction, amount } = qtyPopup;
    if (!product || !direction) return;
    if (amount <= 0) { alert("Saisissez un nombre > 0"); return; }
    const dispo = product.disponibilite.find(d => d.depot_id === depotId);
    const oldQty = dispo?.quantite || 0;
    const newQty = oldQty + (direction === "+" ? amount : -amount);
    if (newQty < 0) { alert("Quantité ne peut pas être négative"); return; }
    if (
      !confirm(
        `Vous allez ${direction === "+" ? "ajouter" : "retirer"} ${amount} à “${product.nom_product}”.\n` +
        `Ancienne : ${oldQty} → Nouvelle : ${newQty}\nConfirmer ?`
      )
    ) return;
    await axios.put(
      `/api/products/${product._id}/depot/${depotId}`,
      { quantite: newQty }
    );
    const fresh = await axios.get(`/api/products/by-depot/${depotId}`);
    setProducts(fresh.data);
    setQtyPopup({ visible: false, product: null, direction: null, amount: 0 });
  };

  return (
    <>
      <Header />
      <div className="gd-page">
        <h2 className="gd-title-card">Produits de votre dépôt</h2>

        <div className="gd-controls">
          <button
            type="button"
            className="gd-btn gd-btn-control"
            onClick={() => navigate(`/add-product?depot=${depotId}`)}
          >
             Ajouter un produit
          </button>
          <input
            type="file"
            accept=".xlsx,.xls"
            id="excel-upload"
            onChange={onExcelUpload}
            style={{ display: "none" }}
          />
          <label htmlFor="excel-upload" className="gd-btn gd-btn-control">
            Mise à jour via Excel
          </label>
        </div>

        {uploadError && <p className="gd-error">{uploadError}</p>}
        {uploadSuccess && <p className="gd-success">{uploadSuccess}</p>}
        {loading && <p>Chargement…</p>}
        {error && <p className="gd-error">{error}</p>}

        {!loading && !error && (
          <>
            <div className="gd-filter">
              <input
                placeholder="Rechercher..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes catégories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                className="gd-btn gd-btn-filter"
                onClick={() => { setSearchName(""); setSelectedCategory(""); }}
              >
                Réinitialiser
              </button>
            </div>

            <div className="gd-table-wrap">
              <table className="gd-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const dispo = p.disponibilite.find(d => d.depot_id === depotId);
                    return (
                      <tr key={p._id}>
                        <td>{p.nom_product}</td>
                        <td>{p.categorie}</td>
                        <td className="gd-qty-cell">
                          {dispo?.quantite ?? 0}
                          <button
                            type="button"
                            className="gd-btn gd-btn-qty"
                            onClick={() => openQtyPopup(p)}
                          >
                            ± Quantité
                          </button>
                        </td>
                        <td className="gd-actions">
                          <button
                            type="button"
                            className="gd-btn gd-btn-action"
                            onClick={() => navigate(`/product-detail/${p._id}`)}
                          >
                            Détails
                          </button>
                          <button
                            type="button"
                            className="gd-btn gd-btn-action"
                            onClick={() => navigate(`/product-edit/${p._id}?fromDepot=${depotId}`)}
                          >
                            Modifier
                          </button>
                          <button
                            type="button"
                            className="gd-btn gd-btn-action"
                            onClick={() => handleDelete(p._id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {qtyPopup.visible && qtyPopup.product && (
          <div className="gd-popup-overlay">
            <div className="gd-popup">
              <h3>Modifier "{qtyPopup.product.nom_product}"</h3>
              <div className="gd-popup-dir">
                <button
                  className={qtyPopup.direction === "+" ? "selected" : ""}
                  onClick={() => setQtyPopup(q => ({ ...q, direction: "+" }))}
                >
                  +
                </button>
                <button
                  className={qtyPopup.direction === "-" ? "selected" : ""}
                  onClick={() => setQtyPopup(q => ({ ...q, direction: "-" }))}
                >
                  −
                </button>
              </div>
              <div className="gd-popup-input">
                <input
                  type="number"
                  min={0}
                  value={qtyPopup.amount}
                  onChange={e => setQtyPopup(q => ({ ...q, amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="gd-popup-actions">
                <button
                  type="button"
                  className="gd-btn gd-btn-popup-action"
                  onClick={applyQuantity}
                >
                  Sauvegarder
                </button>
                <button
                  type="button"
                  className="gd-btn gd-btn-popup-action"
                  onClick={() => setQtyPopup({ visible: false, product: null, direction: null, amount: 0 })}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
