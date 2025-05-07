import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

interface Disponibilite {
  depot_id: string;
  quantite: number;
}

interface Product {
  _id: string;
  nom_product: string;
  categorie: string;
  disponibilite: Disponibilite[];
}

export default function GestionDepot() {
  const { depotId } = useParams<{ depotId: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!depotId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/products/by-depot/${depotId}`);
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        }
      } catch (err) {
        setError("Erreur lors du chargement des produits");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [depotId]);

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Supprimer ce produit de ce dépôt ?")) return;
    try {
      const product = products.find((p) => p._id === productId);
      if (!product) return;

      const updatedDispo = product.disponibilite.filter(
        (d) => d.depot_id !== depotId
      );
      await axios.put(`/api/products/${productId}`, {
        disponibilite: updatedDispo,
      });

      const updated = await axios.get(`/api/products/by-depot/${depotId}`);
      setProducts(updated.data);
    } catch (err) {
      console.error("Erreur lors de la suppression", err);
    }
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h2>Produits de votre dépôt</h2>

      <button
        onClick={() => navigate(`/add-product?depot=${depotId}`)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          fontSize: "1rem",
        }}
      >
        ➕ Ajouter un nouveau produit
      </button>

      {products.length === 0 ? (
        <p>Aucun produit trouvé dans ce dépôt.</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          cellSpacing={0}
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const dispo = product.disponibilite.find(
                (d) => d.depot_id === depotId
              );
              return (
                <tr key={product._id}>
                  <td>{product.nom_product}</td>
                  <td>{product.categorie}</td>
                  <td>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const quantiteInput = (
                          e.currentTarget.elements.namedItem(
                            "quantite"
                          ) as HTMLInputElement
                        ).value;
                        try {
                          await axios.put(
                            `/api/products/${product._id}/depot/${depotId}`,
                            {
                              quantite: parseInt(quantiteInput),
                            }
                          );
                          const updated = await axios.get(
                            `/api/products/by-depot/${depotId}`
                          );
                          setProducts(updated.data);
                        } catch (err) {
                          console.error("Erreur maj quantité", err);
                          alert("Erreur lors de la mise à jour");
                        }
                      }}
                    >
                      <input
                        type="number"
                        name="quantite"
                        defaultValue={dispo?.quantite ?? 0}
                        style={{ width: "60px" }}
                      />
                      <button type="submit">💾</button>
                    </form>
                  </td>

                  <td>
                    <button
                      onClick={() => navigate(`/product-detail/${product._id}`)}
                    >
                      Détails
                    </button>{" "}
                    <button
                      onClick={() =>
                        navigate(
                          `/product-edit/${product._id}?fromDepot=${depotId}`
                        )
                      }
                    >
                      Modifier
                    </button>{" "}
                    <button onClick={() => handleDelete(product._id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
