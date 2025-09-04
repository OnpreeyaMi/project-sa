// // Payment.tsx
// import "./Payment.css";
// import React, { useMemo, useState } from "react";
// import { BsQrCode, BsCashCoin } from "react-icons/bs";
// import { GiWashingMachine } from "react-icons/gi";

// import PromotionSelector, { type Promo } from "./PromotionDemo"; // ✅ นำเข้าคอมโพเนนต์
// import PaymentModal from "./PaymentModal";
// import PaymentSuccessModal from "./slipDemo";


// // utils เล็กๆ
// const toBaht = (n: number) =>
//   n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

// function computeDiscount(total: number, p?: Promo | null) {
//   if (!p) return 0;
//   if (p.minSpend && total < p.minSpend) return 0;
//   if (p.discountType === "amount") return Math.min(p.discountValue, total);
//   const cut = Math.round(total * (p.discountValue / 100) * 100) / 100;
//   return Math.min(cut, total);
// }

// export default function Payment() {
//   // เดิมของคุณ
//   const [note, setNote] = useState("");
//   const [code, setCode] = useState("");
//   const [openQR, setOpenQR] = useState(false);
//   const [openSlip, setOpenSlip] = useState(false);
//   const [paidAt, setPaidAt] = useState<Date | null>(null);
  
//   const totalAmount = 100;             // รวมก่อนหักโปร
//   const orderId = "INV-2024-000123";
//   const promptPayTarget = "0645067561";

//   // ✅ โปรโมชัน (จะดึงจาก backend ก็ได้)
//   const promotions: Promo[] = [
//     { id: "p1", code: "SAVE50", title: "ลด 50 บาท", discountType: "amount", discountValue: 50, badge: "ยอดนิยม", expiresAt: "2025-12-31" },
//     { id: "p2", code: "NEW10", title: "ลูกค้าใหม่ลด 10%", description: "ขั้นต่ำ 300 บาท", discountType: "percent", discountValue: 10, minSpend: 300, expiresAt: "2025-10-01" },
//     { id: "p3", code: "WASH25", title: "ลดเพิ่ม 25 บาท", description: "สำหรับบริการซักอบรีด", discountType: "amount", discountValue: 25 },
//   ];

//   // ✅ โปรที่เลือก
//   const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
//   const discount = useMemo(() => computeDiscount(totalAmount, selectedPromo), [totalAmount, selectedPromo]);
//   const finalTotal = useMemo(() => Math.max(0, Math.round((totalAmount - discount) * 100) / 100), [totalAmount, discount]);


//   const handleSimulatePaid = () => {
//     setOpenQR(false);
//     setPaidAt(new Date());
//     setOpenSlip(true);
//   };

//   return (
//     <div className="max-w-full mx-auto bg-white min-h-screen p-4">
//       {/* Header */}
//       <div className="flex items-center mb-4">
//         <h1 className="flex-1 text-center font-semibold">รายการชำระเงิน</h1>
//       </div>

//       {/* Address */}
//       <div className="p-3 border rounded-lg mb-4">
//         <p className="font-bold text-gray-800">นาย วงศกร ยอดกลาง</p>
//         <p className="text-sm text-gray-600">อำเภอบัวใหญ่ จังหวัดนครราชสีมา 30120</p>
//         <p className="text-sm text-gray-600">(+66) 64 506 7561</p>
//       </div>

//       {/* Product */}
//       <div className="p-3 border rounded-lg mb-4 flex gap-3">
//         <GiWashingMachine size={100} className="text-gray-600" />
//         <div className="flex-1">
//           <p className="text-sm font-medium">
//             รายการออร์เดอร์: <span className="text-gray-600">#12345</span>
//           </p>
//           <p className="text-sm text-gray-500">ซักเครื่องที่ 1 ขนาด 19kg (หมายเหตุ)</p>
//           <div className="flex justify-between mt-2">
//             <span className="text-red-500 font-semibold">฿308</span>
//             <span className="text-gray-400 line-through">฿387</span>
//           </div>
//         </div>
//       </div>

//       {/* ✅ ส่วน “โปรโมชั่น” พร้อมวงกลมเลือกด้านขวา */}
//       <div className="p-3 border rounded-lg mb-4">
//         <PromotionSelector
//           promotions={promotions}
//           cartTotal={totalAmount}
//           selectedId={selectedPromo?.id ?? null}     // โหมด controlled
//           onChange={(p) => setSelectedPromo(p)}
//           onApply={(p) => {
//             // กด “ใช้คูปอง” → ยัดโค้ดลงช่องเดิม
//             if (p) setCode(p.code);
//           }}
//         />
//       </div>


