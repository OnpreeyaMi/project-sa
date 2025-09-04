import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LeafletMap from "./../../component/LeafletMap";
import "./register.css";

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState({ lat: 14.8757, lng: 102.0153 });
  const navigate = useNavigate(); // สำหรับไปหน้า login

  const handleBack = () => {
    if (step === 1) {
      navigate("/"); // กลับไปหน้า login
    } else {
      setStep(step - 1); // กลับไป step ก่อนหน้า
    }
  };

  return (
    <div className="register-container">
      {step === 1 && (
        <div id="info" className="register-card">
          <h2 className="register-title">สมัครบัญชีผู้ใช้</h2>
          <p className="register-subtitle">กรุณากรอกข้อมูล</p>
          <div className="form-group">
            <div className="form-row">
              <input type="text" placeholder="ชื่อ" className="input" />
              <input type="text" placeholder="นามสกุล" className="input" />
            </div>
            <input type="email" placeholder="อีเมล" className="input" />
            <input type="password" placeholder="รหัสผ่าน" className="input" />
            <input type="password" placeholder="ยืนยันรหัสผ่าน" className="input" />
            <div className="form-row">
              <input type="text" placeholder="เบอร์โทร" className="input" />
              <select className="input">
                <option value="">เลือกเพศ</option>
                <option value="1">ชาย</option>
                <option value="2">หญิง</option>
                <option value="3">อื่นๆ</option>
              </select>
            </div>

            <button className="btn" onClick={() => setStep(2)}>
              ต่อไป
            </button>
            <p className="back-login">
              มีบัญชีผู้ใช้แล้วใช่หรือไม่? <Link to="/">เข้าสู่ระบบ</Link>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div id="map" className="register-card">
          <h2 className="register-title">สมัครบัญชีผู้ใช้</h2>
          <p id="map" className="register-subtitle">กรุณาปักหมุดที่อยู่หลัก</p>
          <div id="map" className="form-group">
            <LeafletMap position={position} setPosition={setPosition} />
            {/* <input
                type="text"
                placeholder={`Lat: ${position.lat}, Lng: ${position.lng}`}
                className="input"
                readOnly /> */}
              <input type="text" placeholder="รายละเอียดที่อยู่" />
            <button id="back"className="btn" onClick={handleBack}>ย้อนกลับ</button>  
            <button className="btn">สมัครสมาชิก</button>
          </div>
        </div>
      )}
    </div>

  );
}
