// src/pages/complaint/complaintReply.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Search, Mail, Eye, Send, Loader2 } from "lucide-react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const EMP_ID = 1;

type Status = "new" | "in_progress" | "resolved";
type Priority = "low" | "medium" | "high";

type ComplaintRow = {
  id: string;
  orderId?: string;
  customerName: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: Status;
  priority: Priority;
};

type ReplyItem = { at: string; by: string; text: string };
type ComplaintDetail = ComplaintRow & { history: ReplyItem[] };

const thStatus: Record<Status, string> = {
  new: "ใหม่",
  in_progress: "กำลังดำเนินการ",
  resolved: "ปิดงานแล้ว",
};

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s} วินาทีที่แล้ว`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} นาทีที่แล้ว`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ชม.ที่แล้ว`;
  const d = Math.floor(h / 24);
  return `${d} วันที่แล้ว`;
}

async function apiListComplaints(params: {
  q?: string; status?: "all" | Status; page?: number; pageSize?: number;
}): Promise<{ items: ComplaintRow[]; total: number; page: number; pageSize: number }> {
  const url = new URL("/employee/complaints", API_BASE);
  if (params.q) url.searchParams.set("q", params.q);
  url.searchParams.set("status", params.status ?? "all");
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("pageSize", String(params.pageSize ?? 8));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("โหลดรายการคำร้องเรียนไม่สำเร็จ");
  return res.json();
}

async function apiGetComplaintDetail(publicId: string): Promise<ComplaintDetail> {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}`);
  if (!res.ok) throw new Error("โหลดรายละเอียดคำร้องเรียนไม่สำเร็จ");
  return res.json();
}

async function apiAddReply(publicId: string, text: string, newStatus?: Status) {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empId: EMP_ID, text, newStatus: newStatus ?? null }),
  });
  if (!res.ok) throw new Error("บันทึกการตอบกลับไม่สำเร็จ");
  return res.json() as Promise<{ ok: true; reply: ReplyItem }>;
}

