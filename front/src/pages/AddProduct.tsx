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
    imageUrl: "",
    type: ["normal"],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, type: [e.target.value] }));
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
      images: [formData.imageUrl],
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
      <input
        type="text"
        name="imageUrl"
        placeholder="Image URL"
        onChange={handleChange}
        required
      />
      <button type="submit">Ajouter</button>
    </form>
  );
}
