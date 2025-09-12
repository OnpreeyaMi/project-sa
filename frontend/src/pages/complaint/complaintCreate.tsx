import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import { useUser } from "../../hooks/UserContext";

type OrderOption = {
  id: number;
  code?: string; // เช่น ORD-2025-0001 หรือ publicId
  status?: string;
  total?: number;
  createdAt?: string;
};

export type NewComplaintPayload = {
  customerName: string; // แสดงเฉย ๆ
  email?: string;
  orderId?: string; // -> string เพื่อส่ง FormData ง่าย
  subject: string; // -> title
  message: string; // -> description
  attachments?: File[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function CustomerComplaintPage() {
  const { user } = useUser();

  const [form, setForm] = useState<NewComplaintPayload>({
    customerName: "",
    email: "",
    orderId: "",
    subject: "",
    message: "",
    attachments: [],
  });
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ---- หา customerId จาก Context (fallback localStorage) ----
  const customerId: number = (() => {
    if (user?.customer?.id) return user.customer.id;
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      return stored?.customer?.id ?? 0;
    } catch {
      return 0;
    }
  })();

  // helper: แปลงรายการออเดอร์จาก API เป็น OrderOption[]
  const mapOrders = (raw: any[]): OrderOption[] =>
    (raw || []).map((o: any) => ({
      id: o.id ?? o.ID,
      code: o.code ?? o.publicId ?? o.PublicID,
      status: o.status ?? o.Status,
      total: o.total_amount ?? o.TotalAmount ?? o.total ?? o.Total,
      createdAt: o.created_at ?? o.CreatedAt,
    }));

  // ---- โหลดข้อมูลลูกค้า + ออเดอร์ทั้งหมด (ไม่ auto-select) ----
  useEffect(() => {
    async function fetchCustomerAndOrders() {
      if (!customerId) return;

      try {
        // 1) ดึงโปรไฟล์ลูกค้า
        const res = await fetch(`${API_BASE}/customers/${customerId}`, {
          headers: { Authorization: user?.token ? `Bearer ${user.token}` : "" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // เติมชื่อ/อีเมล
        const first =
          data?.FirstName ??
          data?.firstName ??
          data?.User?.Name?.split(" ")?.[0] ??
          "";
        const last =
          data?.LastName ??
          data?.lastName ??
          (data?.User?.Name ? data.User.Name.split(" ").slice(1).join(" ") : "") ??
          "";
        const email = data?.User?.Email ?? data?.email ?? "";

        setForm((f) => ({
          ...f,
          customerName: `${first} ${last}`.trim(),
          email,
        }));

        // 2) ใช้ orders จาก response นี้ก่อน (รองรับทั้ง orders/Orders)
        let list: OrderOption[] = [];
        if (Array.isArray(data?.orders) || Array.isArray(data?.Orders)) {
          list = mapOrders(data.orders ?? data.Orders ?? []);
        } else {
          // 3) fallback: ไป endpoint /customers/:id/orders
          const r2 = await fetch(`${API_BASE}/customers/${customerId}/orders`, {
            headers: { Authorization: user?.token ? `Bearer ${user.token}` : "" },
          });
          if (r2.ok) {
            const arr: any[] = await r2.json();
            list = mapOrders(arr);
          }
        }

        // เรียงล่าสุดก่อน (กันกรณี backend ไม่เรียง)
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        setOrders(list);
      } catch (err) {
        console.error("fetch customer/orders failed", err);
        setErrorMsg("โหลดข้อมูลลูกค้า/ออเดอร์ไม่สำเร็จ");
      }
    }

    fetchCustomerAndOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId, user?.token]);

  // ---- validation ----
  const isValid = useMemo(
    () => form.subject.trim().length > 3 && form.message.trim().length > 5,
    [form]
  );

  // ---- file handlers ----
  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm((f) => ({
      ...f,
      attachments: [...(f.attachments || []), ...files].slice(0, 5),
    }));
  };

  const removeFile = (idx: number) => {
    setForm((f) => ({
      ...f,
      attachments: (f.attachments || []).filter((_, i) => i !== idx),
    }));
  };

  // ---- helper: อัปโหลดแนบไฟล์ทั้งหมด (คำขอเดียว) ----
  async function uploadAttachments(apiBase: string, publicId: string, files: File[]) {
    const fd = new FormData();
    for (const f of files) fd.append("attachments", f, f.name);

    const res = await fetch(`${apiBase}/complaints/${encodeURIComponent(publicId)}/attachments`, {
      method: "POST",
      body: fd,
      // อย่าตั้ง Content-Type เอง ให้ browser ใส่ boundary ให้อัตโนมัติ
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(t || `อัปโหลดไฟล์แนบไม่สำเร็จ (ขั้นตอนที่ 2)`);
    }

    return res.json(); // { publicId, attachments: [...] }
  }

  // ---- submit: ยิง 2 คำขอต่อเนื่อง ----
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    if (!customerId) {
      setErrorMsg("ไม่พบรหัสลูกค้า กรุณาเข้าสู่ระบบอีกครั้ง");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // ------- คำขอที่ 1: สร้าง Complaint (ไม่ส่งไฟล์) -------
      const fd1 = new FormData();
      fd1.append("title", form.subject.trim());
      fd1.append("description", form.message.trim());
      fd1.append("customerId", String(customerId));
      if (form.email) fd1.append("email", form.email);
      if (form.orderId) fd1.append("orderId", form.orderId);

      const res1 = await fetch(`${API_BASE}/complaints`, {
        method: "POST",
        body: fd1,
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : "" },
      });
      if (!res1.ok) {
        const t = await res1.text();
        throw new Error(t || `สร้างคำร้องเรียนไม่สำเร็จ (ขั้นตอนที่ 1)`);
      }
      const data1 = await res1.json();
      const publicId: string = data1.id || data1.publicId;
      if (!publicId) throw new Error("ไม่พบหมายเลขอ้างอิงคำร้องเรียน (publicId)");

      // ------- คำขอที่ 2: อัปโหลดไฟล์แนบ (ถ้ามี) -------
      if (form.attachments && form.attachments.length > 0) {
        await uploadAttachments(API_BASE, publicId, form.attachments);
      }

      // สำเร็จทั้งหมด
      setSuccessId(publicId);
      setForm({
        customerName: "",
        email: "",
        orderId: "",
        subject: "",
        message: "",
        attachments: [],
      });
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      // แสดงข้อความ error ที่อ่านง่าย
      setErrorMsg(
        err?.message ||
          "ไม่สามารถส่งคำร้องเรียนได้ กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const charCount = form.message.length;
  const charMax = 2000;

  // label dropdown ออเดอร์
  const renderOrderLabel = (o: OrderOption) =>
    `${o.code || "#" + o.id}${o.status ? " • " + o.status : ""}${
      o.createdAt ? " • " + new Date(o.createdAt).toLocaleString() : ""
    }`;

  return (
    <CustomerSidebar>
      <div className="min-h-[90vh] bg-white">
        <div className="px-4 md:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-semibold text-gray-900">แจ้งข้อร้องเรียน</h1>
          <p className="text-xl mt-2 text-gray-600">
            โปรดกรอกรายละเอียดให้ครบถ้วน ทีมงานจะตรวจสอบและตอบกลับโดยเร็ว
          </p>

          {successId && (
            <div className="mt-6 rounded-2xl border bg-emerald-50 text-emerald-800 p-4 flex items-start gap-3">
              <CheckCircle2 className="size-5 mt-0.5" />
              <div>
                <div className="font-medium">ส่งคำร้องเรียนเรียบร้อยแล้ว</div>
                <div className="text-sm">
                  หมายเลขอ้างอิง: <span className="font-semibold">{successId}</span>
                </div>
              </div>
            </div>
          )}
          {errorMsg && (
            <div className="mt-6 rounded-2xl border bg-red-50 text-red-700 p-4 flex items-start gap-3">
              <AlertCircle className="size-5 mt-0.5" />
              <div>
                <div className="font-medium">เกิดข้อผิดพลาด</div>
                <div className="text-sm">{errorMsg}</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xl font-medium text-gray-700">ชื่อลูกค้า *</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="ชื่อ-นามสกุล"
                  value={form.customerName}
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div>
                <label className="block text-xl font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                  placeholder="you@example.com"
                  value={form.email}
                  readOnly
                  tabIndex={-1}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xl font-medium text-gray-700">หัวข้อ *</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="เช่น ชำระเงินแล้วแต่สถานะยังไม่อัปเดต"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xl font-medium text-gray-700">เลขคำสั่งซื้อ</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                >
                  <option value="">— เลือกออเดอร์ —</option>
                  {orders.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      {renderOrderLabel(o)}
                    </option>
                  ))}
                </select>
                {!orders.length && (
                  <div className="mt-1 text-xs text-gray-500">
                    ไม่พบออเดอร์ในระบบ คุณยังสามารถส่งคำร้องเรียนโดยไม่ระบุเลขคำสั่งซื้อได้
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xl font-medium text-gray-700">รายละเอียด *</label>
                <textarea
                  rows={6}
                  maxLength={charMax}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="บอกรายละเอียดปัญหา แนบข้อมูลสำคัญ เช่น เวลา เหตุการณ์ เลขอ้างอิง ฯลฯ"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
                <div className="mt-1 text-xs text-gray-500">
                  {charCount}/{charMax} ตัวอักษร
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                แนบไฟล์ (ไม่เกิน 5 ไฟล์; แนะนำรวมไม่เกิน ~10MB)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <input ref={fileRef} type="file" multiple onChange={onPickFiles} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50"
                >
                  <Upload className="size-4" /> เลือกไฟล์
                </button>
                <span className="text-xs text-gray-500">รองรับ .png .jpg .jpeg .webp .pdf</span>
              </div>
              {form.attachments?.length ? (
                <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {form.attachments.map((f, idx) => (
                    <li key={idx} className="border rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                      <span className="truncate mr-2">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded hover:bg-gray-100"
                        aria-label="remove"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={!isValid || submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 hover:bg-blue-700 disabled:opacity-60"
              >
                <Send className="size-4" /> {submitting ? "กำลังส่ง..." : "ส่งคำร้องเรียน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CustomerSidebar>
  );
}
