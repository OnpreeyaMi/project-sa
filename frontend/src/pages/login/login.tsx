import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/UserContext";
import "./Login.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
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
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดระหว่างเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  return (
    <div className="login-container">
      <div className="bubbles"><span></span><span></span><span></span><span></span><span></span></div>
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

