import React, { useState } from "react";
<<<<<<< HEAD
import { Link, useNavigate } from "react-router-dom"; // <- ใช้ useNavigate
=======
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
import "./Login.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
=======
  const { setUser } = useUser();
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
<<<<<<< HEAD
      const res = await fetch("http://localhost:8000/login", {
=======
      const res = await fetch(`${API_BASE}/login`, {
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
<<<<<<< HEAD

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

=======
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      const baseUser: any = {
        id: data.id ?? data.ID,
        email: data.email ?? data.Email ?? email,
        role: data.role ?? data.Role,
        token: data.token ?? data.Token,
        employeeId: data.employeeId ?? data.EmployeeID ?? undefined,
      };

      // persist สำหรับ interceptors/guards
      localStorage.setItem("token", baseUser.token);
      localStorage.setItem("role", baseUser.role || "");
      if (baseUser.employeeId) localStorage.setItem("employeeId", String(baseUser.employeeId));

      // พยายาม preload โปรไฟล์ตาม role (optional)
      try {
        if (baseUser.role === "customer") {
          const r = await fetch(`${API_BASE}/customer/profile`, {
            headers: { Authorization: `Bearer ${baseUser.token}` },
          });
          if (r.ok) baseUser.customer = await r.json();
        } else if (baseUser.role === "employee") {
          const r1 = await fetch(`${API_BASE}/employee/me`, {
            headers: { Authorization: `Bearer ${baseUser.token}` },
          });
          if (r1.ok) {
            const me = await r1.json();
            baseUser.employee = me;
            baseUser.employeeId = me?.ID || baseUser.employeeId;
            if (baseUser.employeeId) localStorage.setItem("employeeId", String(baseUser.employeeId));
          } else if (baseUser.employeeId) {
            const r2 = await fetch(`${API_BASE}/employees/${baseUser.employeeId}`, {
              headers: { Authorization: `Bearer ${baseUser.token}` },
            });
            if (r2.ok) baseUser.employee = await r2.json();
          }
        }
      } catch (e) {
        console.warn("profile preload failed", e);
      }

      setUser(baseUser);

      // นำทางตาม role
      if (baseUser.role === "admin") navigate("/admin/employees");
      else if (baseUser.role === "employee") navigate("/employee/dashboard");
      else navigate("/customer/home");
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดระหว่างเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="login-container">
      <div className="bubbles"><span></span><span></span><span></span><span></span><span></span></div>
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
      <div className="login-card">
        <div className="logo"><div className="logo-icon">👕</div></div>
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

