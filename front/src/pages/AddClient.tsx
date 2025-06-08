// 📁 src/pages/AddClient.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function AddClient() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const apiBase = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    nom_client: '',
    email: '',
    password: '',
    contact: {
      nom_gerant: '',
      telephone: '',
    },
    localisation: {
      adresse: '',
      ville: '',
      code_postal: '',
      region: '',
      coordonnees: {
        latitude: 0,
        longitude: 0,
      },
    },
  });

  const [pfpFile, setPfpFile] = useState<File | null>(null);
  const [suggestedClient, setSuggestedClient] = useState<any>(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const [verifDone, setVerifDone] = useState(false);

  const clientDejaAffecte = (client: any) => {
    return client.affectations?.some(
      (a: any) => a.depot === user?.depot
    );
  };

  // Ajout d'une pop-up native pour récapituler les informations du client existant et proposer l'affectation
  const checkExistingClient = async () => {
    setVerifDone(true);
    setShowFullForm(false);

    try {
      const res = await fetch(
        `${apiBase}/clients/check?email=${encodeURIComponent(form.email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        setShowFullForm(true);
        return;
      }

      const data = await res.json();
      if (data?.nom_client === form.nom_client) {
        const info =
          `Client trouvé:\n` +
          `Nom: ${data.nom_client}\n` +
          `Email: ${data.email}\n` +
          `Nom gérant: ${data.contact.nom_gerant}\n` +
          `Téléphone: ${data.contact.telephone}\n` +
          `Adresse: ${data.localisation.adresse}, ${data.localisation.region}\n`;
        const confirmAdd = window.confirm(
          info + '\nVoulez-vous l\'affecter à votre dépôt ?'
        );
        if (confirmAdd) {
          handleAffecterClient(data);
        }
      } else {
        setShowFullForm(true);
      }
    } catch {
      setShowFullForm(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === 'pfp' && files) {
      setPfpFile(files[0]);
      return;
    }

    if (name.startsWith('contact.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, contact: { ...f.contact, [key]: value } }));
    } else if (name.startsWith('localisation.')) {
      const key = name.split('.')[1];
      setForm(f => ({ ...f, localisation: { ...f.localisation, [key]: value } }));
    } else if (name.startsWith('coordonnees.')) {
      const key = name.split('.')[1];
      setForm(f => ({
        ...f,
        localisation: {
          ...f.localisation,
          coordonnees: {
            ...f.localisation.coordonnees,
            [key]: parseFloat(value),
          },
        },
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('nom_client', form.nom_client);
      data.append('email', form.email);
      data.append('password', form.password);
      data.append('contact.nom_gerant', form.contact.nom_gerant);
      data.append('contact.telephone', form.contact.telephone);
      data.append('localisation.adresse', form.localisation.adresse);
      data.append('localisation.ville', form.localisation.ville);
      data.append('localisation.code_postal', form.localisation.code_postal);
      data.append('localisation.region', form.localisation.region);
      data.append(
        'coordonnees.latitude',
        form.localisation.coordonnees.latitude.toString()
      );
      data.append(
        'coordonnees.longitude',
        form.localisation.coordonnees.longitude.toString()
      );
      if (pfpFile) {
        data.append('pfp', pfpFile);
      }

      // Debug: Afficher le contenu de FormData
      for (let pair of data.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
      }

      const res = await fetch(`${apiBase}/clients`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error((err.message || err).toString());
      }
      navigate('/clients');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAffecterClient = async (client: any) => {
    if (clientDejaAffecte(client)) {
      alert('⚠️ Ce client est déjà affecté à votre dépôt.');
      return;
    }
    try {
      const res = await fetch(
        `${apiBase}/clients/${client._id}/affectation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            entreprise: user.entreprise,
            depot: user.depot,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Erreur lors de l'affectation.");
        return;
      }
      navigate('/clients');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Header />
      {/* Conteneur principal avec fond doux et padding */}
      <div style={{
        backgroundColor: '#f4f7f6', // Fond doux
        padding: '2rem 1rem', // Padding haut/bas et latéral
        minHeight: 'calc(100vh - 60px)', // Occupe la majorité de l'écran (soustrait la hauteur du header)
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* En-tête moderne */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          maxWidth: 800, // Aligner avec le formulaire
          margin: '0 auto',
        }}>
           <h1 style={{
            fontSize: '2rem', // Augmenter légèrement la taille
            fontWeight: 'bold',
            color: '#1a1a1a', // Noir plus prononcé
            margin: 0,
            flexGrow: 1, // Permet au titre de prendre l'espace restant
            textAlign: 'center', // Centrer le titre
            textTransform: 'uppercase', // Mettre en majuscules
            letterSpacing: '0.05em', // Espacement entre les lettres
          }}>Ajouter un client</h1>
        </div>

        {/* Formulaire centré et stylisé */}
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: 800, // Largeur max pour centrer
            margin: '0 auto', // Centrer le formulaire
            backgroundColor: '#ffffff', // Fond blanc pour la carte principale
            padding: '2rem',
            borderRadius: '8px', // Coins arrondis
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)', // Ombre subtile
            display: 'flex', // Utiliser flexbox pour l'organisation interne
            flexDirection: 'column',
            gap: '1.5rem', // Espacement entre les champs
          }}
        >
          {/* Bouton Retour */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start', // Aligner à gauche dans le flex container
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

          {/* Champs du formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du client (magasin) :</label>
            <input
              name="nom_client"
              placeholder="Nom client (magasin)"
              required
              onChange={handleChange}
              value={form.nom_client}
              style={{ 
                padding: '0.75rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Email :</label>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={handleChange}
              value={form.email}
              style={{ 
                padding: '0.75rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {!showFullForm && (
            <button
              type="button"
              onClick={checkExistingClient}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.3s ease',
              }}
            >
              🔍 Vérifier
            </button>
          )}

          {verifDone && showFullForm && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Mot de passe :</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Mot de passe"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Nom du gérant :</label>
                <input
                  name="contact.nom_gerant"
                  placeholder="Nom gérant"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Téléphone :</label>
                <input
                  name="contact.telephone"
                  placeholder="Téléphone"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Adresse :</label>
                <input
                  name="localisation.adresse"
                  placeholder="Adresse"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Ville :</label>
                <input
                  name="localisation.ville"
                  placeholder="Ville"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Code postal :</label>
                <input
                  name="localisation.code_postal"
                  placeholder="Code postal"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Région :</label>
                <input
                  name="localisation.region"
                  placeholder="Région"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Latitude :</label>
                <input
                  name="coordonnees.latitude"
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Longitude :</label>
                <input
                  name="coordonnees.longitude"
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  required
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Photo de profil :</label>
                <input
                  name="pfp"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ 
                    padding: '0.75rem', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}

          {verifDone && showFullForm && (
            <button
              type="submit"
              style={{
                marginTop: '1.5rem',
                padding: '1rem 2rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                alignSelf: 'center',
                transition: 'background-color 0.3s ease',
              }}
            >
              Ajouter le client
            </button>
          )}
        </form>
      </div>
    </>
  );
}
