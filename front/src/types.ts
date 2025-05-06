// front/src/types.ts
export interface Product {
    _id: string;
    nom_product: string;
    prix_gros: number;
    prix_detail: number;
    date_expiration: string;     // "YYYY-MM-DD"
    quantite_stock: number;
    description: string;
    categorie: string;
    images: string[];            // URLs
    specifications: {
      poids: string;
      volume: string;
    };
  }
  