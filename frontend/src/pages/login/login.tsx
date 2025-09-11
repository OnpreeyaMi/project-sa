import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // <- ใช้ useNavigate
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token); // เก็บเฉพาะ token
        localStorage.setItem("role", data.role); 
        // ดึงข้อมูล customer เพิ่มเติม
        const customerRes = await fetch(`http://localhost:8000/customer/profile`, {
          headers: { Authorization: `Bearer ${data.token}` }
        });
        const customerData = await customerRes.json();

        localStorage.setItem("user", JSON.stringify({
          ...data,
          customer: normalizeCustomer(customerData) // ต้อง normalize ตรงนี้!
        }));
        localStorage.setItem("userId", String(customerData.ID)); // <-- เพิ่มบรรทัดนี้

        switch (data.role) {
          case "customer":
            navigate("/customer/home");
            window.location.reload();
            break;
          case "employee":
            navigate("/employee/dashboard");
            window.location.reload();
            break;
          case "admin":
            navigate("/admin/employees");
            window.location.reload();
            break;
          default:
            navigate("/");
            window.location.reload();
        }
      } else {
        alert(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดระหว่างเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  function normalizeCustomer(raw: any) {
    return {
      id: raw.ID,
      firstName: raw.FirstName,
      lastName: raw.LastName,
      phone: raw.PhoneNumber,
      gender: raw.Gender ? { id: raw.Gender.ID, name: raw.Gender.Name } : { id: 0, name: "" },
      addresses: (raw.Addresses || []).map((addr: any) => ({
        id: addr.ID,
        detail: addr.AddressDetails,
        latitude: addr.Latitude,
        longitude: addr.Longitude,
        isDefault: addr.IsDefault,
      })),
      // ...อื่นๆที่ต้องการ
    };
  }

  return (
    <div className="login-container">
      <div className="bubbles">
        <span></span><span></span><span></span><span></span><span></span>
      </div>
      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">👕</div>
        </div>
        <h2>เข้าสู่ระบบ</h2>
        <p className="subtitle">delivery laundry</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>อีเมล</label>
            <input
              type="email"
              placeholder="กรอกอีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input
              type="password"
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">เข้าสู่ระบบ</button>
        </form>

        <p className="signup-text">
          ยังไม่มีบัญชีผู้ใช้ใช่หรือไม่? <Link to="/register">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

