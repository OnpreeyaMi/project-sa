// src/services/orders.ts
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export type LatestOrderResp = {
  orderId: number;
  status?: string;
  amount?: number;
  createdAt: string;
};

export async function fetchLatestOrderId(id: string | number | undefined): Promise<number> {

  const res = await axios.get<LatestOrderResp>(`${API}/orders/latest/${id}`);
  return res.data.orderId;
}
