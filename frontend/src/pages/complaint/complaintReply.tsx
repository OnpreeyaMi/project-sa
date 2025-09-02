import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Mail,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Reply,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCircle,
} from "lucide-react";

// --- Types ---
type Complaint = {
  id: string;
  orderId?: string;
  customerName: string;
  email?: string;
  subject: string;
  message: string;
  createdAt: string; // ISO
  status: "new" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
};

type ReplyItem = {
  at: string;
  by: string;
  text: string;
};

// --- Mock data ---
const MOCK: Complaint[] = [
  {
    id: "CMP-230010",
    orderId: "#854201",
    customerName: "คุณสมชาย ใจดี",
    email: "somchai@example.com",
    subject: "ชำระเงินแล้วแต่สถานะยังเป็นที่ต้องชำระ",
    message:
      "โอนผ่าน Mobile Banking เวลา 12:45 น. แนบสลิปแล้วแต่คำสั่งซื้อยังไม่อัปเดต",
    createdAt: new Date(Date.now() - 3600_000 * 2).toISOString(),
    status: "new",
    priority: "high",
  },
  {
    id: "CMP-230011",
    orderId: "#854233",
    customerName: "คุณกานดา สายชล",
    email: "kanda@example.com",
    subject: "ขอเปลี่ยนที่อยู่จัดส่ง",
    message:
      "ใส่เลขบ้านผิด อยากแก้ไขที่อยู่ก่อนส่งออกค่ะ",
    createdAt: new Date(Date.now() - 3600_000 * 7).toISOString(),
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "CMP-230012",
    customerName: "Mr. David",
    email: "david@example.com",
    subject: "สินค้าได้รับความเสียหาย",
    message:
      "ได้รับพัสดุแล้วกล่องบุบ ภายในมีรอยขีดข่วน ขอเปลี่ยนสินค้าใหม่",
    createdAt: new Date(Date.now() - 3600_000 * 24 * 2).toISOString(),
    status: "resolved",
    priority: "high",
  },
  {
    id: "CMP-230013",
    orderId: "#854299",
    customerName: "คุณบาส สุริยา",
    subject: "สอบถามการรับเงินคืน",
    message:
      "ยกเลิกออเดอร์แล้ว อยากทราบว่าจะได้เงินคืนเมื่อไหร่",
    createdAt: new Date(Date.now() - 3600_000 * 12).toISOString(),
    status: "new",
    priority: "low",
  },
];

// --- Helpers ---
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} ชม.ที่แล้ว`;
  const days = Math.round(hrs / 24);
  return `${days} วันที่แล้ว`;
}

function StatusBadge({ status }: { status: Complaint["status"] }) {
  const map = {
    new: { text: "ใหม่", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
    in_progress: {
      text: "กำลังดำเนินการ",
      cls: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    },
    resolved: {
      text: "ปิดงานแล้ว",
      cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    },
  } as const;
  const { text, cls } = map[status];
  return <span className={`px-2.5 py-1 rounded-full text-xs ${cls}`}>{text}</span>;
}

function PriorityDot({ level }: { level: Complaint["priority"] }) {
  const cls =
    level === "high"
      ? "bg-red-500"
      : level === "medium"
      ? "bg-orange-500"
      : "bg-gray-400";
  
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block size-2 rounded-full ${cls}`} />
    </div>
  );
}

