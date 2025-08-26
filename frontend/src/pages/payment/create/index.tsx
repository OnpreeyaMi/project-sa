import './Payment.css';

import React, { useState } from "react";
import PaymentModal from "./PaymentModel";
import { BsQrCode } from "react-icons/bs";
import { BsCashCoin } from "react-icons/bs";
import { GiWashingMachine } from "react-icons/gi";



export default function Payment() {
  //const [option, setOption] = useState(''); // State to manage selected payment option
  //const [amount, setAmount] = useState(''); // State to manage input amount  ใช้ useState เพื่อจัดการกับตัวเลือกการชำระเงินและจำนวนเงินที่ป้อน
  //const [showSlip, setShowSlip] = useState(false); // State to manage slip visibility
  const [note, setNote] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  // สมมุติดึงมาจากออร์เดอร์จริง (ให้ฝั่ง backend ส่งมา)
  const totalAmount = 425.75; // “ล็อกยอด” ด้วยค่าที่ระบบกำหนด
  const orderId = "INV-2024-000123";
  const promptPayTarget = "0812345678"; // เบอร์/เลขบัตร/ e-Wallet ของร้าน

  return (
    
  
  <div className="max-w-full  mx-auto bg-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <h1 className="flex-1 text-center font-semibold">รายการชำระเงิน</h1>
      </div>

      {/* Address */}
      <div className="p-3 border rounded-lg mb-4">
        <p className="font-bold text-gray-800">นาย วงศกร ยอดกลาง</p>
        <p className="text-sm text-gray-600">
          อำเภอบัวใหญ่ จังหวัดนครราชสีมา 30120
        </p>
        <p className="text-sm text-gray-600">(+66) 64 506 7561</p>
      </div>

      {/* Product */}
      <div className="p-3 border rounded-lg mb-4 flex gap-3">
        
          { <GiWashingMachine size={100} className="text-gray-600" /> }
          
        
        <div className="flex-1">
          <p className="text-sm font-medium">
            รายการออร์เดออร์: <span className="text-gray-600">#12345</span>
          </p>
          <p className="text-sm text-gray-500">ซักเครื่องที่1 ขนาด19kg(หมายเหตุ)</p>
          <div className="flex justify-between mt-2">
            <span className="text-red-500 font-semibold">฿308</span>
            <span className="text-gray-400 line-through">฿387</span>    {/*ราคาเต็ม*/ }
          </div>
        </div>
      </div>

      {/* Discount */}
      <div className="p-3 border rounded-lg mb-4 flex justify-between items-center">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="โค้ดส่วนลดร้านค้า"
        />
        
        <button className="px-2 py-1 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 hover:shadow-md active:scale-95 transition duration-200">
          กดใช้โค้ด
        </button>

      </div>

      {/* Note */}
      <div className="p-3 border rounded-lg mb-4">
        <label className="block text-sm text-gray-600 mb-2">
          หมายเหตุ
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="ฝากข้อความถึงพนักงานขนส่ง"
        />
      </div>

      

      <div className="p-3 border rounded-lg mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-lg">รวมทั้งหมด</span>
          <span className="font-bold text-xl text-red-600">฿314</span>
        </div>
        <div className="flex gap-4">
          <button className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2"
            onClick={() => setOpen(true)}
            >
  
            <BsQrCode size={100} />
            
          </button>
          <PaymentModal
          isOpen={open}
          onClose={() => setOpen(false)}
          promptPayTarget={promptPayTarget}
          amountTHB={totalAmount}
          orderId={orderId}
          durationSec={600} // 10 นาที
          />
          <button className="w-[800px] bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 hover:shadow-md active:scale-95 transition duration-200 flex items-center justify-center gap-2">
            <BsCashCoin size={100}/>
          </button>
        </div>
      </div>
      

    </div>

    
  );
}
