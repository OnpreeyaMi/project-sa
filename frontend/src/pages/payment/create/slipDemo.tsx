// SlipDemo.jsx
import React, { useState } from "react";
import "./slip.css"; // ใส่ CSS ด้านล่างในไฟล์ slip.css

export default function SlipDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function showSlip() {
    // simulate "call" (no API) — ใช้ state แค่จำลอง
    setLoading(true);
    setOpen(true);
    setTimeout(() => { // หลังเสร็จ
      setLoading(false);
      // auto close after 3s
      setTimeout(() => setOpen(false), 3000);
    }, 1200);
  }

  return (
    <div className="container">
      <button className="btn" onClick={showSlip}>แสดงสลิป</button>

      <div className={`slip ${open ? "slip--enter" : "slip--leave"}`}>
        <div className="slip__content">
          <div className="slip__header">
            <strong>การชำระเงินสำเร็จ</strong>
            <span className="slip__time">ตอนนี้</span>
          </div>

          <div className="slip__body">
            {loading ? (
              <div className="skeleton">
                <div className="line short" />
                <div className="line" />
              </div>
            ) : (
              <>
                <div>ยอดชำระ: <b>฿250.00</b></div>
                <div>หมายเลขอ้างอิง: <code>#A12345</code></div>
              </>
            )}
          </div>

          <div className="slip__actions">
            <button className="link" onClick={() => setOpen(false)}>ปิด</button>
          </div>
        </div>
      </div>
    </div>
  );
}
