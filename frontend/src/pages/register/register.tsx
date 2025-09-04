import { useState } from "react";
<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";
=======
<<<<<<< HEAD
<<<<<<< HEAD
import { useNavigate, Link } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom";
>>>>>>> c5eb16c (uiใหม่ ยั่วๆ)
=======
import { useNavigate, Link } from "react-router-dom";
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry
      {step === 1 && (
        <div id="info" className="register-card">
          <h2 className="register-title">สมัครบัญชีผู้ใช้</h2>
          <p className="register-subtitle">กรุณากรอกข้อมูล</p>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
      <div className="register-card">
        <button className="back-btn" onClick={handleBack}>
          ← กลับ
        </button>

        <h2 className="register-title">สมัครสมาชิก</h2>
        <p className="register-subtitle">กรุณากรอกข้อมูล</p>

        {step === 1 && (
>>>>>>> c5eb16c (uiใหม่ ยั่วๆ)
=======
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry
          <div className="form-group">
            <div className="form-row">
              <input type="text" placeholder="ชื่อ" className="input" />
              <input type="text" placeholder="นามสกุล" className="input" />
            </div>
            <input type="email" placeholder="อีเมล" className="input" />
            <input type="password" placeholder="รหัสผ่าน" className="input" />
            <input type="password" placeholder="ยืนยันรหัสผ่าน" className="input" />
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry
            <div className="form-row">
              <input type="text" placeholder="เบอร์โทร" className="input" />
              <select className="input">
                <option value="">เลือกเพศ</option>
                <option value="1">ชาย</option>
                <option value="2">หญิง</option>
                <option value="3">อื่นๆ</option>
              </select>
            </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
>>>>>>> c5eb16c (uiใหม่ ยั่วๆ)
=======
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry

            <button className="btn" onClick={() => setStep(2)}>
              ต่อไป
            </button>
<<<<<<< HEAD
=======
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> laundry
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

<<<<<<< HEAD
=======
=======
=======
            <p className="back-login">
              มีบัญชีผู้ใช้แล้วใช่หรือไม่? <Link to="/">เข้าสู่ระบบ</Link>
            </p>
>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
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
<<<<<<< HEAD
>>>>>>> c5eb16c (uiใหม่ ยั่วๆ)
=======

>>>>>>> fd4fc57 (แก้ๆแบบแบดๆ)
>>>>>>> laundry
  );
}