//       {/* Note */}
//       <div className="p-3 border rounded-lg mb-4">
//         <label className="block text-sm text-gray-600 mb-2">หมายเหตุ</label>
//         <textarea
//           value={note}
//           onChange={(e) => setNote(e.target.value)}
//           className="w-full p-2 border rounded-md"
//           placeholder="ฝากข้อความถึงพนักงานขนส่ง"
//         />
//       </div>

//       {/* Summary + ปุ่มชำระ */}
//       <div className="p-3 border rounded-lg mb-4">
//         <div className="flex justify-between items-center mb-2">
//           <span className="font-semibold text-lg">รวมทั้งหมด</span>
//           {/* ✅ แสดงยอดสุทธิหลังหักโปร */}
//           <span className="font-bold text-xl text-red-600">{toBaht(finalTotal)}</span>
//         </div>

//         {/* แสดงส่วนลดที่ได้ (ตัวเลือก) */}
//         <div className="mb-3 text-sm text-emerald-700">
//           {selectedPromo ? `ส่วนลด (${selectedPromo.code}) -${toBaht(discount)}` : "ยังไม่ได้เลือกโปรโมชั่น"}
//         </div>

//         <div className="flex gap-4">
//           <button
//             className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2"
//             onClick={() => setOpenQR(true)}
//             title="ชำระด้วยพร้อมเพย์"
//           >
//             <BsQrCode size={100} />
//           </button>

//           {/* QR Modal (มีปุ่มทดลองจ่าย) */}
//           <PaymentModal
//             isOpen={openQR}
//             onClose={() => setOpenQR(false)}
//             promptPayTarget={promptPayTarget}
//             amountTHB={finalTotal}          // ✅ ส่งยอดสุทธิหลังหักโปร
//             orderId={orderId}
//             durationSec={600}
//             onSimulatePay={() => handleSimulatePaid()}
//           />

//           <button
//             className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2"
//             title="ชำระเงินสด"
//           >
//             <BsCashCoin size={100}/>
//           </button>
//         </div>
//       </div>

//       {/* สลิปสำเร็จ */}
//       <PaymentSuccessModal
//         isOpen={openSlip}
//         onClose={() => setOpenSlip(false)}
//         shopName="NATII."      // เปลี่ยนชื่อร้านตรงนี้
//         orderId={orderId}
//         amount={finalTotal}
//         currency="THB"
//         paidAt={paidAt ?? new Date()}
//         statusText="ชำระเงินแล้ว"
//       />
//     </div>
//   );
// }


// Payment.tsx
import "./Payment.css";
import React, { useMemo, useState } from "react";
import { BsQrCode, BsCashCoin } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";

import PromotionSelector, { type Promo } from "./PromotionDemo"; // ✅ นำเข้าคอมโพเนนต์
import PaymentModal from "./PaymentModal";
import PaymentSuccessModal from "./slipDemo";


// utils เล็กๆ
const toBaht = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB", minimumFractionDigits: 2 });

function computeDiscount(total: number, p?: Promo | null) {
  if (!p) return 0;
  if (p.minSpend && total < p.minSpend) return 0;
  if (p.discountType === "amount") return Math.min(p.discountValue, total);
  const cut = Math.round(total * (p.discountValue / 100) * 100) / 100;
  return Math.min(cut, total);
}

