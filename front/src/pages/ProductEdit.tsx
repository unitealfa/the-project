// FRONTEND - ProductEdit.tsx
import React, { useEffect, useState } from "react";
import axios from '../utils/axios';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from '../constants';
import Header from '../components/Header';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        images: [...prev.images, `${API_URL}${response.data.path}`],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate numeric fields
    const prixGros = parseFloat(formData.prix_gros);
    const prixDetail = parseFloat(formData.prix_detail);
    
    if (isNaN(prixGros) || isNaN(prixDetail)) {
      setError('Les prix doivent être des nombres valides');
      return;
    }

    const requestData: any = {
      nom_product: formData.nom_product,
      prix_gros: prixGros,
      prix_detail: prixDetail,
      description: formData.description,
      categorie: formData.categorie,
      type: formData.type,
      images: formData.images,
    };

    // Only include specifications if poids or volume have values
    if ((formData.poids && String(formData.poids).trim()) || (formData.volume && String(formData.volume).trim())) {
      requestData.specifications = {
        poids: formData.poids ? String(formData.poids).trim() : '',
        volume: formData.volume ? String(formData.volume).trim() : '',
      };
    }

    console.log('Sending PUT request with data:', requestData);

    try {
      await axios.put(`/products/${id}`, requestData);

      setSuccess('Produit modifié avec succès');
      setTimeout(() => {
        if (fromDepot) {
          navigate(`/gestion-depot/${fromDepot}`);
        } else {
          navigate("/dashboard-stock");
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error response:', err.response?.data);
      console.error('Error message array:', err.response?.data?.message);
      if (err.response?.data?.message && Array.isArray(err.response.data.message)) {
        console.error('Validation errors:', err.response.data.message.join(', '));
      }
      setError('Erreur lors de la modification du produit');
    }
  };

  return (
    <>
      <Header />
      <div style={{
        backgroundColor: '#f4f7f6',
        padding: '2rem 1rem',
        minHeight: 'calc(100vh - 60px)',
        fontFamily: 'Arial, sans-serif',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800,
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
          }}>Modifier le produit</h1>
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
        {success && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{success}</p>}

        <form onSubmit={handleSubmit} style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: '#ffffff',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start',
              marginBottom: '1.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            ← Retour
          </button>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="nom_product" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du produit:</label>
            <input
              id="nom_product"
              type="text"
              name="nom_product"
              value={formData.nom_product}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="prix_gros" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prix de gros:</label>
              <input
                id="prix_gros"
                type="number"
                name="prix_gros"
                value={formData.prix_gros}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="prix_detail" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Prix de détail:</label>
              <input
                id="prix_detail"
                type="number"
                name="prix_detail"
                value={formData.prix_detail}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="description" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
                minHeight: '100px',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label htmlFor="categorie" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Catégorie:</label>
            <input
              id="categorie"
              type="text"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
              style={{
                padding: '0.75rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Type de produit</legend>

            <div style={{ display: 'flex', gap: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="normal"
                  checked={formData.type.includes("normal")}
                  onChange={handleTypeChange}
                  style={{ cursor: 'pointer' }}
                />
                <span>Normal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="type"
                  value="frigorifique"
                  checked={formData.type.includes("frigorifique")}
                  onChange={handleTypeChange}
                  style={{ cursor: 'pointer' }}
                />
                <span>Frigorifique</span>
              </label>
            </div>
          </fieldset>

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Spécifications</legend>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="poids" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Poids:</label>
                <input
                  id="poids"
                  type="text"
                  name="poids"
                  value={formData.poids}
                  onChange={handleChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label htmlFor="volume" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Volume:</label>
                <input
                  id="volume"
                  type="text"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </fieldset>

          <fieldset style={{
            marginTop: '1rem',
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <legend style={{
              fontWeight: 'bold',
              color: '#1a1a1a',
              padding: '0 0.5rem',
              fontSize: '1.1rem',
            }}>Images</legend>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="image" style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Ajouter une image:</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  backgroundColor: uploading ? '#f3f4f6' : '#fff',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              />
              {uploading && <p style={{ marginTop: '0.5rem', color: '#666' }}>Upload en cours...</p>}
            </div>

            {formData.images.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Images actuelles:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        style={{
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                        }}
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
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={uploading}
            style={{
              marginTop: '1.5rem',
              padding: '1rem 2rem',
              backgroundColor: '#1a1a1a',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              alignSelf: 'center',
              transition: 'background-color 0.3s ease',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </>
  );
}