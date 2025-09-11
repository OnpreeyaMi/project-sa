import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";


// ---------- Utilities ----------
const toBaht = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

/**
 * EMVCo PromptPay + CRC16-CCITT (0x1021)
 * รองรับ: เบอร์มือถือ 10 หลัก / เลขบัตรปชช. 13 หลัก / e-Wallet 15 หลัก
 */
function generatePromptPayPayload(target: string, amount?: number) {
  const normalizePhone = (msisdn: string) => {
    const digits = msisdn.replace(/\D/g, "");
    if (digits.length === 10 && digits.startsWith("0")) {
      // ถ้าอ่าน QR ไม่ได้ ลองเปลี่ยนเป็น "66" แทน "0066"
      return "0066" + digits.substring(1);
    }
    return digits;
  };

  const formatTLV = (id: string, value: string) => id + value.length.toString().padStart(2, "0") + value;

  const merchantAccountInfo = (() => {
    const AID_PROMPTPAY = formatTLV("00", "A000000677010111");
    const digits = target.replace(/\D/g, "");
    const isPhone = /^\d{10}$/.test(digits);
    const isCitizenId = /^\d{13}$/.test(digits);
    const isEW = /^\d{15}$/.test(digits);

    let subId = "";
    if (isPhone)      subId = formatTLV("01", normalizePhone(digits));
    else if (isCitizenId) subId = formatTLV("02", digits);
    else if (isEW)        subId = formatTLV("03", digits);
    else throw new Error("รูปแบบ PromptPay target ไม่ถูกต้อง");

    return formatTLV("29", AID_PROMPTPAY + subId);
  })();

  const payloadNoCRC =
    formatTLV("00", "01") +               // Payload Format
    formatTLV("01", amount ? "12" : "11") + // POI Method
    merchantAccountInfo +
    formatTLV("58", "TH") +               // Country
    formatTLV("53", "764") +              // Currency THB
    (amount !== undefined ? formatTLV("54", amount.toFixed(2)) : "") +
    "63" + "04"; // CRC placeholder

  // CRC16-CCITT
  const crc = (() => {
    let crc = 0xffff;
    for (let i = 0; i < payloadNoCRC.length; i++) {
      crc ^= payloadNoCRC.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021; else crc <<= 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  })();

  return payloadNoCRC + crc;
}

// ---------- Component ----------
type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;

  /** เบอร์/เลขปชช./e-Wallet */
  promptPayTarget: string;
  /** ยอดรวมออร์เดอร์ (บาท) */
  amountTHB: number;
  /** หมายเลขออร์เดอร์ */
  orderId: string | number;
  /** อายุ QR (วินาที) — default 600s */
  durationSec?: number;

  /** callback เมื่อกด “ทดลองการจ่ายเงิน” (simulate) */
  onSimulatePay?: (payload: string) => void;


  /** callback เมื่อยืนยันสลิปผ่าน EasySlip สำเร็จ */
  onVerified?: (resp: { transRef: string; date: string; amount: number }) => void;

  
  
};

  const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, promptPayTarget, amountTHB, orderId, durationSec = 600, onVerified }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [paid, setPaid] = useState(false);
  const timerRef = useRef<number | null>(null);
  // ====== อัปโหลดสลิป (Base64) + เรียก backend ตรวจ EasySlip ======
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // ชี้ไปที่ backend จริง (ปรับให้ตรงกับพอร์ตของคุณ)
  
  const RAW_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const BASE = RAW_BASE.replace(/\/+$/, "");   // กันกรณีมี / ท้าย
  const VERIFY_URL = `${BASE}/verify-slip-base64`;
  

 

  async function fileToBase64NoPrefix(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    let bstr = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bstr += String.fromCharCode(bytes[i]);
    return btoa(bstr);
  }

  const handlePickFile = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("ไฟล์ต้องเป็นรูปภาพ (.jpg/.png)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("ไฟล์มีขนาดเกิน 5MB");
      return;
    }

    setErrorMsg(null);
    setUploading(true);
    try {
      const b64 = await fileToBase64NoPrefix(file);

      // หยุดนาฬิกาชั่วคราวระหว่างตรวจ
      if (timerRef.current) window.clearInterval(timerRef.current);
      
      const res = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: b64,
          orderId: orderId,
          amount: amountTHB,
        }),

      });


      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || text || `HTTP ${res.status}`;
        throw new Error(String(msg));
      }

      setPaid(true);
      onVerified?.({
        transRef: data?.transRef ?? "",
        date: data?.date ?? new Date().toISOString(),
        amount: data?.amount ?? amountTHB,
      });
      // ปิด modal เล็กน้อยหลังแสดงผล
      window.setTimeout(() => onClose(), 1000);
    } catch (err: any) {
      setErrorMsg(err?.message || "มีข้อผิดพลาดระหว่างตรวจสลิป");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };


  // เริ่ม/รีเซ็ตตัวจับเวลาเมื่อเปิด
  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(durationSec);
    setPaid(false);

    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          onClose(); // หมดเวลา => ปิด
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isOpen, durationSec, onClose]);

  // payload ใช้ค่าจาก props (เลิก hardcode)
  const payload = useMemo(
    () => generatePromptPayPayload(promptPayTarget, amountTHB),
    [promptPayTarget, amountTHB]
  );

  if (!isOpen) return null;

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const progress = ((durationSec - secondsLeft) / durationSec) * 100;

  

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">ชำระเงินด้วยพร้อมเพย์</h2>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
            aria-label="close"
          >
            ปิด
          </button>
        </div>

        <div className="mb-2 text-sm text-gray-500">เลขที่ออร์เดอร์: {String(orderId)}</div>
        <div className="mb-4">
          <div className="text-3xl font-semibold">{toBaht(amountTHB)}</div>
          <div className="text-xs text-gray-500">ยอดถูกล็อกไว้ใน QR (แก้ไขไม่ได้)</div>
        </div>

        <div className="mx-auto mb-4 flex w-full flex-col items-center">
          <div className={`rounded-2xl p-6 ${paid ? "bg-green-600" : "bg-[#165DFF]"}`}>
            <QRCodeCanvas value={payload} size={220} includeMargin />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            {paid ? "ชำระเงินสำเร็จ (โหมดทดสอบ)" : "สแกนด้วยแอปธนาคาร/พร้อมเพย์ เพื่อชำระเงิน"}
          </div>
        </div>

        {/* แถบเวลา */}
        <div className="mb-3">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-center text-sm">
            เวลาที่เหลือ: <span className="font-semibold">{mm}:{ss}</span> (ปิดอัตโนมัติเมื่อครบ)
          </div>
        </div>

        {/* ปุ่ม “ทดลองการจ่ายเงิน” */}
        <div className="mt-5 flex items-center justify-center gap-3">
          

          {/* อัปโหลดสลิปเพื่อตรวจจริง */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            capture="environment"
          />
          <button
            onClick={handlePickFile}
            disabled={uploading || paid}
            className={`rounded-xl px-4 py-2 font-medium shadow ${
              uploading || paid ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            title="อัปโหลดรูปสลิปจากกล้อง/แกลเลอรี"
          >
            {uploading ? "กำลังตรวจสลิป..." : "แนบสลิปเพื่อยืนยัน"}
          </button>

          
        </div>

        {/* error */}
        {errorMsg && <div className="mt-3 text-center text-sm text-red-600">{errorMsg}</div>}

      </div>
    </div>
  );
};

export default PaymentModal;

