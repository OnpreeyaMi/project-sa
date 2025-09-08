import React, { useState } from "react";
import {Button, Select, Row, Col, Table, Tag } from "antd";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Link } from "react-router-dom";
// import StatusCard from "../componemts/StatusCard";
import "./StatusUpdate.css";
import { useEffect } from "react";

const StatusUpdate: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  

useEffect(() => {
  fetch("http://localhost:8000/ordersdetails")
    .then(res => res.json())
    .then(data => {
      setOrders(data);  // จะได้ array ของ order + status
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching orders:", err);
      setLoading(false);
    });
}, []);

  
  // mock data (แทน DB จริง)
  const columns = [
  { title: "รหัสออเดอร์", dataIndex: "ID", key: "ID" },
 {
      title: "ชื่อลูกค้า",
      key: "customerName",
      render: (_: any, record: any) =>
        record.Customer
          ? `${record.Customer.FirstName} ${record.Customer.LastName}`
          : "-",
  },
  { title: "ขนาดถังซัก (kg)", dataIndex: "washer_capacity", key: "washer_capacity" },
  { title: "ขนาดถังอบ (kg)", dataIndex: "dryer_capacity", key: "dryer_capacity" },
  { title: "จำนวนชิ้น", dataIndex: "totalItems", key: "totalItems" },
  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      let color = "default";
      if (status === "รอดำเนินการ") color = "orange";
      if (status === "กำลังซัก") color = "blue";
      if (status === "กำลังอบ") color = "geekblue";
      if (status === "เสร็จสิ้น") color = "green";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "การจัดการ",
    key: "action",
    render: (_: any, record: any) => (
      <Link to={`/employee/orders/${record.ID}`}>
        <Button type="primary">ดูรายละเอียด</Button>
      </Link>
    ),
  },
];


  return (
    <EmployeeSidebar>
      <div style={{ padding: 20 }}>
        <h2>📋 รายการออเดอร์</h2>
        <Table
          loading={loading}
          dataSource={orders}
          columns={columns}
          rowKey="ID"
          pagination={{ pageSize: 20 }}
        />
      </div>
    </EmployeeSidebar>
  );
};

export default StatusUpdate;