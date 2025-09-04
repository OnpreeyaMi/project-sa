import axios from "axios";
const API_BASE = "http://localhost:8080"; // ปรับตาม backend ของคุณ

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
