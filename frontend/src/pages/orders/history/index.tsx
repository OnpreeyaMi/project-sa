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
        const userId = localStorage.getItem("userId");
        const filtered = histories.filter((item) => {
        // สมมติ order มี field customer_id หรือ order.customer_id
        return item.Order?.CustomerID === Number(userId);
      });
        // เรียงตามเวลาล่าสุดก่อน
        filtered.sort((a, b) => {
          const dateA = new Date(a.order?.CreatedAt || a.CreatedAt).getTime();
          const dateB = new Date(b.order?.CreatedAt || b.CreatedAt).getTime();
          return dateB - dateA;
        });
        const tableData = filtered.map((item, index) => ({
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
            const order = item.Order || {};
            // ดึงสถานะล่าสุดจาก LaundryProcesses (Status เป็น string)
            const lastProcess = order.LaundryProcesses && order.LaundryProcesses.length > 0
              ? order.LaundryProcesses[order.LaundryProcesses.length - 1]
              : undefined;
            const status = lastProcess?.Status || '';
            let percent = 10;
            let label = 'รอดำเนินการ';
            switch (status) {
              case 'รอดำเนินการ':
                percent = 10; label = 'รอดำเนินการ'; break;
              case 'กำลังซัก':
                percent = 40; label = 'กำลังซัก'; break;
              case 'กำลังอบ':
                percent = 70; label = 'กำลังอบ'; break;
              case 'เสร็จสิ้น':
                percent = 100; label = 'เสร็จสิ้น'; break;
              default:
                percent = 10; label = 'รอดำเนินการ';
            }
            return (
              <AntCard
                key={order.id || idx}
                hoverable
                style={{ marginBottom: 32, borderRadius: 16, boxShadow: '0 2px 8px #eee' }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <Tag color="#eee" style={{ fontWeight: 600, fontSize: 18, color: '#888', marginRight: 12 }}>#{item.Order?.ID || '-'}</Tag>
                    <div style={{ fontSize: 16, color: '#888', marginRight: 18 }}>
                      วันที่สั่ง: {item.Order?.CreatedAt ? dayjs(item.Order?.CreatedAt).format('DD/MM/YYYY') : '-'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Tag color={item.Order?.Payment?.payment_status === 'paid' ? 'green' :  'orange' } style={{ fontWeight: 600, fontSize: 16 }}>
                      {item.Order?.Payment?.payment_status === 'paid' ? 'ชำระเงินเสร็จสิ้น' : 'ยังไม่ชำระเงิน'}
                    </Tag>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <img src={iconWashing} alt="product" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', background: item.Order?.Payment?.payment_status === 'paid' ? 'green' : 'orange' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{item.Order?.ServiceTypes && item.Order?.ServiceTypes.length > 0 ? item.Order?.ServiceTypes.map((st: any) => st.Type).join(", ") : '-'}</div>
                    <div style={{ color: '#888', fontSize: 15 }}>
                      ถังที่เลือก: {
                        item.Order?.ServiceTypes?.length ? item.Order.ServiceTypes.map((st: any) => st.Type || st.name).join(", ") : '-'
                      }
                    </div>
                    <div style={{ color: '#888', fontSize: 15 }}>น้ำยา: {item.Order?.Detergents?.length ? item.Order?.Detergents.map((dt: any) => dt.Name).join(", ") : '-'}</div>
                    <div style={{ width: '100%', height: 6, background: '#eee', borderRadius: 4, margin: '8px 0', position: 'relative' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#ED8A19', borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ color: '#ED8A19', fontWeight: 500, fontSize: 15, marginTop: 2 }}>{label}</div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 120 }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>฿{item.Order?.Payment?.total_amount || 'ยกเลิกรายการ'}</div>
                    
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