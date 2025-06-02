import React, { useState } from "react";
import axios from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { read, utils } from "xlsx";
import JSZip from "jszip";

// Type des données Excel
type ExcelRow = Record<string, any>;

type FieldKey =
  | "nom_product"
  | "prix_gros"
  | "prix_detail"
  | "description"
  | "categorie"
  | "poids"
  | "volume"
  | "type"
  | "images";

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const depotId = new URLSearchParams(location.search).get("depot");

  // --- Formulaire unitaire ---
  const [formData, setFormData] = useState({
    nom_product: "",
    prix_gros: "",
    prix_detail: "",
    description: "",
    categorie: "",
    poids: "",
    volume: "",
    images: [] as string[],
    type: ["normal"] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, type: [e.target.value] }));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", files[0]);
      const token = localStorage.getItem("token");
      const res = await axios.post("/upload/image", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, `http://localhost:5000${res.data.path}`],
      }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      nom_product: formData.nom_product,
      prix_gros: parseFloat(formData.prix_gros),
      prix_detail: parseFloat(formData.prix_detail),
      description: formData.description,
      categorie: formData.categorie,
      specifications: {
        poids: formData.poids,
        volume: formData.volume,
      },
      type: formData.type,
      images: formData.images,
      disponibilite: depotId ? [{ depot_id: depotId, quantite: 0 }] : [],
      company_id: user.company,
    };
    try {
      await axios.post("/products", payload);
      navigate(depotId ? `/gestion-depot/${depotId}` : "/dashboard-stock");
    } catch (err) {
      console.error(err);
      alert("Échec de l'ajout du produit.");
    }
  };

  // --- Import Excel ---
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({
    nom_product: "",
    prix_gros: "",
    prix_detail: "",
    description: "",
    categorie: "",
    poids: "",
    volume: "",
    type: "",
    images: "",
  });
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);

    // Extract Excel data
    const wb = read(arrayBuffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
    const [hdr, ...body] = data;
    setExcelHeaders(hdr as string[]);
    const rows = body.map((r) =>
      Object.fromEntries(hdr.map((h, i) => [h, r[i] ?? ""]))
    );
    setExcelRows(rows);

    // Extract embedded images
    const imagesFolder = zip.folder("xl/media");
    if (imagesFolder) {
      const imageFiles = imagesFolder.filter((relativePath) => /\.(png|jpg|jpeg)$/i.test(relativePath));
      const imageUrls = await Promise.all(
        imageFiles.map(async (imageFile) => {
          const blob = await imageFile.async("blob");
          return URL.createObjectURL(blob);
        })
      );

      setExtractedImages(imageUrls);
    }
  };

  const handleMapChange = (field: FieldKey) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      setMapping((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const uploadExtractedImages = async () => {
    const token = localStorage.getItem("token");
    const uploadedImageUrls: string[] = [];

    for (const imageUrl of extractedImages) {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "image.png");

      const uploadRes = await axios.post("/upload/image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      uploadedImageUrls.push(`http://localhost:5000${uploadRes.data.path}`);
    }

    return uploadedImageUrls;
  };

  const handleBulkImport = async () => {
    setBulkLoading(true);
    setBulkErrors([]);

    const uploadedImages = await uploadExtractedImages();

    const payload = excelRows.map((row, index) => {
      const get = (f: FieldKey) => row[mapping[f]] || "";
      return {
        nom_product: get("nom_product"),
        prix_gros: parseFloat(get("prix_gros")) || 0,
        prix_detail: parseFloat(get("prix_detail")) || 0,
        description: get("description"),
        categorie: get("categorie"),
        specifications: {
          poids: get("poids"),
          volume: get("volume"),
        },
        type: [get("type")],
        images: uploadedImages[index] ? [uploadedImages[index]] : [],
      };
    });
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/products/bulk?depot=${depotId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/products");
    } catch (err: any) {
      setBulkErrors(err.response?.data || ["Erreur inconnue"]);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: "auto" }}>
      {/* Formulaire manuel */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <h2>Ajouter un produit {depotId && `(pour le dépôt ${depotId})`}</h2>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Nom du produit
            <input
              type="text"
              name="nom_product"
              value={formData.nom_product}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Prix de gros
            <input
              type="number"
              name="prix_gros"
              value={formData.prix_gros}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Prix de détail
            <input
              type="number"
              name="prix_detail"
              value={formData.prix_detail}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Catégorie
            <input
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Poids
            <input
              type="text"
              name="poids"
              value={formData.poids}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Volume
            <input
              type="text"
              name="volume"
              value={formData.volume}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Type de produit
            <div>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="normal"
                  checked={formData.type.includes("normal")}
                  onChange={handleTypeChange}
                />
                Normal
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="frigorifique"
                  checked={formData.type.includes("frigorifique")}
                  onChange={handleTypeChange}
                />
                Frigorifique
              </label>
            </div>
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>
            Images
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
          {uploading && <p>Upload en cours...</p>}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {formData.images.map((image, index) => (
              <div key={index} style={{ position: "relative" }}>
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index),
                    }));
                  }}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={uploading}>
          Ajouter le produit
        </button>
      </form>

      {/* Import massif Excel */}
      <hr />
      <h3>Import en masse depuis Excel</h3>
      <input type="file" accept=".xls,.xlsx" onChange={handleFile} />

      {excelHeaders.length > 0 && (
        <>
          <h4>1. Faites correspondre les colonnes</h4>
          {Object.keys(mapping).map((field) => (
            <div key={field} style={{ marginBottom: 8 }}>
              <label style={{ width: 150, display: "inline-block" }}>{field}:</label>
              <select value={mapping[field as FieldKey]} onChange={handleMapChange(field as FieldKey)}>
                <option value="">— non mappé —</option>
                {excelHeaders.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <h4>2. Aperçu (5 premières lignes)</h4>
          <table border={1} cellPadding={4} style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                {excelHeaders.map((h) => <th key={h}>{h}</th>)}
                <th>Images extraites</th>
              </tr>
            </thead>
            <tbody>
              {excelRows.slice(0, 5).map((row, i) => (
                <tr key={i}>
                  {excelHeaders.map((h) => <td key={h}>{row[h]}</td>)}
                  <td>
                    {extractedImages[i] && (
                      <img src={extractedImages[i]} alt={`Produit ${i + 1}`} style={{ width: 50, height: 50 }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handleBulkImport} disabled={bulkLoading}>
            {bulkLoading ? "Import en cours…" : "Importer"}
          </button>

          {bulkErrors.length > 0 && (
            <div style={{ color: "red", marginTop: 16 }}>
              <h4>Erreurs :</h4>
              <ul>{bulkErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}