import React, { useState } from "react";
import {Button, Select, Row, Col, Table, Tag } from "antd";
import EmpSidebar from "../../../component/layout/Sidebar/EmpSidebar";
import { Link } from "react-router-dom";
// import StatusCard from "../componemts/StatusCard";
import "./StatusUpdate.css";

const StatusUpdate: React.FC = () => {
  // mock data (แทน DB จริง)
  const [orders] = useState([
    {
      orderId: "1001",
      customerName: "สมชาย ใจดี",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 20,
      status: "รอดำเนินการ",
    },
    {
      orderId: "1002",
      customerName: "สุดา สวยมาก",
      washer_capacity: 14,
      dryer_capacity: 14,
      totalItems: 15,
      status: "กำลังซัก",
    },
    {
      orderId: "1003",
      customerName: "ประยุทธ์ ใจดี",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 10,
      status: "กำลังอบ",
    },
    {
      orderId: "1004",
      customerName: "อรทัย น่ารัก",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 35,
      status: "เสร็จสิ้น",
    },
    {
      orderId: "1005",
      customerName: "วิชัย แกร่งกล้า",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 12,
      status: "รอดำเนินการ",
    },
    {
      orderId: "1006",
      customerName: "พรทิพย์ ขยันมาก",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 18,
      status: "กำลังซัก",
    },
    {
      orderId: "1007",
      customerName: "ณัฐพล เก่งกาจ",
      washer_capacity: 10,
      dryer_capacity: 14,
      totalItems: 25,
      status: "กำลังอบ",
    },
  ]);

  const columns = [
    {
      title: "รหัสออเดอร์",
      dataIndex: "orderId",
      key: "orderId",
    },
    {
      title: "ชื่อลูกค้า",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "ขนาดถังซัก (kg)",
      dataIndex: "washer_capacity",
      key: "washer_capacity",
    },
    {
      title: "ขนาดถังอบ (kg)",
      dataIndex: "dryer_capacity",
      key: "dryer_capacity",
    },
    {
      title: "จำนวนชิ้น",
      dataIndex: "totalItems",
      key: "totalItems",
    },
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
        <Link to={`/orders/${record.orderId}`}>
          <Button type="primary">ดูรายละเอียด</Button>
        </Link>
      ),
    },
  ];

  return (
    <EmpSidebar>
      <div style={{ padding: 20 }}>
        <h2>📋 รายการออเดอร์</h2>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="orderId"
          pagination={{ pageSize: 20 }}
        />
      </div>
    </EmpSidebar>
  );
};

export default StatusUpdate;