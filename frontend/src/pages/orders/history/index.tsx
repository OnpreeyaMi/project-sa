import React, { useEffect, useState } from "react";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { Card, Table, Tag, Spin, message } from "antd";
import { fetchOrderHistories } from "../../../services/orderService";
import type { OrderHistory } from "../../../interfaces/types";
import dayjs from "dayjs";

const HistoryPage: React.FC = () => {
  const [data, setData] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const histories = await fetchOrderHistories();

        // เพิ่ม key ให้แต่ละ row ของตาราง
        const tableData = histories.map((item, index) => ({
          ...item,
          key: item.id || index,
        }));

        setData(tableData);
      } catch (error) {
        console.error(error);
        message.error("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  const columns = [
    {
      title: "วันที่สั่ง",
      dataIndex: "CreatedAt",
      key: "CreatedAt",
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "รหัสคำสั่ง",
      dataIndex: "OrderID",
      key: "OrderID",
    },
    {
      title: "ประเภทบริการ",
      key: "service_types",
      render: (_: any, record: any) => {
        const arr = record.Order?.ServiceTypes;
        if (arr && arr.length > 0) {
          return (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {arr.map((st: any, idx: number) => (
                <li key={st.ID || idx}>
                  {st.Type || st.type}
                  {st.Capacity ? ` (${st.Capacity} kg)` : ""}
                </li>
              ))}
            </ul>
          );
        }
        return "-";
      },
    },
    {
      title: "น้ำยาซักผ้า",
      key: "detergents",
      render: (_: any, record: any) =>
        record.Order?.Detergents && record.Order.Detergents.length > 0
          ? record.Order.Detergents.map((dt: any) => dt.Name || dt.name).join(", ")
          : "-",
    },
    {
      title: "ราคา",
      dataIndex: "Price",
      key: "price",
      // render: (price: number) => (price ? `${price} บาท` : "-"),
    },
    {
      title: "สถานะ",
      dataIndex: "Status",
      key: "status",
      // render: (status: string) => {
      //   if (!status) return "-";
      //   const color = status === "เสร็จสิ้น" ? "green" : status === "กำลังดำเนินการ" ? "blue" : "orange";
      //   return <Tag color={color}>{status}</Tag>;
      // },
    },
    {
      title: "สถานะการจ่ายเงิน",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (payment_status: string) => {
        if (!payment_status) return "-";
        const color = payment_status === "ชำระเงินแล้ว" ? "green" : "orange";
        return <Tag color={color}>{payment_status}</Tag>;
      },
    },
  ];

  return (
    <CustomerSidebar>
      <h1 style={{ textAlign: "left", marginTop: 20, marginBottom: 20, fontSize: "20px" }}>
        ประวัติการสั่งซื้อ
      </h1>
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
          <Table columns={columns} dataSource={data} rowKey="key" />
        )}
      </Card>
    </CustomerSidebar>
  );
};

export default HistoryPage;