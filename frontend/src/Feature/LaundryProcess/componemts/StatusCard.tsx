import React from "react";
import { Card } from "antd";
import "./StatusCard.css";

interface StatusCardProps {
  icon: React.ReactNode;
  label: string;
  value: string; // <- เพิ่มค่าของสถานะจริง เช่น "washing", "done"
  isSelected: boolean;
  onClick: (value: string) => void; // <- ส่ง value กลับแทนที่จะเป็น void
  
}

const StatusCard: React.FC<StatusCardProps> = ({
  icon,
  label,
  value,
  isSelected,
  onClick,
}) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(value)} // ส่ง value กลับ
      className={`status-card ${isSelected ? "selected" : "unselected"}`}
    >
      <div className="status-card-icon">{icon}</div>
      <div className="status-card-label">{label}</div>
    </Card>
  );
};

export default StatusCard;
