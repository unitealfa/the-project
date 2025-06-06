import React, { useState } from "react";
import axios from "../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { read, utils } from "xlsx";
import JSZip from "jszip";
import Header from '../components/Header';

// Importez Link si vous voulez un bouton retour qui est un lien (utilisé navigate(-1) ici)
// import { Link } from 'react-router-dom';

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
      const imageFiles = imagesFolder.filter((relativePath) => /\.(png|jpg|jpeg|jfif)$/i.test(relativePath));
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
    <>
      <Header />
      <div style={{
        backgroundColor: '#f4f7f6', // Fond doux
        padding: '2rem 1rem', // Padding haut/bas et latéral
        minHeight: 'calc(100vh - 60px)', // Occupe la majorité de l'écran (soustrait la hauteur du header)
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* En-tête moderne - Conservation du titre, suppression du bouton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800, // Aligner avec le contenu
          margin: '0 auto',
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1a1a1a',
            margin: 0,
            flexGrow: 1,
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>Ajouter un produit {depotId && `(pour le dépôt ${depotId})`}</h1>
        </div>

        {/* Conteneur pour les deux sections (formulaire unitaire et import) */}
        <div style={{
            maxWidth: 800, // Largeur max pour centrer
            margin: '0 auto', // Centrer les sections
            display: 'flex', // Utiliser flexbox pour organiser les sections
            flexDirection: 'column',
            gap: '2rem', // Espacement entre les sections
            backgroundColor: '#ffffff', // Fond blanc pour la carte principale qui contient tout
            padding: '2rem', // Padding à l'intérieur de la carte
            borderRadius: '8px', // Coins arrondis
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
        }}>

          {/* Bouton Retour - AJOUTÉ ICI à l'intérieur du conteneur principal */}
          <button
            onClick={() => navigate(-1)} // Revenir à la page précédente
            style={{
              alignSelf: 'flex-start', // Aligner à gauche
              marginBottom: '1.5rem', // Espacement sous le bouton
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a', // Bouton noir
              color: '#ffffff', // Texte blanc
              border: 'none',
              borderRadius: '20px', // Coins arrondis
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>

          {/* Section Formulaire unitaire */}
          <div style={{
            display: 'flex', // Utiliser flexbox
            flexDirection: 'column',
            gap: '1.5rem', // Espacement entre les éléments du formulaire
             border: '1px solid #e5e7eb', // Bordure légère
             borderRadius: '6px',
             padding: '1.5rem',
             backgroundColor: '#fafafa', // Léger fond pour la section
          }}>
             <h2 style={{
               marginTop: 0,
               marginBottom: '1.2rem',
               fontSize: '1.4rem',
               fontWeight: 'bold',
               color: '#1a1a1a',
             }}>Ajouter un produit manuellement</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Champs du formulaire unitaire */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du produit :</label>
                <input
                  type="text"
                  name="nom_product"
                  value={formData.nom_product}
                  onChange={handleChange}
                  required
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prix de gros :</label>
                  <input
                    type="number"
                    name="prix_gros"
                    value={formData.prix_gros}
                    onChange={handleChange}
                    required
                     style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prix de détail :</label>
                  <input
                    type="number"
                    name="prix_detail"
                    value={formData.prix_detail}
                    onChange={handleChange}
                    required
                     style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Description :</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                   style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                />
              </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Catégorie :</label>
                  <input
                    type="text"
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                     style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Type :</label>
                   {/* Assurez-vous que formData.type est un tableau pour .includes */}
                     <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                       <label>
                         <input
                           type="radio"
                           name="type"
                           value="normal"
                           checked={formData.type.includes("normal")}
                           onChange={handleTypeChange}
                         /> Normal
                       </label>
                       <label>
                         <input
                           type="radio"
                           name="type"
                           value="frigorifique"
                           checked={formData.type.includes("frigorifique")}
                           onChange={handleTypeChange}
                         /> Frigorifique
                       </label>
                     </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Poids :</label>
                   <input
                     type="text"
                     name="poids"
                     value={formData.poids}
                     onChange={handleChange}
                      style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                   />
                 </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Volume :</label>
                  <input
                    type="text"
                    name="volume"
                    value={formData.volume}
                    onChange={handleChange}
                     style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Images :</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading} // Désactiver pendant l'upload
                   style={{
                       padding: '0.75rem',
                       border: '1px solid #ccc',
                       borderRadius: '4px',
                       backgroundColor: uploading ? '#e5e7eb' : '#fff',
                       cursor: uploading ? 'not-allowed' : 'pointer',
                   }}
                />
                {uploading && <p style={{ fontSize: '0.9rem', color: '#555' }}>Chargement de l'image...</p>}
                 {formData.images.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                     <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Images ajoutées :</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {formData.images.map((imgUrl, index) => (
                        <img
                          key={index}
                          src={imgUrl}
                          alt={`Produit ${index}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #ccc'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                 )}
              </div>

              <button type="submit" style={{
                marginTop: '1.5rem', // Espacement au-dessus
                padding: '1rem 2rem',
                backgroundColor: '#1a1a1a', // Fond noir
                color: '#ffffff', // Texte blanc
                border: 'none',
                borderRadius: '20px', // Coins arrondis
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                alignSelf: 'center', // Centrer le bouton
                transition: 'background-color 0.3s ease', // Transition douce
              }}>
                Ajouter le produit
              </button>

            </form>
          </div> {/* Fin Section Formulaire unitaire */}

          {/* Section Import Excel */}
          <div style={{
            display: 'flex', // Utiliser flexbox
            flexDirection: 'column',
            gap: '1.5rem', // Espacement entre les éléments
          }}>
             <h2 style={{
               marginTop: 0,
               marginBottom: '1.2rem',
               fontSize: '1.4rem',
               fontWeight: 'bold',
               color: '#1a1a1a',
             }}>Importer des produits depuis Excel</h2>
            <p style={{ color: '#555' }}>Téléchargez un fichier Excel (.xlsx) contenant les informations de vos produits. Assurez-vous que la première ligne contient les en-têtes.</p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Sélectionner fichier Excel :</label>
                 <input
                   type="file"
                   accept=".xlsx"
                   onChange={handleFile}
                    style={{
                        padding: '0.75rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        cursor: 'pointer',
                    }}
                 />
            </div>

            {excelHeaders.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{
                  marginBottom: '1.2rem',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                }}>Mapper les colonnes Excel aux champs du produit</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {Object.keys(mapping).map(field => (
                    <div key={field} style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>
                        {field.replace('_', ' ').replace('product', '').trim().charAt(0).toUpperCase() + field.replace('_', ' ').replace('product', '').trim().slice(1)} :
                      </label>
                      <select
                        value={mapping[field as FieldKey]}
                        onChange={handleMapChange(field as FieldKey)}
                         style={{ padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="">-- Sélectionner une colonne --</option>
                        {excelHeaders.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                 {extractedImages.length > 0 && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
                       <h4 style={{
                         marginBottom: '1rem',
                         fontSize: '1rem',
                         fontWeight: 'bold',
                         color: '#333',
                       }}>Images extraites (aperçu) :</h4>
                       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                           {extractedImages.map((imgUrl, index) => (
                               <img
                                  key={index}
                                  src={imgUrl}
                                  alt={`Extracted ${index}`}
                                  style={{
                                      width: 60,
                                      height: 60,
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid #ccc'
                                  }}
                               />
                           ))}
                       </div>
                    </div>
                 )}

                 <button
                    onClick={handleBulkImport}
                    disabled={bulkLoading || Object.values(mapping).some(val => val === '')}
                    style={{
                      marginTop: '2rem',
                      padding: '1rem 2rem',
                      backgroundColor: bulkLoading || Object.values(mapping).some(val => val === '') ? '#6b7280' : '#1a1a1a', // Gris si désactivé, noir sinon
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: bulkLoading || Object.values(mapping).some(val => val === '') ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      alignSelf: 'center',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    {bulkLoading ? 'Importation en cours...' : 'Importer les produits'}
                 </button>

                {bulkErrors.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: '#dc2626', fontWeight: 'bold' }}>Erreurs d'importation :</p>
                    <ul style={{ color: '#dc2626', marginLeft: '1.5rem' }}>
                      {bulkErrors.map((err, index) => (
                        <li key={index}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}

          </div> {/* Fin Section Import Excel */}

        </div> {/* Fin Conteneur pour les deux sections */}

        {/* L'affichage de l'erreur globale reste en dehors des cartes si besoin */}
         {/* error && <p style={{ color: '#dc2626', marginTop: '1rem', textAlign: 'center' }}>{error}</p> */}

      </div> {/* Fin Conteneur principal */}
    </>
  );
}