export default function Payment() {
  // เดิมของคุณ
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [openQR, setOpenQR] = useState(false);
  const [openSlip, setOpenSlip] = useState(false);
  const [paidAt, setPaidAt] = useState<Date | null>(null);
  
  const totalAmount = 50;             // รวมก่อนหักโปร
  const orderId = 1;
  const promptPayTarget = "0645067561";

  // ✅ โปรโมชัน (จะดึงจาก backend ก็ได้)
  const promotions: Promo[] = [
    { id: "p1", code: "SAVE50", title: "ลด 50 บาท", discountType: "amount", discountValue: 50, badge: "ยอดนิยม", expiresAt: "2025-12-31" },
    { id: "p2", code: "NEW10", title: "ลูกค้าใหม่ลด 10%", description: "ขั้นต่ำ 300 บาท", discountType: "percent", discountValue: 10, minSpend: 300, expiresAt: "2025-10-01" },
    { id: "p3", code: "WASH25", title: "ลดเพิ่ม 25 บาท", description: "สำหรับบริการซักอบรีด", discountType: "amount", discountValue: 25 },
  ];

  // ✅ โปรที่เลือก
  const [selectedPromo, setSelectedPromo] = useState<Promo | null>(null);
  const discount = useMemo(() => computeDiscount(totalAmount, selectedPromo), [totalAmount, selectedPromo]);
  const finalTotal = useMemo(() => Math.max(0, Math.round((totalAmount - discount) * 100) / 100), [totalAmount, discount]);
  const handleSimulatePaid = () => {
      setOpenQR(false);
      setPaidAt(new Date());
      setOpenSlip(true);
    };

  // ยกเลิก simulate-only handler (เปลี่ยนมาใช้ onVerified จาก EasySlip)


  return (
    <div className="max-w-full mx-auto bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <h1 className="flex-1 text-center font-semibold">รายการชำระเงิน</h1>
      </div>

      {/* Address */}
      <div className="p-3 border rounded-lg mb-4">
        <p className="font-bold text-gray-800">นาย วงศกร ยอดกลาง</p>
        <p className="text-sm text-gray-600">อำเภอบัวใหญ่ จังหวัดนครราชสีมา 30120</p>
        <p className="text-sm text-gray-600">(+66) 64 506 7561</p>
      </div>

      {/* Product */}
      <div className="p-3 border rounded-lg mb-4 flex gap-3">
        <GiWashingMachine size={100} className="text-gray-600" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            รายการออร์เดอร์: <span className="text-gray-600">#12345</span>
          </p>
          <p className="text-sm text-gray-500">ซักเครื่องที่ 1 ขนาด 19kg (หมายเหตุ)</p>
          <div className="flex justify-between mt-2">
            <span className="text-red-500 font-semibold">฿308</span>
            <span className="text-gray-400 line-through">฿387</span>
          </div>
        </div>
      </div>

      {/* ✅ ส่วน “โปรโมชั่น” พร้อมวงกลมเลือกด้านขวา */}
      <div className="p-3 border rounded-lg mb-4">
        <PromotionSelector
          promotions={promotions}
          cartTotal={totalAmount}
          selectedId={selectedPromo?.id ?? null}     // โหมด controlled
          onChange={(p) => setSelectedPromo(p)}
          
        />
      </div>


      {/* Note */}
      <div className="p-3 border rounded-lg mb-4">
        <label className="block text-sm text-gray-600 mb-2">หมายเหตุ</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="ฝากข้อความถึงพนักงานขนส่ง"
        />
      </div>

      {/* Summary + ปุ่มชำระ */}
      <div className="p-3 border rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-lg">รวมทั้งหมด</span>
          {/* ✅ แสดงยอดสุทธิหลังหักโปร */}
          <span className="font-bold text-xl text-red-600">{toBaht(finalTotal)}</span>
        </div>

        {/* แสดงส่วนลดที่ได้ (ตัวเลือก) */}
        <div className="mb-3 text-sm text-emerald-700">
          {selectedPromo ? `ส่วนลด (${selectedPromo.code}) -${toBaht(discount)}` : "ยังไม่ได้เลือกโปรโมชั่น"}
        </div>

        <div className="flex gap-4">
          <button
            className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2"
            onClick={() => setOpenQR(true)}
            title="ชำระด้วยพร้อมเพย์"
          >
            <BsQrCode size={100} />
          </button>

          {/* QR Modal (มีปุ่มทดลองจ่าย) */}
          <PaymentModal
            isOpen={openQR}
            onClose={() => setOpenQR(false)}
            promptPayTarget={promptPayTarget}
            amountTHB={finalTotal}          // ✅ ส่งยอดสุทธิหลังหักโปร
            orderId={orderId}
            durationSec={600}
            onSimulatePay={() => handleSimulatePaid()}
          />

          <button
            className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2"
            title="ชำระเงินสด"
          >
            <BsCashCoin size={100}/>
          </button>
        </div>
      </div>

      {/* สลิปสำเร็จ */}
      <PaymentSuccessModal
        isOpen={openSlip}
        onClose={() => setOpenSlip(false)}
        shopName="NATII."      // เปลี่ยนชื่อร้านตรงนี้
        orderId={orderId}
        
        amount={finalTotal}
        currency="THB"
        paidAt={paidAt ?? new Date()}
        statusText="ชำระเงินแล้ว"
      />
    </div>
  );
}
