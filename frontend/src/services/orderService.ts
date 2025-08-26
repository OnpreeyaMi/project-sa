import type{ OrderService ,ServiceType, Detergent} from "../interfaces/types";
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
