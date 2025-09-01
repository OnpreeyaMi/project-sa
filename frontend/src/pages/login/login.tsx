import React from "react";
import { Link } from "react-router-dom"; // <- import Link
import "./Login.css";

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="bubbles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="login-card">
        <div className="logo">
          <div className="logo-icon">👕</div>
        </div>
        <h2>เข้าสู่ระบบ</h2>
        <p className="subtitle">delivery laundry</p>

        <form>
          <div className="form-group">
            <label>อีเมล</label>
            <input type="email" placeholder="กรอกอีเมล" />
          </div>

          <div className="form-group">
            <label>รหัสผ่าน</label>
            <input type="password" placeholder="กรอกรหัสผ่าน" />
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
