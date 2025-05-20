import { apiFetch } from '../utils/api';

export interface OrderItem {
  productId: string;
  productName: string;
  prix_detail: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  total: number;
}

export const orderService = {
  createOrder: async (payload: CreateOrderPayload) => {
    const res = await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  getOrders: async () => {
    const res = await apiFetch('/api/orders');
    return res.json();
  },
  confirmOrder: async (orderId: string) => {
    const res = await apiFetch(`/api/orders/${orderId}/confirm`, {
      method: "PATCH",
    });
    return res.json();
  }
};