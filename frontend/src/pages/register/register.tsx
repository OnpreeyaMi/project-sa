import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="register-card">
        <button className="back-btn" onClick={handleBack}>
          ← กลับ
        </button>

        <h2 className="register-title">สมัครสมาชิก</h2>
        <p className="register-subtitle">กรุณากรอกข้อมูล</p>

        {step === 1 && (
          <div className="form-group">
            <div className="form-row">
              <input type="text" placeholder="ชื่อ" className="input" />
              <input type="text" placeholder="นามสกุล" className="input" />
            </div>
            <input type="email" placeholder="อีเมล" className="input" />
            <input type="password" placeholder="รหัสผ่าน" className="input" />
            <input type="password" placeholder="ยืนยันรหัสผ่าน" className="input" />

            <button className="btn" onClick={() => setStep(2)}>
              ต่อไป
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-group">
            <div className="form-row">
              <input type="text" placeholder="เบอร์โทร" className="input" />
              <input type="text" placeholder="เพศ" className="input" />
            </div>

            <LeafletMap position={position} setPosition={setPosition} />

            <input
              type="text"
              placeholder={`Lat: ${position.lat}, Lng: ${position.lng}`}
              className="input"
              readOnly
            />

            <button className="btn">สมัครสมาชิก</button>
          </div>
        )}
      </div>
    </div>
  );
}
