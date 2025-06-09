const apiBase = "http://localhost:5000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface OrderItem {
  productId: string;
  productName: string;
  prix_detail: number;
  quantity: number;
}

export interface Order {
  _id: string;
  clientId: string;
  nom_client: string;
  telephone: string;
  depot: string;
  depot_name?: string;
  numero?: string;
  confirmed: boolean;
  adresse_client?: {
    adresse?: string;
    ville?: string;
    code_postal?: string;
    region?: string;
  };
  items: OrderItem[];
  total: number;
  etat_livraison: "en_attente" | "en_cours" | "livree";
  createdAt: string;
  photosLivraison?: Array<{ url: string; takenAt: string }>;
}

export const orderService = {
  createOrder: async (orderData: { items: OrderItem[]; total: number }) => {
    const response = await fetch(`${apiBase}/api/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message =
        errorData?.message || "Erreur lors de la création de la commande";
      throw new Error(message);
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${apiBase}/api/orders`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des commandes");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  getClientOrders: async () => {
    const response = await fetch(`${apiBase}/api/orders/client`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des commandes");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  getOrderById: async (id: string) => {
    const response = await fetch(`${apiBase}/api/orders/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la commande");
    }
    return response.json();
  },

  confirmOrder: async (id: string) => {
    const response = await fetch(`${apiBase}/api/orders/${id}/confirm`, {
      method: "PATCH",
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la confirmation de la commande");
    }
    return response.json();
  },
};
