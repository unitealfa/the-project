const apiBase = 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export interface Reclamation {
  _id: string;
  orderId: string;
  clientId: string;
  titre: string;
  message: string;
  status: 'en_attente' | 'resolue' | 'rejeter';
  reponse?: string;
  reponseDate?: string;
  createdAt: string;
}

export const reclamationService = {
  createReclamation: async (orderId: string, titre: string, message: string) => {
    const response = await fetch(`${apiBase}/api/reclamations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ orderId, titre, message }),
    });
    return response.json();
  },

  getReclamationsByOrder: async (orderId: string) => {
    const response = await fetch(`${apiBase}/api/reclamations/order/${orderId}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  getReclamationsByClient: async () => {
    const response = await fetch(`${apiBase}/api/reclamations/client`, {
      headers: getHeaders()
    });
    return response.json();
  },

  getReclamationsByDepot: async (depotId: string) => {
    const response = await fetch(`${apiBase}/api/reclamations/depot/${depotId}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  updateReclamationStatus: async (id: string, status: 'en_attente' | 'resolue' | 'rejeter', reponse: string) => {
    const response = await fetch(`${apiBase}/api/reclamations/${id}/status`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ status, reponse }),
    });
    return response.json();
  }
}; 