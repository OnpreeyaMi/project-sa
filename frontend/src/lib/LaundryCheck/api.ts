import type {
  Customer,
  ClothType,
  ServiceType,
  LaundryCheckInput,
  OrderSummary,
  OrderDetail,
} from "../../interfaces/LaundryCheck/types";

const API_BASE = "http://localhost:8000";

export async function FetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/laundry-check/customers`);
  if (!res.ok) throw new Error("โหลดลูกค้าไม่สำเร็จ");
  return res.json();
}

export async function FetchClothTypes(): Promise<ClothType[]> {
  const res = await fetch(`${API_BASE}/clothtypes`);
  if (!res.ok) throw new Error("โหลดประเภทผ้าไม่สำเร็จ");
  return res.json();
}

export async function FetchServiceTypes(): Promise<ServiceType[]> {
  const res = await fetch(`${API_BASE}/servicetypes`);
  if (!res.ok) throw new Error("โหลดบริการไม่สำเร็จ");
  return res.json();
}

export async function CreateLaundryCheck(payload: LaundryCheckInput): Promise<{ OrderID: number }> {
  const res = await fetch(`${API_BASE}/laundry-checks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload), // คีย์เป็น PascalCase ตาม type
  });
  if (!res.ok) throw new Error("บันทึกออเดอร์ไม่สำเร็จ");
  return res.json();
}

export async function AddLaundryItems(orderId: number, items: LaundryCheckInput["Items"]): Promise<{ Message: string; TotalQuantity: number }> {
  const res = await fetch(`${API_BASE}/laundry-checks/${orderId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error("เพิ่มรายการไม่สำเร็จ");
  return res.json();
}

export async function FetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${API_BASE}/laundry-check/orders`);
  if (!res.ok) throw new Error("โหลดรายการออเดอร์ไม่สำเร็จ");
  return res.json();
}

export async function FetchOrderDetail(orderId: number): Promise<OrderDetail> {
  const res = await fetch(`${API_BASE}/laundry-check/orders/${orderId}`);
  if (!res.ok) throw new Error("โหลดรายละเอียดออเดอร์ไม่สำเร็จ");
  return res.json();
}
