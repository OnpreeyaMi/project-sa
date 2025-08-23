import React from "react";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { Card } from "antd";
import {Table ,Tag} from 'antd';

const columns = [
  {
    title: "วันที่",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "ขนาดถังซัก",
    dataIndex: "sizewashing",
    key: "sizewashing",
  },
  {
    title: "ขนาดถังอบ",
    dataIndex: "sizedrying",
    key: "sizedrying",
  },
  {
    title: "ราคา",
    dataIndex: "price",
    key: "price",
    render: (price: number) => `${price} บาท`,
  },
  {
    title:"status",
    dataIndex: "status",
  },
  {
    title: "สถานะการจ่ายเงิน",
    dataIndex: "payment_status",
    key: "payment_status",
    render: (payment_status: string) => {
      let color = payment_status === "ชำระเงินแล้ว" ? "green" : "orange";
      return <Tag color={color}>{payment_status}</Tag>;
    },
  },
];

const data = [
  {
    date: "2025-08-06 14:30",
    sizewashing: "10 KG",
    sizedrying: "14 KG",
    price: 60,
    status: "กำลังดำเนินการ",
    payment_status: "ชำระเงินแล้ว",
  },
  {
    date: "2025-08-05 18:10",
    sizewashing: "14 KG",
    sizedrying: "25 KG",
    price: 80,
    status: "กำลังดำเนินการ",
    payment_status: "ยังไม่จ่าย",
  },
  {
    date: "2025-08-03 10:05",
    sizewashing: "28 KG",
    sizedrying: "18 KG",
    price: 120,
    status: "เสร็จสิ้น",
    payment_status: "ชำระเงินแล้ว",
  },
];



const HistoryPage: React.FC = () => {
  return (
    <>
      <CustomerSidebar>
        <h1>History</h1>
        <Card
          hoverable
          style={{
            width: "100%",
            height: 'auto',
            textAlign: "center",
            borderRadius: 8,
            background: "#F9FBFF",
          }}
        ><Table columns={columns} dataSource={data} /></Card>
      </CustomerSidebar>
    </>
  );
};

export default HistoryPage;