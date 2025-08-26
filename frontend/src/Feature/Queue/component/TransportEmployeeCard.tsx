// TransportCard.tsx
import React from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./TransportQueuePage.css"; // ใช้ CSS เดิมร่วมกันได้

const TransportCard: React.FC = () => {
  const employee = {
    name: "สมชาย ใจดี",
    position: "พนักงานขนส่ง",
    phone: "081-234-5678",
    gender: "ชาย",
  };

  return (
    <div className="employee-card">
      <Avatar size={96} icon={<UserOutlined />} className="employee-avatar" />
      <div className="employee-info">
        <h3 className="employee-title">👤 ข้อมูลพนักงาน</h3>
        <p><strong>ชื่อ:</strong> {employee.name}</p>
        <p><strong>ตำแหน่ง:</strong> {employee.position}</p>
        <p><strong>เบอร์ติดต่อ:</strong> {employee.phone}</p>
        <p><strong>เพศ:</strong> {employee.gender}</p>
      </div>
    </div>
  );
};

export default TransportCard;
// ยังไม่ใช้ ค่อยกลับมาแก้ 