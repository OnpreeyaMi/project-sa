import { useEffect, useState } from "react";
import { Typography, Card } from "antd";
import { getPurchaseDetergentHistory } from "../../../../services/stockService";
import AdminSidebar from "../../../../component/layout/admin/AdminSidebar";
import { useNavigate } from "react-router-dom";
import { CheckCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const getTypeInfo = (type: string) => {
  if (type === 'CREATE') return { color: '#43A047', icon: <CheckCircleOutlined /> };
  if (type === 'UPDATE') return { color: '#20639B', icon: <EditOutlined /> };
  if (type === 'DELETE') return { color: '#ED553B', icon: <DeleteOutlined /> };
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

const TimelineHistory = ({ data }: { data: any[] }) => (
  <div style={{ padding: '32px 0', maxWidth: 600, margin: '0 auto' }}>
    {data.length === 0 ? (
      <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>ไม่มีประวัติการสั่งซื้อ</div>
    ) : (
      <div style={{ borderLeft: '3px solid #eaeaea', paddingLeft: 32 }}>
        {data.map((item, idx) => {
          const typeInfo = getTypeInfo(item.Type || 'CREATE');
          return (
            <div key={item.ID || idx} style={{ position: 'relative', marginBottom: 36 }}>
              <div style={{ position: 'absolute', left: -40, top: 0 }}>
                <span style={{ background: typeInfo.color, color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 2px 8px #eaeaea' }}>
                  {typeInfo.icon}
                </span>
              </div>
              <div style={{ marginLeft: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 18, color: typeInfo.color, marginRight: 10 }}>
                  {item.Type || 'CREATE'}
                </span>
                <span style={{ fontWeight: 600, fontSize: 18 }}>{item.Detergent?.Name || '-'}</span>
                <div style={{ color: '#888', fontSize: 15, marginTop: 2 }}>{formatDate(item.CreatedAt)}</div>
                <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 10, padding: '12px 18px', fontSize: 16 }}>
                  <div><b>จำนวน:</b> {item.Quantity || '-'}</div>
                  <div><b>ราคา:</b> {item.Price || '-'}</div>
                  <div><b>Supplier:</b> {item.Supplier || '-'}</div>
                  <div><b>ผู้บันทึก:</b> ผู้ดูแล</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

const PurchaseHistoryPage = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getPurchaseDetergentHistory().then(res => {
      let historyArr = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      historyArr.sort((a: any, b: any) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
      setData(historyArr);
    });
  }, []);
  return (
    <AdminSidebar>
      <Card style={{ margin: 32, borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minHeight: 500 }}>
        <Title level={4} style={{ marginBottom: 24 }}>ประวัติการสั่งซื้อน้ำยา</Title>
        <TimelineHistory data={data} />
        <div style={{ textAlign: "right", marginTop: 24 }}>
          <button
            style={{ padding: "8px 24px", fontSize: 16, borderRadius: 6, background: "#1677ff" , color: "#fff", border: "none", cursor: "pointer" }}
            onClick={() => navigate("/admin/stock")}
          >
            กลับไปหน้าคลังสินค้า
          </button>
        </div>
      </Card>
    </AdminSidebar>
  );
};

export default PurchaseHistoryPage;
