// FRONTEND - ProductEdit.tsx
import React, { useEffect, useState } from "react";
import axios from '../utils/axios';
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
    images: [] as string[],
    type: ["normal"],
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get(`/products/${id}`).then((res) => {
      const prod = res.data;
      setFormData({
        nom_product: prod.nom_product,
        prix_gros: prod.prix_gros,
        prix_detail: prod.prix_detail,
        description: prod.description,
        categorie: prod.categorie,
        poids: prod.specifications?.poids || "",
        volume: prod.specifications?.volume || "",
        images: prod.images || [],
        type: prod.type || ["normal"],
      });
    });
  }, [id]);

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
      const response = await axios.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
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

    await axios.put(`/products/${id}`, {
      nom_product: formData.nom_product,
      prix_gros: parseFloat(formData.prix_gros),
      prix_detail: parseFloat(formData.prix_detail),
      description: formData.description,
      categorie: formData.categorie,
      type: formData.type,
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
        <div>
          <label>
            Nom du produit
            <input type="text" name="nom_product" value={formData.nom_product} onChange={handleChange} required />
          </label>
        </div>

        <div>
          <label>
            Prix de gros
            <input type="number" name="prix_gros" value={formData.prix_gros} onChange={handleChange} required />
          </label>
        </div>

        <div>
          <label>
            Prix de détail
            <input type="number" name="prix_detail" value={formData.prix_detail} onChange={handleChange} required />
          </label>
        </div>

        <div>
          <label>
            Description
            <textarea name="description" value={formData.description} onChange={handleChange} required />
          </label>
        </div>

        <div>
          <label>
            Catégorie
            <input type="text" name="categorie" value={formData.categorie} onChange={handleChange} required />
          </label>
        </div>

        <div>
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

        <div>
          <label>
            Poids
            <input type="text" name="poids" value={formData.poids} onChange={handleChange} />
          </label>
        </div>

        <div>
          <label>
            Volume
            <input type="text" name="volume" value={formData.volume} onChange={handleChange} />
          </label>
        </div>

        <div>
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
          Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}