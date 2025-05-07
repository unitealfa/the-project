// FRONTEND - ProductEdit.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromDepot = searchParams.get("fromDepot");

  const [formData, setFormData] = useState({
    nom_product: "",
    prix_gros: "",
    prix_detail: "",
    description: "",
    categorie: "",
    poids: "",
    volume: "",
    images: [""],
  });

  useEffect(() => {
    axios.get(`/api/products/${id}`).then((res) => {
      const prod = res.data;
      setFormData({
        nom_product: prod.nom_product,
        prix_gros: prod.prix_gros,
        prix_detail: prod.prix_detail,
        description: prod.description,
        categorie: prod.categorie,
        poids: prod.specifications?.poids || "",
        volume: prod.specifications?.volume || "",
        images: prod.images || [""],
      });
    });
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, value: string) => {
    const updated = [...formData.images];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleAddImage = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.put(`/api/products/${id}`, {
      nom_product: formData.nom_product,
      prix_gros: parseFloat(formData.prix_gros),
      prix_detail: parseFloat(formData.prix_detail),
      description: formData.description,
      categorie: formData.categorie,
      images: formData.images,
      specifications: {
        poids: formData.poids,
        volume: formData.volume,
      },
    });

    if (fromDepot) {
      navigate(`/gestion-depot/${fromDepot}`);
    } else {
      navigate("/dashboard-stock");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Modifier le produit</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <label>
          Nom du produit
          <input type="text" name="nom_product" value={formData.nom_product} onChange={handleChange} required />
        </label>

        <label>
          Prix de gros (DA)
          <input type="number" name="prix_gros" value={formData.prix_gros} onChange={handleChange} required />
        </label>

        <label>
          Prix de détail (DA)
          <input type="number" name="prix_detail" value={formData.prix_detail} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required />
        </label>

        <label>
          Catégorie
          <input type="text" name="categorie" value={formData.categorie} onChange={handleChange} required />
        </label>

        <label>
          Poids (kg)
          <input type="text" name="poids" value={formData.poids} onChange={handleChange} />
        </label>

        <label>
          Volume (L)
          <input type="text" name="volume" value={formData.volume} onChange={handleChange} />
        </label>

        <div>
          <h4>Images</h4>
          {formData.images.map((img, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <input
                type="text"
                value={img}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder={`URL image ${index + 1}`}
              />
              {img && <img src={img} alt={`img-${index}`} style={{ width: "50px", height: "50px", objectFit: "cover" }} />}
            </div>
          ))}
          <button type="button" onClick={handleAddImage}>+ Ajouter une image</button>
        </div>

        <div style={{ textAlign: "right" }}>
          <button type="submit">Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
