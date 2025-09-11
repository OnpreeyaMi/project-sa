import React, { useEffect, useState } from "react";
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";
import { Tag, Button, Spin, message, Card as AntCard } from "antd";
import { fetchOrderHistories } from "../../../services/orderService";
import type { OrderHistory } from "../../../interfaces/types";
import dayjs from "dayjs";
import iconWashing from '../../../assets/iconWashing.png';

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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 0' }}>
        <div style={{ marginBottom: 24 }}>
        </div>
        {loading ? (
          <Spin tip="กำลังโหลด..." />
        ) : (
          data.map((item, idx) => {
            const order = item || {};
            return (
              <AntCard
                key={order.id || idx}
                hoverable
                style={{ marginBottom: 32, borderRadius: 16, boxShadow: '0 2px 8px #eee' }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <Tag color="#eee" style={{ fontWeight: 600, fontSize: 18, color: '#888', marginRight: 12 }}>#{order.OrderID || '-'}</Tag>
                    <div style={{ fontSize: 16, color: '#888', marginRight: 18 }}>
                      วันที่สั่ง: {item.CreatedAt ? dayjs(item.CreatedAt).format('DD/MM/YYYY') : '-'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Tag color={item.order?.Payment?.PaymentStatus === 'paid' ? 'green' : item.order?.Payment?.PaymentStatus === 'pending' ? 'orange' : 'default'} style={{ fontWeight: 600, fontSize: 16 }}>
                      {item.order?.Payment?.PaymentStatus || '-'}
                    </Tag>
                    <Tag color={item.Status === 'เสร็จสิ้น' ? 'green' : item.Status === 'กำลังดำเนินการ' ? 'blue' : 'orange'} style={{ fontWeight: 600, fontSize: 16 }}>
                      {item.Status || '-'}
                    </Tag>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <img src={iconWashing} alt="product" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', background: '#f6f6f6' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{item.order?.service_types && item.order.service_types.length > 0 ? item.order.service_types.map((st: any) => st.name).join(", ") : '-'}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>{item.order?.order_note || ''}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      ถังที่เลือก: {
                        item.order?.LaundryProcesses && item.order.LaundryProcesses.length > 0 && item.order.LaundryProcesses[0].Machines && item.order.LaundryProcesses[0].Machines.length > 0
                          ? item.order.LaundryProcesses[0].Machines.map((m: any) => m.Machine_type).join(", ")
                          : '-'
                      }
                    </div>
                    <div style={{ color: '#888', fontSize: 15 }}>น้ำยา: {item.order?.detergents && item.order.detergents.length > 0 ? item.order.detergents.map((dt: any) => dt.name).join(", ") : '-'}</div>
                    <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 4, margin: '8px 0' }}>
                      <div style={{ width: '60%', height: '100%', background: '#ED8A19', borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>฿{item.order?.service_types && item.order.service_types.length > 0 ? item.order.service_types.reduce((sum: number, st: any) => sum + (st.price || 0), 0) : '-'}</div>
                    <Tag color={(item.Status === "เสร็จสิ้น" ? "green" : item.Status === "กำลังดำเนินการ" ? "blue" : "orange")} style={{ fontWeight: 600, fontSize: 15 }}>
                      {item.Status || "-"}
                    </Tag>
                    
                  </div>
                </div>
              </AntCard>
            );
          })
        )}
      </div>
    </CustomerSidebar>
  );
};

export default HistoryPage;