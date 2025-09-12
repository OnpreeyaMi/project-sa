

import axios from "axios";

const custApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

custApi.interceptors.request.use((config) => {
  const t = localStorage.getItem("cust_token"); // ⬅️ โทเค็นลูกค้า
  if (t) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

export const OrderService = {
  // ใช้โทเค็นลูกค้า (มีเคลม customer_id) ให้ตรงกับคอนโทรลเลอร์
  async getLatest(): Promise<number> {
    const r = await custApi.get("/orders/latest");
    return r.data?.orderId ?? 0;
  },

  // ถ้าจำเป็นต้อง fallback (ไม่มีโทเค็นลูกค้า แต่อยากดึงของลูกค้าคนหนึ่ง):
  async getLatestByCustomerId(customerId: number): Promise<number> {
    const r = await axios.get(
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + `/orders/latest`,
      { params: { customerId } } // controller รองรับ fallback query นี้
    );
    return r.data?.orderId ?? 0;
  },
};