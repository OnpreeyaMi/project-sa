import React, { useMemo, useRef, useState } from "react";
import { Send, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";

export type NewComplaintPayload = {
  customerName: string; // ใช้แสดงเฉย ๆ ฝั่ง backend ไม่ได้อ่าน
  email?: string;
  orderId?: string;
  subject: string;      // จะ map -> title
  message: string;      // จะ map -> description
  attachments?: File[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function CustomerComplaintPage() {
  const currentCustomerId =  2; // TODO: เปลี่ยนเป็น id จริงของลูกค้าที่ล็อกอิน
  const [form, setForm] = useState<NewComplaintPayload>({
    customerName: "",
    email: "",
    orderId: "",
    subject: "",
    message: "",
    attachments: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const isValid = useMemo(() => {
    return (
      form.subject.trim().length > 3 &&
      form.message.trim().length > 5
    );
  }, [form]);

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm((f) => ({ ...f, attachments: [...(f.attachments || []), ...files].slice(0, 5) }));
  };

  const removeFile = (idx: number) => {
    setForm((f) => ({ ...f, attachments: (f.attachments || []).filter((_, i) => i !== idx) }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const fd = new FormData();
      // map ให้ตรง backend controller
      fd.append("title", form.subject);          // << map จาก subject
      fd.append("description", form.message);       // << map จาก message
      if (currentCustomerId > 0) fd.append("customerId", String(currentCustomerId));
    
      if (form.email)  fd.append("email", form.email);
      if (form.orderId) fd.append("orderId", form.orderId);
      (form.attachments || []).forEach((f) => fd.append("attachments", f, f.name));

      const res = await fetch(`${API_BASE}/complaints`, {
        method: "POST",
        body: fd,
        
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = await res.json();

      setSuccessId(data.id || "");
      setSubmitting(false);
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
      setSubmitting(false);
      setErrorMsg(err?.message || "ไม่สามารถส่งคำร้องเรียนได้ กรุณาลองใหม่อีกครั้ง");
    }
  }

  const charCount = form.message.length;
  const charMax = 2000;

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
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="ชื่อ-นามสกุล"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xl font-medium text-gray-700">อีเมล</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="#123456"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                />
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
                <div className="mt-1 text-xs text-gray-500">{charCount}/{charMax} ตัวอักษร</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">แนบไฟล์ (ไม่เกิน 5 ไฟล์)</label>
                <div className="mt-1 flex items-center gap-2">
                  <input ref={fileRef} type="file" multiple onChange={onPickFiles} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50">
                    <Upload className="size-4" /> เลือกไฟล์
                  </button>
                  <span className="text-xs text-gray-500">รองรับภาพ/เอกสาร (รวมไม่ควรเกิน ~10MB)</span>
                </div>
                {form.attachments && form.attachments.length > 0 && (
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {form.attachments.map((f, idx) => (
                      <li key={idx} className="border rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                        <span className="truncate mr-2">{f.name}</span>
                        <button type="button" onClick={() => removeFile(idx)} className="p-1 rounded hover:bg-gray-100" aria-label="remove">
                          <X className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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