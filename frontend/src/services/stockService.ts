import axios from "axios";
const API_BASE = "http://localhost:8000"; // ปรับตาม backend ของคุณ

export interface Detergent {
  Name: string;
  Type: string;
  InStock: number;
  UserID: number;
  CategoryID: number;
}

export interface PurchaseDetergent {
  Quantity: number;
  Price: number;
  Supplier: string;
  UserID: number;
}

export interface DetergentWithPurchase {
  detergent: Detergent;
  purchase: PurchaseDetergent;
}

export async function createDetergentWithPurchase(data: DetergentWithPurchase) {
  const response = await axios.post(`${API_BASE}/detergents/purchase`, data);
  return response.data;
}

export async function getAllDetergents() {
  const response = await axios.get(`${API_BASE}/detergents`);
  return response.data;
}

export async function deleteDetergent(id: number) {
  const response = await axios.delete(`${API_BASE}/detergents/${id}`);
  return response.data;
}

export async function getPurchaseDetergentHistory() {
  const response = await axios.get(`${API_BASE}/detergents/purchase-history`);
  return response.data;
}
export async function getDetergentUsageHistory() {
  const response = await axios.get(`${API_BASE}/detergents/usage-history`);
  return response.data;
}

export async function useDetergent({ user_id, detergent_id, quantity, reason }: {
  user_id: number;
  detergent_id: number;
  quantity: number;
  reason: string;
}) {
  const response = await axios.post(`${API_BASE}/detergents/use`, {
    user_id,
    detergent_id,
    quantity,
    reason
  });
  return response.data;
}