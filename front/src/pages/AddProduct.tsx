import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000"; // ⚠️ adapte selon ton env prod/dev

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const depotId = new URLSearchParams(location.search).get("depot");

  const [formData, setFormData] = useState({
    nom_product: "",
    prix_gros: "",
    prix_detail: "",
    description: "",
    categorie: "",
    poids: "",
    volume: "",
    type: ["normal"],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(""); // Peut être un lien ou un chemin backend
  const [imageInput, setImageInput] = useState<string>(""); // Pour le champ texte URL
  const [isUploading, setIsUploading] = useState(false);

  // Convertit image backend en chemin absolu, sinon direct
  function resolveImageUrl(url: string) {
    if (!url) return "";
    if (url.startsWith("/uploads/products/")) return `${API_URL}${url}`;
    if (url.startsWith("http")) return url;
    return "";
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, type: [e.target.value] }));
  };

  // Upload file to backend
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setIsUploading(true);

    const formDataFile = new FormData();
    formDataFile.append("file", file);

    // ✅ Ajoute l'Authorization si besoin
    const token = localStorage.getItem("token");
    try {
      const { data } = await axios.post(
        "/api/products/upload",
        formDataFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      setImageUrl(data.url); // Chemin backend (ex: /uploads/products/xxx.jpg)
      setImageInput(""); // Efface le champ texte s’il y avait un lien
    } catch (err) {
      alert("Erreur lors de l'upload du fichier.");
      setImageFile(null);
    }
    setIsUploading(false);
  };

  // Coller une URL d'image
  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setImageInput(value);
    setImageUrl(value);
    setImageFile(null);
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!imageUrl) {
      alert("Veuillez ajouter une image (upload ou lien URL) !");
      return;
    }

    const newProduct = {
      nom_product: formData.nom_product,
      prix_gros: parseFloat(formData.prix_gros),
      prix_detail: parseFloat(formData.prix_detail),
      description: formData.description,
      categorie: formData.categorie,
      type: formData.type,
      images: imageUrl ? [imageUrl] : [],
      specifications: {
        poids: formData.poids,
        volume: formData.volume,
      },
      disponibilite: depotId ? [{ depot_id: depotId, quantite: 0 }] : [],
      company_id: user.company,
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/products", newProduct, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (depotId) {
        navigate(`/gestion-depot/${depotId}`);
      } else {
        navigate("/dashboard-stock");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du produit", err);
      alert("Échec de l'ajout du produit.");
    }
  };

  const imagePreview = resolveImageUrl(imageUrl);

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}
    >
      <h2>Ajouter un produit {depotId && `(pour le dépôt ${depotId})`}</h2>
      <input
        type="text"
        name="nom_product"
        placeholder="Nom"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="prix_gros"
        placeholder="Prix de gros"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="prix_detail"
        placeholder="Prix de détail"
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="categorie"
        placeholder="Catégorie"
        onChange={handleChange}
        required
      />
      <div style={{ margin: "1rem 0" }}>
        <label>Type de produit :</label>
        <div>
          <label>
            <input
              type="radio"
              name="type"
              value="normal"
              checked={formData.type.includes("normal")}
              onChange={handleTypeChange}
              required
            />
            Normal
          </label>
          <label style={{ marginLeft: "1rem" }}>
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
      </div>
      <input
        type="text"
        name="poids"
        placeholder="Poids (kg)"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="volume"
        placeholder="Volume (L)"
        onChange={handleChange}
        required
      />
      <div style={{ margin: "1rem 0" }}>
        <label>
          Image du produit <span style={{ color: "red" }}>*</span> :
        </label>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isUploading}
            style={{ flex: 1 }}
          />
          <span style={{ fontWeight: 600 }}>ou</span>
          <input
            type="text"
            placeholder="Coller un lien URL d'image"
            value={imageInput}
            onChange={handleImageInputChange}
            style={{ flex: 2 }}
          />
        </div>
        {isUploading && <div>Upload en cours...</div>}
        {imagePreview && (
          <div style={{ marginTop: 8 }}>
            <img
              src={imagePreview}
              alt="Aperçu"
              style={{
                maxWidth: 150,
                maxHeight: 150,
                borderRadius: 8,
                boxShadow: "0 2px 5px #ccc",
              }}
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/default-product.jpg";
              }}
            />
          </div>
        )}
      </div>
      <button type="submit" disabled={isUploading || !imageUrl}>
        {isUploading ? "Upload en cours..." : "Ajouter"}
      </button>
    </form>
  );
}
