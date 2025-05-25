import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

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
    images: [] as string[],
    type: ["normal"],
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, `http://localhost:5000${response.data.path}`]
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const newProduct = {
      nom_product: formData.nom_product,
      prix_gros: parseFloat(formData.prix_gros),
      prix_detail: parseFloat(formData.prix_detail),
      description: formData.description,
      categorie: formData.categorie,
      type: formData.type,
      images: Array.isArray(formData.images) ? formData.images : [],
      specifications: {
        poids: formData.poids,
        volume: formData.volume,
      },
      disponibilite: depotId ? [{ depot_id: depotId, quantite: 0 }] : [],
      company_id: user.company,
    };

    try {
      await axios.post("/api/products", newProduct);
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}
    >
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
          {formData.images.map((image, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={image}
                alt={`Product ${index + 1}`}
                style={{ width: "100px", height: "100px", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
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
                  cursor: "pointer"
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
  );
}
