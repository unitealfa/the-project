export interface Specification {
  poids: string;
  volume: string;
}

export interface Disponibilite {
  depot_id: string;
  quantite: number;
}

export interface Product {
  _id?: string;
  nom_product: string;
  prix_gros: number;
  prix_detail: number;
  description: string;
  categorie: string;
  images: string[];
  specifications: Specification;
  company_id?: string;
  disponibilite?: Disponibilite[];
}
