import React, { useEffect, useState } from "react";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { Card, Table, Tag, Spin, message } from "antd";
// import axios from "axios";
import { fetchOrderHistories } from "../../../services/orderService";
import type { OrderHistory } from "../../../interfaces/types";



const columns = [
  {
    title: "วันที่",
    dataIndex: ["order", "created_at"], // ดึงจาก order.created_at
    key: "date",
  },
  {
    title: "ราคา",
    dataIndex: ["order", "price"],
    key: "price",
    render: (price: number) => (price ? `${price} บาท` : "-"),
  },
  {
    title: "สถานะ",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "สถานะการจ่ายเงิน",
    dataIndex: "payment_status",
    key: "payment_status",
    render: (payment_status: string) => {
      if (!payment_status) return "-";
      let color = payment_status === "ชำระเงินแล้ว" ? "green" : "orange";
      return <Tag color={color}>{payment_status}</Tag>;
    },
  },
];

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const histories = await fetchOrderHistories()
        console.log(histories);
        setData(histories);
      } catch (error) {
        console.error(error);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  return (
    <CustomerSidebar>
      <h1>History</h1>
      <Card
        hoverable
        style={{
          width: "100%",
          height: "auto",
          textAlign: "center",
          borderRadius: 8,
          background: "#F9FBFF",
        }}
      >
        {loading ? (
          <Spin tip="กำลังโหลด..." />
        ) : (
          <Table columns={columns} dataSource={data} rowKey="id" />
        )}
      </Card>
    </CustomerSidebar>
  );
};

export default HistoryPage;