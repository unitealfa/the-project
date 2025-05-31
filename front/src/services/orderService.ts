const apiBase = 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
  items: OrderItem[];
  total: number;
  status: string;
  depot: string;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  createOrder: async (orderData: { items: OrderItem[]; total: number }) => {
    const response = await fetch(`${apiBase}/api/orders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch(`${apiBase}/api/orders`, {
      headers: getHeaders()
    });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  getOrderById: async (id: string) => {
    const response = await fetch(`${apiBase}/api/orders/${id}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  confirmOrder: async (id: string) => {
    const response = await fetch(`${apiBase}/api/orders/${id}/confirm`, {
      method: "PATCH",
      headers: getHeaders()
    });
    return response.json();
  }
};