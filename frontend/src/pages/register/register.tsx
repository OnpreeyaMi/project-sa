// src/pages/RegisterForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./register.css";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Input } from "antd";

function LocationMarker({ setPosition, setAddress }: any) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition({ lat, lng });

      // เรียก reverse geocoding
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      setAddress(res.data.display_name || "");
    },
  });

  return null;
}

export default function RegisterForm() {
  const [step, setStep] = useState(1);
  const [position, setPosition] = useState({ lat: 14.8757, lng: 102.0153 });
  const [addressDetail, setAddressDetail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        }
      );
    }
  }, [step]);

  // state เก็บฟอร์ม
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    genderId: "",
    addressDetail: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // กรองเฉพาะตัวเลข
    setForm({ ...form, phone: value.slice(0, 10) }); // จำกัด 10 ตัว
  };

  const isValidThaiPhone = (phone: string) => {
    // เบอร์ไทยสากล: ขึ้นต้น 08 หรือ 09 และมี 10 หลัก
    return /^(08|09)\d{8}$/.test(phone);
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 6) {
      alert("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (!isValidThaiPhone(form.phone)) {
      alert("กรุณากรอกเบอร์โทรตามรูปแบบไทยสากล (เช่น 08xxxxxxxx หรือ 09xxxxxxxx)");
      return;
    }
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        genderId: parseInt(form.genderId),
        addressDetail: form.addressDetail,
        latitude: position.lat,
        longitude: position.lng,
      };

      await axios.post("http://localhost:8000/register", payload);
      alert("สมัครสมาชิกสำเร็จ!");
      navigate("/"); // กลับไปหน้า login
    } catch (err: any) {
      if (err.response?.data?.error?.includes("Email already used")) {
        alert("อีเมลนี้ถูกใช้ไปแล้ว");
      } else {
        alert("สมัครสมาชิกไม่สำเร็จ: " + err.response?.data?.error);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) navigate("/");
    else setStep(step - 1);
  };

  const setAddressDetailSync = (value: string) => {
    setAddressDetail(value);
    setForm((prev) => ({ ...prev, addressDetail: value }));
  };

  return (
    <div className="register-container">
      {step === 1 && (
        <div className="register-card">
          <h2 className="register-title">สมัครบัญชีผู้ใช้</h2>
          <p className="register-subtitle">กรุณากรอกข้อมูล</p>
          <div className="form-group">
            <div className="form-row">
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="ชื่อ" className="input" />
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="นามสกุล" className="input" />
            </div>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="อีเมล" className="input" />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="รหัสผ่าน" className="input" />
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="ยืนยันรหัสผ่าน" className="input" />
            <div className="form-row">
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="เบอร์โทร"
                className="input"
                maxLength={10}
                inputMode="numeric"
              />
              <select name="genderId" value={form.genderId} onChange={handleChange} className="input" required>
                <option value="" disabled>เลือกเพศ</option>
                <option value="1">ชาย</option>
                <option value="2">หญิง</option>
                <option value="3">อื่นๆ</option>
              </select>
            </div>
            <button className="btn" onClick={() => {
              if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.genderId) {
                alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
                return;
              }
              if (!isValidThaiPhone(form.phone)) {
                alert("กรุณากรอกเบอร์โทรตามรูปแบบไทยสากล (เช่น 08xxxxxxxx หรือ 09xxxxxxxx)");
                return;
              }
              setStep(2);
            }}>ต่อไป</button>
            <p className="back-login">
              มีบัญชีแล้ว? <Link to="/">เข้าสู่ระบบ</Link>
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="register-card">
          <h2 className="register-title">สมัครบัญชีผู้ใช้</h2>
          <p className="register-subtitle">กรุณาปักหมุดที่อยู่หลัก</p>
          <div className="form-group">
            <MapContainer center={[position.lat, position.lng]} zoom={15} style={{ width: "100%", height: "400px" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker setPosition={setPosition} setAddress={setAddressDetailSync} />
              <Marker position={[position.lat, position.lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
            </MapContainer>
            <Input.TextArea name="addressDetail" value={addressDetail} readOnly style={{ width: "100%", minHeight: "60px", marginTop: "12px" }} />
            <button id="back" className="btn" onClick={handleBack}>ย้อนกลับ</button>
            <button className="btn" onClick={handleSubmit}>สมัครสมาชิก</button>
          </div>
        </div>
      )}
    </div>
  );
}