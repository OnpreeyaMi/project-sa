const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");

export async function fetchLatestOrderIdForMe(): Promise<number | null> {
  const res = await fetch(`${BASE}/orders/latest`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // ถ้า auth แบบ Bearer token:
      // Authorization: `Bearer ${token}`,
    },
    credentials: "include", // ถ้าใช้ cookie-based auth
  });
  if (res.status === 404) return null; // ยังไม่มีออเดอร์
  if (!res.ok) throw new Error(`fetch_latest_failed: ${res.status}`);
  const data = await res.json();
  return typeof data.orderId === "number" ? data.orderId : null;
}
