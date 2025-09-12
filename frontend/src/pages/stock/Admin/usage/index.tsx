import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { CheckCircleOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined, PlayCircleOutlined, ExperimentOutlined, CloseCircleOutlined, QuestionCircleOutlined, ToolOutlined } from '@ant-design/icons';
import AdminSidebar from "../../../../component/layout/admin/AdminSidebar";
import { getDetergentUsageHistory } from "../../../../services/stockService";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const getTypeInfo = (Reason: string) => {
  // สำหรับการใช้งาน ให้ใช้ USE และไอคอน PlayCircle
  if (Reason === '' || Reason === 'CREATE') return { color: '#43A047', icon: <PlayCircleOutlined /> };
  if (Reason === 'UPDATE') return { color: '#20639B', icon: <EditOutlined /> };
  if (Reason === 'DELETE') return { color: '#ED553B', icon: <DeleteOutlined /> };
  if (Reason === 'ล้างเครื่อง') return { color: '#00BCD4', icon: <ToolOutlined /> }; // ล้างเครื่อง
  if (Reason === 'เสียหาย') return { color: '#FF9800', icon: <CloseCircleOutlined /> }; // เสียหาย
  if (Reason === 'ทดลอง') return { color: '#9C27B0', icon: <ExperimentOutlined /> }; // ทดลอง
  if (Reason === 'อื่นๆ') return { color: '#607D8B', icon: <QuestionCircleOutlined /> }; // อื่นๆ
  return { color: '#888', icon: <EditOutlined /> };
};

const formatDate = (d: string | number) => {
  let dateObj;
  if (typeof d === "number") {
    dateObj = new Date(d);
  } else if (typeof d === "string" && d.match(/^[0-9]+$/)) {
    dateObj = new Date(Number(d));
  } else {
    dateObj = new Date(d);
  }
  if (isNaN(dateObj.getTime())) return "-";
  return dateObj.toLocaleString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
};

const TimelineUsage = ({ data }: { data: any[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ padding: '32px 0', maxWidth: 600, margin: '0 auto' }}>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>ไม่มีประวัติการใช้งาน</div>
      ) : (
        <div style={{ borderLeft: '3px solid #eaeaea', paddingLeft: 32 }}>
          {data.map((item, idx) => {
            const typeInfo = getTypeInfo(item.Reason || 'USE');
            const isOpen = openIdx === idx;
            return (
              <div key={item.ID || idx} style={{ position: 'relative', marginBottom: 36 }}>
                <div style={{ position: 'absolute', left: -40, top: 0 }}>
                  <span style={{ background: typeInfo.color, color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 2px 8px #eaeaea' }}>
                    {typeInfo.icon}
                  </span>
                </div>
                <div style={{ marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: typeInfo.color, marginRight: 10 }}>
                    <span style={{ background: typeInfo.color, color: '#fff', borderRadius: 6, padding: '2px 12px', fontSize: 15, marginRight: 8 }}>
                      {item.Reason || 'USE'}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>{item.Detergent?.Name || '-'}</span>
                  <span
                    style={{ marginLeft: 8, cursor: 'pointer', color: '#1677ff', fontSize: 16 }}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >{isOpen ? '▲' : '▼'}</span>
                  <div style={{ color: '#888', fontSize: 15, marginTop: 2 }}>{formatDate(item.CreatedAt)}</div>
                  {isOpen && (
                    <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 10, padding: '12px 18px', fontSize: 16 }}>
                      <div><b>จำนวนที่ใช้:</b> {item.QuantityUsed || '-'}</div>
                      <div><b>หมายเหตุ:</b> {item.Reason || '-'}</div>
                      <div><b>ผู้บันทึก:</b> {item.User?.Employee?.FirstName || '-'}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UsageHistoryPage = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getDetergentUsageHistory().then(res => {
      let usageArr = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      usageArr.sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
      setData(usageArr);
    });
  }, []);
  return (
    <AdminSidebar>
      <Card style={{ margin: 32, borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minHeight: 500 }}>
        <Title level={4} style={{ marginBottom: 24 }}>ประวัติการใช้งานสินค้า</Title>
        <TimelineUsage data={data} />
        <div style={{ textAlign: "right", marginTop: 24 }}>
          <button
            style={{ padding: "8px 24px", fontSize: 16, borderRadius: 6, background: "#1677ff" , color: "#fff", border: "none", cursor: "pointer" }}
            onClick={() => navigate("/admin/stock")}
          >
            <ArrowLeftOutlined style={{ marginRight: 8 }} /> กลับไปหน้าคลังสินค้า
          </button>
        </div>
      </Card>
    </AdminSidebar>
  );
};

export default UsageHistoryPage;
