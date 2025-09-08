import type{ OrderService ,ServiceType, Detergent, OrderHistory} from "../interfaces/types";
import axios from "axios";
const API_BASE = "http://localhost:8000"; // ปรับตาม backend ของคุณ

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

// ดึงรายการ Detergent ตามประเภทจาก backend
export const fetchDetergentsByType = async (Type: string): Promise<Detergent[]> => {
  const res = await fetch(`http://localhost:8000/detergents/type/${Type}`);
  if (!res.ok) throw new Error("ไม่สามารถดึง Detergents ตามประเภทได้");
  const result = await res.json();
  return result.data || [];
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

// ดึงข้อมูลชื่อ-นามสกุลลูกค้าตาม ID
export const fetchCustomerNameById = async (customerId: number) => {
  try {
    const response = await axios.get(`${API_BASE}/customers/name/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching customer name:", error);
    throw error;
  }
};

// ดึงที่อยู่ของลูกค้าตาม ID
export const fetchAddresses = async (customerId: number) => {
  try {
    const response = await axios.get(`${API_BASE}/addresses?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
}

// สร้าง address ใหม่
export const createAddress = async (addressData: {
  addressDetails: string;
  latitude: number;
  longitude: number;
  customerId: number;
}) => {
  try {
    const response = await fetch(`${API_BASE}/orderaddress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressData),
    });
    if (!response.ok) throw new Error("ไม่สามารถบันทึกที่อยู่ได้");
    return response.json();
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

// อัพเดตที่อยู่หลักของลูกค้า
export const setMainAddress = async (customerId: number, addressId: number) => {
  const response = await fetch("http://localhost:8000/addresses/set-main", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customer_id: customerId, address_id: addressId })
  });
  if (!response.ok) throw new Error("ไม่สามารถตั้งที่อยู่หลักได้");
  return response.json();
};