async function apiSetStatus(publicId: string, status: Status) {
  const res = await fetch(`${API_BASE}/employee/complaints/${publicId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("อัปเดตสถานะไม่สำเร็จ");
  return res.json() as Promise<{ ok: true }>;
}

function ReplyDrawer({
  open, onClose, item, onStatusChanged,
}: {
  open: boolean; onClose: () => void; item: ComplaintRow | null;
  onStatusChanged?: (s: Status) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ComplaintDetail | null>(null);
  const [text, setText] = useState("");
  const [chooseStatus, setChooseStatus] = useState<Status | "">("");

  useEffect(() => {
    let on = true;
    if (open && item) {
      setLoading(true);
      apiGetComplaintDetail(item.id)
        .then((d) => { if (on) setDetail(d); })
        .finally(() => setLoading(false));
    } else {
      setDetail(null); setText(""); setChooseStatus("");
    }
    return () => { on = false; };
  }, [open, item]);

  if (!open || !item) return null;

  const send = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      await apiAddReply(item.id, text.trim(), chooseStatus || undefined);
      setText("");
      if (chooseStatus) onStatusChanged?.(chooseStatus);
      const d = await apiGetComplaintDetail(item.id);
      setDetail(d);
      setChooseStatus("");
    } catch {
      alert("บันทึกการตอบกลับไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="text-2xl font-semibold">ตอบกลับข้อร้องเรียน</div>
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50">ปิด</button>
        </div>

        <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
          {loading && !detail ? (
            <div className="text-gray-500 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> กำลังโหลด…
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-sm text-gray-500">หมายเลข</div>
                  <div className="font-medium">{detail.id}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-sm text-gray-500">ลูกค้า</div>
                  <div className="font-medium">{detail.customerName}</div>
                </div>
                <div className="rounded-xl border p-3 md:col-span-2">
                  <div className="text-sm text-gray-500">หัวข้อ</div>
                  <div className="font-medium">{detail.subject}</div>
                  <div className="text-gray-600 mt-1">{detail.message}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 font-medium">พิมพ์ข้อความตอบกลับ</div>
                <textarea
                  value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="พิมพ์ข้อความถึงลูกค้า…"
                  className="w-full min-h-[120px] rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={chooseStatus}
                    onChange={(e) => setChooseStatus((e.target.value as Status) || "")}
                    className="rounded-lg border px-3 py-2"
                  >
                    <option value="">ไม่เปลี่ยนสถานะ</option>
                    <option value="new">ใหม่</option>
                    <option value="in_progress">กำลังดำเนินการ</option>
                    <option value="resolved">ปิดงานแล้ว</option>
                  </select>
                  <button
                    onClick={send}
                    disabled={loading || !text.trim()}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    {loading ? "กำลังส่ง..." : "ส่งตอบกลับ"}
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 font-medium">ประวัติการตอบกลับ</div>
                {detail.history?.length ? (
                  <ul className="space-y-3">
                    {detail.history.map((r, i) => (
                      <li key={i} className="rounded-xl border p-3">
                        <div className="text-gray-500 text-sm">{r.by} • {timeAgo(r.at)}</div>
                        <div className="text-gray-900 whitespace-pre-line mt-1">{r.text}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-500">ยังไม่มีการตอบกลับ</div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function ComplaintReplyPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [items, setItems] = useState<ComplaintRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<ComplaintRow | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let on = true;
    setLoading(true);
    apiListComplaints({ q: query, status, page, pageSize })
      .then((d) => { if (on) { setItems(d.items); setTotal(d.total); } })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { on = false; };
  }, [query, status, page]);

  const openReply = (row: ComplaintRow) => { setSelected(row); setDrawerOpen(true); };
  const updateRowStatus = (s: Status) => {
    if (!selected) return;
    setItems(prev => prev.map(x => x.id === selected.id ? { ...x, status: s } : x));
    setSelected(p => p ? { ...p, status: s } : p);
  };

  return (
    <EmployeeSidebar>
      <div className="w-full max-w-7xl xl:max-w-none px-4 md:px-6 lg:px-8 py-6">
        <div className="text-3xl font-semibold text-gray-900">จัดการคำร้องเรียน</div>

        <div className="mt-4 flex items-center gap-3 justify-end">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="ค้นหา: หัวข้อ/ชื่อผู้ลูกค้า/เลขออเดอร์…"
              className="pl-10 pr-3 py-2 rounded-xl border w-80 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as any); setPage(1); }}
            className="rounded-xl border px-3 py-2"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="new">ใหม่</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="resolved">ปิดงานแล้ว</option>
          </select>
        </div>

        <div className=" mt-4 rounded-xl border overflow-hidden">
          {/* ✅ FIX: ใช้ underscore แทน comma ใน arbitrary grid */}
          <div className="grid grid-cols-[140px_1fr_170px_150px_110px_140px_220px] gap-3 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600">
            <div>หมายเลข</div>
            <div>หัวข้อ</div>
            <div>ลูกค้า</div>
            <div>สถานะ</div>
            <div className="text-center">ความสำคัญ</div>
            <div>สร้างเมื่อ</div>
            <div className="text-right">การดำเนินการ</div>
          </div>

          {loading ? (
            <div className="p-8 text-gray-500 flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> กำลังโหลดข้อมูล…
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-gray-500">ยังไม่มีคำร้องเรียน</div>
          ) : (
            <ul>
              {items.map((row) => (
                // ✅ FIX: แถวก็ต้องใช้ underscore เช่นกัน
                <li key={row.id} className="grid grid-cols-[140px_1fr_170px_150px_110px_140px_220px] gap-3 px-4 py-4 border-t items-start">
                  <div className="font-medium">{row.id}</div>

                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{row.subject}</div>
                    <div className="text-gray-500 text-sm truncate">{row.message}</div>
                  </div>

                  <div className="text-gray-900 line-clamp-1 min-w-0 truncate">{row.customerName}</div>

                  <div>
                    {row.status === "new" && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                        <span className="mr-1.5 inline-block size-2 rounded-full bg-blue-500" />
                        ใหม่
                      </span>
                    )}
                    {row.status === "in_progress" && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                        <span className="mr-1.5 inline-block size-2 rounded-full bg-amber-500" />
                        กำลังดำเนินการ
                      </span>
                    )}
                    {row.status === "resolved" && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <span className="mr-1.5 inline-block size-2 rounded-full bg-emerald-500" />
                        ปิดงานแล้ว
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        row.priority === "high" ? "bg-red-500" : row.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                      }`}
                    />
                  </div>

                  <div className="text-gray-700">{timeAgo(row.createdAt)}</div>

                  {/* ปุ่มไอคอนบน/ข้อความล่าง */}
                  <div className="flex items-center justify-end">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="w-[72px] h-[56px] rounded-xl border text-center text-sm leading-4 hover:bg-gray-50 grid place-items-center"
                        title="อีเมล"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="block mt-1">อีเมล</span>
                      </button>

                      <button
                        type="button"
                        className="w-[72px] h-[56px] rounded-xl border text-center text-sm leading-4 hover:bg-gray-50 grid place-items-center"
                        title="ดู"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="block mt-1">ดู</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReply(row)}
                        className="w-[90px] h-[56px] rounded-xl bg-blue-600 text-white text-center text-sm leading-4 hover:bg-blue-700 grid place-items-center"
                        title="ตอบกลับ"
                      >
                        <Send className="w-4 h-4" />
                        <span className="block mt-1">ตอบกลับ</span>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-3 text-gray-600">ทั้งหมด {total.toLocaleString()} รายการ</div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
          >
            ก่อนหน้า
          </button>
          <div>หน้า {page} / {totalPages}</div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
          >
            ถัดไป
          </button>
        </div>
      </div>

      <ReplyDrawer
        open={drawerOpen}
        item={selected}
        onClose={() => setDrawerOpen(false)}
        onStatusChanged={(s) => updateRowStatus(s)}
      />
    </EmployeeSidebar>
  );
}
