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
  type: "Liquid" | "Softener";
  inStock: number;
  image: string;
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
  order: {
    id: number;
    customer_id: number;
    order_image?: string | null;
    order_note?: string;
    address_id: number;
    service_types: { id: number; name: string; price?: number }[];
    detergents: { id: number; name: string; type: "Liquid"|"Powder"; inStock: number }[];
    LaundryProcesses?: {
      machine?: {  machine_type: string }[];
    }[];
    Payment?: {
      payment_status: string;
      total_amount: number;
    };
  }
};

// เพิ่ม interface สำหรับที่อยู่
export interface Address {
  id: number;
  customer_id: number;
  address_details: string;
  latitude: number;
  longitude: number;
  is_default: boolean;
}
