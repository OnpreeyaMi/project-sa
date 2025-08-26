import React, { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

// ---------- Utilities ----------
const toBaht = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

/**
 * สร้าง Payload PromptPay ตาม EMVCo พร้อม CRC16-CCITT (0x1021)
 * รองรับ target เป็นหมายเลขโทรศัพท์ (10 หลัก), e-Wallet ID (15 หลัก), หรือหมายเลขพร้อมเพย์ (13 หลัก/เลขบัตรประชาชน)
 * amount เป็นหน่วยบาท (ทศนิยมได้ 2 ตำแหน่ง)
 */
function generatePromptPayPayload(target: string, amount?: number) {
  // ปรับหมายเลขโทรศัพท์ให้เป็นรูปแบบประเทศ (เช่น 0812345678 -> 66812345678)
  const normalizePhone = (msisdn: string) => {
    const digits = msisdn.replace(/\D/g, "");
    if (digits.length === 10 && digits.startsWith("0")) {
      return "0066" + digits.substring(1);  // <-- เปลี่ยนเป็น 0066
    }
    return digits;
  };

  // IDs ตามมาตรฐาน
  const ID_PAYLOAD_FORMAT = "00";
  const ID_POI_METHOD = "01";
  const ID_MERCHANT_INFO = "29";
  const ID_AID = "00";
  const ID_MERCHANT_ACCOUNT = "01";
  const ID_COUNTRY_CODE = "58";
  const ID_CURRENCY = "53";
  const ID_AMOUNT = "54";
  const ID_CRC = "63";

  const formatTLV = (id: string, value: string) =>
    id + value.length.toString().padStart(2, "0") + value;

    const merchantAccountInfo = (() => {
    const AID_PROMPTPAY = formatTLV("00", "A000000677010111");

    const digits = target.replace(/\D/g, "");
    const isPhone = /^\d{10}$/.test(digits);
    const isCitizenId = /^\d{13}$/.test(digits);
    const isEW = /^\d{15}$/.test(digits);

    let subId = "";
    if (isPhone) {
      // ✅ เปลี่ยน sub-tag เป็น "01" สำหรับเบอร์มือถือ
      subId = formatTLV("01", normalizePhone(digits));
    } else if (isCitizenId) {
      // (ยังคง "02" สำหรับ เลขบัตรประชาชน/ภาษี ตามที่คุณใช้อยู่)
      subId = formatTLV("02", digits);
    } else if (isEW) {
      // แล้วแต่สเปกที่คุณใช้ อาจเป็น "03" สำหรับ e-Wallet ของบางไลบรารี
      subId = formatTLV("03", digits);
    } else {
      throw new Error("รูปแบบ PromptPay target ไม่ถูกต้อง");
    }
    return formatTLV("29", AID_PROMPTPAY + subId);
  })();

  // 11 = Static, 12 = Dynamic (ต้องการ “ล็อกราคา” และมีอายุ)
  const poiMethod = formatTLV(ID_POI_METHOD, amount ? "12" : "11");

  const payloadNoCRC =
    formatTLV(ID_PAYLOAD_FORMAT, "01") +
    poiMethod +
    merchantAccountInfo +
    formatTLV(ID_COUNTRY_CODE, "TH") +
    formatTLV(ID_CURRENCY, "764") + // THB
    (amount !== undefined ? formatTLV(ID_AMOUNT, amount.toFixed(2)) : "") +
    ID_CRC +
    "04"; // placeholder สำหรับ CRC

  // คำนวณ CRC16-CCITT (poly 0x1021)
  const crc = (() => {
    let crc = 0xffff;
    for (let i = 0; i < payloadNoCRC.length; i++) {
      crc ^= payloadNoCRC.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
        else crc <<= 1;
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
  /** PromptPay target: เบอร์ (เช่น 0812345678) หรือ เลขบัตร/ e-Wallet */
  promptPayTarget: string;
  /** ยอดรวมออร์เดอร์ (บาท) — “ล็อกยอด” ฝั่ง UI โดยไม่ให้แก้ไข */
  amountTHB: number;
  /** หมายเลข/รหัสออร์เดอร์ (ใช้แสดง) */
  orderId: string | number;
  /** ระยะเวลาโชว์ (วินาที) — default 600s = 10 นาที */
  durationSec?: number;
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  promptPayTarget,
  amountTHB,
  orderId,
  durationSec = 600,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(durationSec);
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timerRef.current!);
          onClose(); // หมดเวลาแล้วปิดป๊อปอัพ
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isOpen, durationSec, onClose]);

  const payload = useMemo(
    () => generatePromptPayPayload("0645067561", 1),
    [promptPayTarget, amountTHB]
  );

  if (!isOpen) return null;

  const mm = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
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
          <div className="rounded-2xl bg-[#165DFF] p-6">
            <QRCodeCanvas value={payload} size={220} includeMargin />
          </div>
          <div className="mt-3 text-sm text-gray-600">
            สแกนด้วยแอปธนาคาร/พร้อมเพย์ เพื่อชำระเงิน
          </div>
        </div>

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

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-gray-500 break-all">
            Payload: <span className="font-mono">{payload}</span>
          </div>
          <button
            className="rounded-xl bg-blue-600 px-3 py-2 text-white hover:bg-blue-500"
            onClick={() => navigator.clipboard.writeText(payload)}
          >
            คัดลอก Payload
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
