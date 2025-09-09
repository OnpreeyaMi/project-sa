// src/api/complaints.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type ComplaintItem = {
  id: string;            // PublicID เช่น "CMP-2025..."
  orderId?: string;      // "#854201"
  customerName: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;     // ISO
  status: "new" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
};

export type ReplyItem = { at: string; by: string; text: string; };

export async function listComplaints(params: {
  q?: string; status?: "all" | "new" | "in_progress" | "resolved";
  page?: number; pageSize?: number;
}) {
  const url = new URL("/employee/complaints", API_BASE);
  if (params.q) url.searchParams.set("q", params.q);
  url.searchParams.set("status", params.status ?? "all");
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("pageSize", String(params.pageSize ?? 8));
  const res = await fetch(url);
  if (!res.ok) throw new Error("โหลดรายการคำร้องเรียนไม่สำเร็จ");
  return res.json() as Promise<{ items: ComplaintItem[]; total: number; page: number; pageSize: number }>;
}

export async function getComplaintDetail(publicId: string) {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}`);
  if (!res.ok) throw new Error("โหลดรายละเอียดคำร้องเรียนไม่สำเร็จ");
  return res.json() as Promise<{
    id: string; orderId?: string; customerName: string; email?: string;
    subject: string; message: string; createdAt: string;
    status: ComplaintItem["status"]; priority: ComplaintItem["priority"];
    history: ReplyItem[];
  }>;
}

export async function addReply(publicId: string, payload: {
  empId: number; text: string; newStatus?: "new"|"in_progress"|"resolved";
}) {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      empId: payload.empId,
      text: payload.text,
      newStatus: payload.newStatus ?? null
    }),
  });
  if (!res.ok) throw new Error("บันทึกการตอบกลับไม่สำเร็จ");
  return res.json() as Promise<{ ok: true; reply: ReplyItem }>;
}

export async function setStatus(publicId: string, status: "new"|"in_progress"|"resolved") {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
  return res.json() as Promise<{ ok: true }>;
}
