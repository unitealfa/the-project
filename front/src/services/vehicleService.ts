import axios from 'axios';

// Define your types (example)
export interface UserReference {
  _id: string;
  nom: string;
  prenom: string;
  email?: string; // Make optional if not always present
}

export interface DepotReference {
  _id: string;
  nom_depot: string;
}

// ----- AJOUT POUR WORKING_DAYS -----
export interface WorkingDay {
  day: string; // 'Monday', 'Tuesday', etc.
  shift: {
    start: string; // format "HH:MM"
    end: string;   // format "HH:MM"
  };
}
// -----------------------------------

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: UserReference | string; // Can be populated or just an ID
  livreur_id: UserReference | string;
  depot_id: DepotReference | string;
  working_days?: WorkingDay[]; // <-- Ajouté pour les horaires
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleData {
  make: string;
  model: string;
  year: string;
  license_plate: string;
  chauffeur_id: string; 
  livreur_id: string;
  working_days?: WorkingDay[]; // <-- Ajouté (optionnel)
}

export interface UpdateVehicleData {
  make?: string;
  model?: string;
  year?: string;
  license_plate?: string;
  chauffeur_id?: string;
  livreur_id?: string;
  working_days?: WorkingDay[]; // <-- Ajouté (optionnel)
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getVehicles = async (): Promise<Vehicle[]> => {
  // This endpoint in the backend should filter vehicles by the admin's depot based on their token
  const response = await axios.get(`${API_URL}/vehicles`, { headers: getAuthHeaders() });
  return response.data;
};

const getVehicleById = async (id: string): Promise<Vehicle> => {
  const response = await axios.get(`${API_URL}/vehicles/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

const createVehicle = async (data: CreateVehicleData): Promise<Vehicle> => {
  const response = await axios.post(`${API_URL}/vehicles`, data, { headers: getAuthHeaders() });
  return response.data;
};

const updateVehicle = async (id: string, data: UpdateVehicleData): Promise<Vehicle> => {
  const response = await axios.patch(`${API_URL}/vehicles/${id}`, data, { headers: getAuthHeaders() });
  return response.data;
};

const deleteVehicle = async (id: string): Promise<{ deleted: boolean; message?: string }> => {
  const response = await axios.delete(`${API_URL}/vehicles/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export default {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
