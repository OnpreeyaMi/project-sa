import React, { useEffect, useState } from "react";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { Card, Tag, Button, Spin, message } from "antd";
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

  return (
    <CustomerSidebar>
      <h1 style={{ textAlign: "left", marginTop: 20, marginBottom: 20, fontSize: "20px" }}>
        ประวัติการสั่งซื้อ
      </h1>
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
        {loading ? (
          <Spin tip="กำลังโหลด..." />
        ) : (
          data.map((item) => {
            const order = item.Order || {};
            return (
              <Card
                key={item.key}
                hoverable
                style={{ marginBottom: 18, borderRadius: 12, boxShadow: "0 2px 8px #eee", textAlign: "left" }}
                bodyStyle={{ padding: 18 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ marginBottom: 4 }}>
                      <b>วันที่สั่งซื้อ:</b> {dayjs(item.CreatedAt).format("DD/MM/YYYY")}
                    </div>
                    <div style={{ color: "#888", fontSize: 15, marginBottom: 4 }}>
                      รหัสคำสั่ง: {item.OrderID || "-"}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <b>ประเภทบริการ:</b> {order.ServiceTypes && order.ServiceTypes.length > 0
                        ? order.ServiceTypes.map((st: any) => st.name || st.type || "-").join(", ")
                        : "-"}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <b>น้ำยา:</b> {order.detergents && order.detergents.length > 0
                        ? order.detergents.map((dt: any) => dt.name || dt.type || "-").join(", ")
                        : "-"}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <b>ราคา:</b> {
                        order.service_types && order.service_types.length > 0
                          ? `${order.service_types.reduce((sum: number, st: any) => sum + (st.price || 0), 0)} บาท`
                          : "-"
                      }
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ marginBottom: 6 }}>
                      <Tag color={item.status === "เสร็จสิ้น" ? "green" : item.status === "กำลังดำเนินการ" ? "blue" : "orange"}>
                        {item.status || "-"}
                      </Tag>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  <Button type="primary" ghost>ซื้ออีกครั้ง</Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </CustomerSidebar>
  );
};

export default HistoryPage;