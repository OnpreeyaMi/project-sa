// src/types.ts
export interface OrderService {
  customer_id: number;
  service_type_ids: number[];
  detergent_ids: number[];
  order_image?: string | null;
  order_note?: string;
  address_id: number;
}

export interface ServiceType {
  id: number;
  name: string;
  price?: number;
  description?: string;
}

export interface Detergent {
  id: number;
  name: string;
  type: "Liquid" | "Powder";
  inStock: number;
}

export interface OrderHistory {
  id: number;
  order_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    customer_id: number;
    order_image?: string | null;
    order_note?: string;
    address_id: number;
    service_types: { id: number; name: string; price?: number }[];
    detergents: { id: number; name: string; type: "Liquid"|"Powder"; inStock: number }[];
  }
}