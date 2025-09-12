import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import AdminSidebar from "../../../../component/layout/admin/AdminSidebar";
import { getDeletedDetergents } from "../../../../services/stockService";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

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

const TimelineDelete = ({ data }: { data: any[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div style={{ padding: '32px 0', maxWidth: 600, margin: '0 auto' }}>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>ไม่มีประวัติการลบสินค้า</div>
      ) : (
        <div style={{ borderLeft: '3px solid #eaeaea', paddingLeft: 32 }}>
          {data.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={item.ID || idx} style={{ position: 'relative', marginBottom: 36 }}>
                <div style={{ position: 'absolute', left: -40, top: 0 }}>
                  <span style={{ background: '#ED553B', color: '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 2px 8px #eaeaea' }}>
                    <DeleteOutlined />
                  </span>
                </div>
                <div style={{ marginLeft: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 18, color: '#ED553B', marginRight: 10 }}>
                    <span style={{ background: '#ED553B', color: '#fff', borderRadius: 6, padding: '2px 12px', fontSize: 15, marginRight: 8 }}>DELETE</span>
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 18 }}>{item.Detergent?.Name || '-'}</span>
                  <span
                    style={{ marginLeft: 8, cursor: 'pointer', color: '#1677ff', fontSize: 16 }}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >{isOpen ? '▲' : '▼'}</span>
                  <div style={{ color: '#888', fontSize: 15, marginTop: 2 }}>{formatDate(item.CreatedAt)}</div>
                  {isOpen && (
                    <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 10, padding: '12px 18px', fontSize: 16 }}>
                      <div><b>จำนวนที่ลบ:</b> {item.QuantityDeleted || '-'}</div>
                      <div><b>หมายเหตุ:</b> {item.Note || '-'}</div>
                      <div><b>ผู้บันทึก:</b> ผู้ดูแล</div>
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

const DeleteHistoryPage = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getDeletedDetergents().then(res => {
      let deleteArr = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : [];
      deleteArr.sort((a: any, b: any) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
      setData(deleteArr);
    });
  }, []);
  return (
    <AdminSidebar>
      <Card style={{ margin: 32, borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minHeight: 500 }}>
        <Title level={4} style={{ marginBottom: 24 }}>ประวัติการลบสินค้า</Title>
        <TimelineDelete data={data} />
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

export default DeleteHistoryPage;