// --- Reply Drawer ---
function ReplyDrawer({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: Complaint | null;
}) {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<ReplyItem[]>([]);

  if (!open || !item) return null;

  const presets = [
    "เรียนลูกค้า ได้รับเรื่องและกำลังตรวจสอบให้นะคะ จะอัปเดตให้ทราบโดยเร็วค่ะ",
    "ขออภัยในความไม่สะดวกค่ะ ได้ดำเนินการแก้ไขแล้วและจะแจ้งผลภายใน 24 ชม.",
    "เราได้ประสานงานกับขนส่งให้เปลี่ยนที่อยู่จัดส่งเรียบร้อยแล้วค่ะ",
  ];

  const send = () => {
    if (!text.trim()) return;
    const it: ReplyItem = { at: new Date().toISOString(), by: "พนักงาน A", text };
    setHistory((h) => [it, ...h]);
    setText("");
  };

  return (
    
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <UserCircle className="size-4" />
            <span className="truncate">{item.customerName}</span>
          </div>
          <h3 className="font-semibold truncate text-xl">{item.subject}</h3>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-100" onClick={onClose} aria-label="close">
          <X className="size-5" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4 overflow-y-auto">
        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            {item.status === "resolved" ? (
              <CheckCircle2 className="size-4" />
            ) : item.status === "in_progress" ? (
              <Clock className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <StatusBadge status={item.status} />
            
          </div>
          <p className="mt-2 text-xl text-gray-800 whitespace-pre-line">{item.message}</p>
          <div className="mt-2 text-xl text-gray-500">สร้างเมื่อ {timeAgo(item.createdAt)}</div>
        </div>

        {/* {history.length > 0 && (
          <div>
            <div className="mb-2 font-medium">ประวัติการตอบกลับ</div>
            <ul className="space-y-3">
              {history.map((r, i) => (
                <li key={i} className="border rounded-lg p-3">
                  <div className="text-xl text-gray-500 mb-1">{r.by} • {timeAgo(r.at)}</div>
                  <div className="text-xl text-gray-800 whitespace-pre-line">{r.text}</div>
                </li>
              ))}
            </ul>
          </div>
        )} */}

        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {presets.map((p, idx) => (
              <button key={idx} onClick={() => setText(p)} className="text-xs rounded-full border px-3 py-1 hover:bg-gray-50">
                ใช้ข้อความสำเร็จรูป {idx + 1}
              </button>
            ))}
          </div>
          <label className="block text-xl text-gray-700 mb-1">ตอบกลับลูกค้า</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="พิมพ์ข้อความที่นี่..."
            rows={5}
            className="w-full rounded-xl border px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-3 py-2 rounded-lg border hover:bg-gray-50">ปิด</button>
            <button onClick={send} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2">
              <Send className="size-4" /> ส่งตอบกลับ
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// --- Main page ---
export default function ComplaintAdminPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | Complaint["status"]>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MOCK.filter((c) => {
      const matchesQ =
        !q ||
        c.subject.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.orderId ?? "").toLowerCase().includes(q);
      const matchesS = status === "all" ? true : c.status === status;
      return matchesQ && matchesS;
    });
  }, [query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openReply = (c: Complaint) => {
    setSelected(c);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-[90vh] bg-white">
      <div className=" px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-4xl font-semibold">จัดการคำร้องเรียน</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className=" absolute left-3 top-1/2 -translate-y-1/2 size-8 text-gray-400" />
              <input
                value={query}
                onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                placeholder="ค้นหา: หัวข้อ/ชื่อลูกค้า/เลขออเดอร์..."
                className="w-72 rounded-xl border pl-11 pr-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => { setPage(1); setStatus(e.target.value as any); }}
                className="text-xl appearance-none w-44 rounded-xl border py-2 pl-3 pr-8 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="new">ใหม่</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="resolved">ปิดงานแล้ว</option>
              </select>
              <Filter className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border overflow-hidden">
          <table className="w-full text-xl">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">หมายเลข</th>
                <th className="px-4 py-3 text-left">หัวข้อ</th>
                <th className="px-4 py-3 text-left">ลูกค้า</th>
                <th className="px-4 py-3 text-left">สถานะ</th>
                <th className="px-4 py-3 text-left">ความสำคัญ</th>
                <th className="px-4 py-3 text-left">สร้างเมื่อ</th>
                <th className="px-4 py-3 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {current.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xl text-gray-700">{c.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1">{c.subject}</div>
                    <div className="text-gray-500 line-clamp-1">{c.message}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{c.customerName}</div>
                    {c.orderId && <div className="text-xs text-gray-500">ออเดอร์ {c.orderId}</div>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3"><PriorityDot level={c.priority} /></td>
                  <td className="px-4 py-3 text-gray-600">{timeAgo(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="px-3 py-1.5 rounded-lg border hover:bg-white shadow-sm bg-gray-50 text-gray-700 inline-flex items-center gap-2"
                        title="อีเมลลูกค้า"
                      >
                        <Mail className="size-4" />
                        <span className="hidden md:inline">ดูอีเมล</span>
                      </button>
                      <button
                        onClick={() => openReply(c)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 inline-flex items-center gap-2"
                        title="ตอบกลับ"
                      >
                        <Reply className="size-4" />
                        <span className="hidden md:inline">ตอบกลับ</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {current.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">ไม่พบข้อมูล</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-xl text-gray-600">
          <div>ทั้งหมด {filtered.length} รายการ</div>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded-lg border disabled:opacity-50 inline-flex items-center gap-1">
              <ChevronLeft className="size-4" /> ก่อนหน้า
            </button>
            <div>
              หน้า <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded-lg border disabled:opacity-50 inline-flex items-center gap-1">
              ถัดไป <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <ReplyDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} item={selected} />
    </div>
  );
}
