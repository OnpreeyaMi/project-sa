// src/types.ts
export interface OrderService {
  customer_id: number;
  servicetype_ids: number[];
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
  customer_id: number;
  servicetype_ids: number[];
  detergent_ids: number[];
  order_image?: string | null;
  order_note?: string;
  address_id: number;
  created_at: string;
  updated_at: string;
}
