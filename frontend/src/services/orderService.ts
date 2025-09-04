import type{ OrderService ,ServiceType, Detergent, OrderHistory} from "../interfaces/types";
import axios from "axios";
const API_BASE = "http://localhost:8080"; // ปรับตาม backend ของคุณ

// ดึงรายการ ServiceType จาก backend
export const fetchServiceTypes = async (): Promise<ServiceType[]> => {
  const res = await fetch(`${API_BASE}/servicetypes`);
  if (!res.ok) throw new Error("ไม่สามารถดึง ServiceType ได้");
  return res.json();
};

// ดึงรายการ Detergent จาก backend
export const fetchDetergents = async (): Promise<Detergent[]> => {
  const res = await fetch(`${API_BASE}/detergents`);
  if (!res.ok) throw new Error("ไม่สามารถดึง Detergents ได้");
  return res.json();
};

// สร้างออเดอร์ใหม่
export const createOrder = async (orderData: OrderService) => {
  const res = await fetch(`${API_BASE}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData?.error || "สร้างออเดอร์ไม่สำเร็จ");
  }

  return res.json(); // คืนค่า order object จาก backend
};
// src/services/orderService.ts
// ดึงประวัติการสั่งซื้อทั้งหมด
export const fetchOrderHistories = async (): Promise<OrderHistory[]> => {
  try {
    const response = await axios.get(`${API_BASE}/order-histories`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order histories:", error);
    throw error;
  }
};

export const fetchAddressByCustomerId = async (customerId: number) => {
  try {
    const response = await axios.get(`${API_BASE}/addresses?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
}

// ดึงที่อยู่ทั้งหมด (mock)
export const fetchAddresses = async () => {
  const res = await axios.get(`${API_BASE}/addresses`);
  // คืน array จริงจาก res.data.data
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
// ดึงข้อมูลลูกค้าจาก customer ID (mock)
export const fetchCustomerById = async (customerId: number) => {
  try {
    const response = await axios.get(`${API_BASE}/customers/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw error;
  }
}