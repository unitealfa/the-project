import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "@/constants";

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
    type: ["normal"],
  });

  const [imageUrl, setImageUrl] = useState<string>(""); // Lien de l'image (upload ou URL)
  const [isUploading, setIsUploading] = useState(false);

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
        type: prod.type || ["normal"],
      });
      setImageUrl(prod.images?.[0] || "");
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

  // Coller un lien d’image
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value.trim());
  };

  // Upload image depuis appareil
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formDataFile = new FormData();
    formDataFile.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post("/api/products/upload", formDataFile, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setImageUrl(data.url); // Lien statique du backend
    } catch {
      alert("Erreur lors de l'upload de l'image");
    }
    setIsUploading(false);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.put(
      `/api/products/${id}`,
      {
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
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    if (fromDepot) {
      navigate(`/gestion-depot/${fromDepot}`);
    } else {
      navigate("/dashboard-stock");
    }
  };

  // Résolution du src pour image backend OU url web
  const resolveImageUrl = (img: string) => {
    if (!img) return "/default-product.jpg";
    return img.startsWith("http") ? img : `${API_URL}${img}`;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2 style={{ marginBottom: "1.5rem" }}>Modifier le produit</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
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

        <label>
          Prix de gros (DA)
          <input
            type="number"
            name="prix_gros"
            value={formData.prix_gros}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Prix de détail (DA)
          <input
            type="number"
            name="prix_detail"
            value={formData.prix_detail}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            required
          />
        </label>

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

        <div>
          <label>Type de produit :</label>
          <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
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
        </div>

        <label>
          Poids (kg)
          <input
            type="text"
            name="poids"
            value={formData.poids}
            onChange={handleChange}
          />
        </label>

        <label>
          Volume (L)
          <input
            type="text"
            name="volume"
            value={formData.volume}
            onChange={handleChange}
          />
        </label>

        <div>
          <h4>Image du produit</h4>
          {/* Champ pour coller un lien */}
          <input
            type="text"
            placeholder="Lien direct de l'image (http...)"
            value={imageUrl}
            onChange={handleImageUrlChange}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Bouton upload fichier */}
            <input
              type="file"
              accept="image/*"
              style={{ width: "auto" }}
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {/* Aperçu de l'image */}
            {imageUrl && (
              <img
                src={resolveImageUrl(imageUrl)}
                alt="Aperçu"
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: "1px solid #eee",
                  marginLeft: 8,
                }}
                onError={e => (e.currentTarget.src = "/default-product.jpg")}
              />
            )}
            {imageUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 5,
                  padding: "0.2rem 0.6rem",
                  marginLeft: 8,
                }}
              >
                ✖
              </button>
            )}
          </div>
          <small>
            Vous pouvez coller un lien direct <b>OU</b> uploader une image depuis votre appareil.<br />
            (jpg, png, webp, gif...)
          </small>
        </div>

        <div style={{ textAlign: "right" }}>
          <button type="submit" disabled={isUploading}>
            {isUploading ? "Upload..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}
