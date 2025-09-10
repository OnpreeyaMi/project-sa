import type {
  ClothType,
  ServiceType,
  UpsertLaundryCheckInput,
  OrderDetail,
  HistoryEntry,
  OrderSummary,
} from "../interfaces/LaundryCheck/types";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:8000";

// ===== Lookups =====
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
export async function FetchCustomers(): Promise<
  { ID: number; Name: string; Phone: string; AddressID?: number; Address?: string; Note?: string }[]
> {
  const res = await fetch(`${API_BASE}/laundry-check/customers`);
  if (!res.ok) throw new Error("โหลดลูกค้าไม่สำเร็จ");
  return res.json();
}

// ===== พนักงาน =====
export async function UpsertLaundryCheck(orderId: number, payload: UpsertLaundryCheckInput): Promise<{ OrderID: number }> {
  const res = await fetch(`${API_BASE}/laundry-checks/${orderId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> "");
    throw new Error(t || "บันทึกออเดอร์ไม่สำเร็จ");
  }
  return res.json();
}

export async function UpdateSortedItem(
  orderId: number,
  itemId: number,
  payload: Partial<{ ClothTypeName: string; ServiceTypeID: number; Quantity: number }>
): Promise<void> {
  const res = await fetch(`${API_BASE}/laundry-checks/${orderId}/items/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> "");
    throw new Error(t || "อัปเดตรายการไม่สำเร็จ");
  }
}

export async function DeleteSortedItem(orderId: number, itemId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/laundry-checks/${orderId}/items/${itemId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const t = await res.text().catch(()=> "");
    throw new Error(t || "ลบรายการไม่สำเร็จ");
  }
}

export async function FetchOrderDetail(orderId: number): Promise<OrderDetail> {
  const res = await fetch(`${API_BASE}/laundry-check/orders/${orderId}`);
  if (!res.ok) throw new Error("โหลดรายละเอียดออเดอร์ไม่สำเร็จ");
  return res.json();
}
export async function FetchOrderHistory(orderId: number): Promise<HistoryEntry[]> {
  const res = await fetch(`${API_BASE}/laundry-check/orders/${orderId}/history`);
  if (!res.ok) throw new Error("โหลดประวัติไม่สำเร็จ");
  return res.json();
}
export async function FetchOrders(): Promise<OrderSummary[]> {
  const res = await fetch(`${API_BASE}/laundry-check/orders`);
  if (!res.ok) throw new Error("โหลดรายการออเดอร์ไม่สำเร็จ");
  return res.json();
}
