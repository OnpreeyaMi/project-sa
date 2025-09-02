import { useEffect, useRef } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder?: () => void;
  onGoHome?: () => void;
  onContinueShopping?: () => void;

  title?: string;            // ชำระเงินสำเร็จ!
  subtitle?: string;         // ข้อความขอบคุณ
  shopName?: string;         // ชื่อร้าน/โปรไฟล์ ถ้าต้องการแสดงด้านบน (เช่น "Pham Korat")

  orderId?: string | null;   // หมายเลขคำสั่งซื้อ
  amount?: number;           // จำนวนเงิน
  currency?: string;         // THB, USD ...
  paidAt?: Date;             // วันที่สั่งซื้อ/เวลาชำระ
  statusText?: string;       // ชำระเงินแล้ว
};

function formatCurrency(amount?: number, currency = "THB") {
  if (amount == null) return "THB0";
  try {
    return new Intl.NumberFormat("th-TH", { style: "currency", currency })
      .format(amount)
      .replace(/\u00A0/g, " "); // ป้องกัน non-breaking space
  } catch {
    return `${currency}${amount}`;
  }
}

function formatDateTime(dt?: Date) {
  if (!dt) return "-";
  // 02/09/2025 02:29
  const dd = dt.toLocaleDateString("th-TH", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = dt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${dd} ${time}`;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  onViewOrder,
  onGoHome,
  onContinueShopping,

  title = "ชำระเงินสำเร็จ!",
  subtitle = "ขอบคุณสำหรับการสั่งซื้อ เราได้รับการชำระเงินเรียบร้อยแล้ว",
  shopName,
  orderId = "N/A",
  amount = 0,
  currency = "THB",
  paidAt = new Date(),
  statusText = "ชำระเงินแล้ว",
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ปิดด้วยปุ่ม ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="payment-success-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Card */}
      <div
        ref={dialogRef}
        className="relative w-[92%] max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header bar (ชื่อร้าน + ปุ่มปิด) */}
        <div className="flex items-center justify-between px-5 py-3 border-b bg-white/70 backdrop-blur">
          <div className="text-sm font-medium text-gray-800 truncate">
            {shopName ?? ""}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-6 pt-4 bg-green-50">
          {/* Success tick */}
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="h-7 w-7">
              <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Title & subtitle */}
          <h2 id="payment-success-title" className="text-center text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="mt-1 text-center text-sm text-gray-600">
            {subtitle}
          </p>

          {/* Info card */}
          <div className="mt-4 rounded-2xl bg-white shadow-sm border">
            <div className="divide-y">
              <Row label="หมายเลขคำสั่งซื้อ:" value={orderId ?? "N/A"} />
              <Row label="จำนวนเงิน:" value={formatCurrency(amount, currency)} />
              <Row label="วันที่สั่งซื้อ:" value={formatDateTime(paidAt)} />
              <Row
                label="สถานะ:"
                value={
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                    {statusText}
                  </span>
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={onViewOrder}
              className="w-full rounded-2xl border px-4 py-3 text-center font-medium hover:bg-gray-50 active:scale-[.99] transition"
            >
              ดูรายละเอียดคำสั่งซื้อ
            </button>
            <button
              onClick={onGoHome}
              className="w-full rounded-2xl bg-green-600 px-4 py-3 text-white font-semibold shadow hover:bg-green-700 active:scale-[.99] transition"
            >
              🏠 กลับหน้าหลัก
            </button>
            <button
              onClick={onContinueShopping}
              className="w-full text-gray-500 text-sm hover:text-gray-700"
            >
              🛍️ ช้อปปิ้งต่อ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
