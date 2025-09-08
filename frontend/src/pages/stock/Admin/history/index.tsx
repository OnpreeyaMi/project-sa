import { useEffect, useState } from "react";
import { Table, Typography, Card } from "antd";
import { getPurchaseDetergentHistory } from "../../../../services/stockService";
import AdminSidebar from "../../../../component/layout/admin/AdminSidebar";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const columns = [
  { 
    title: "วันที่ซื้อ", 
    dataIndex: "CreatedAt", 
    key: "CreatedAt", 
    render: (d: string) => {
      if (!d) return "-";
      // รองรับทั้ง ISO, Date, และ timestamp
      let dateObj;
      if (typeof d === "number") {
        dateObj = new Date(d);
      } else if (typeof d === "string" && d.match(/^[0-9]+$/)) {
        dateObj = new Date(Number(d));
      } else {
        dateObj = new Date(d);
      }
      if (isNaN(dateObj.getTime())) return "-";
      // แสดงวัน/เดือน/ปี/เวลาแบบไทย
      return dateObj.toLocaleString('th-TH', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    }
  },
  { title: "ชื่อสินค้า", dataIndex: ["Detergent", "Name"], key: "DetergentName" },
  { title: "จำนวน", dataIndex: "Quantity", key: "Quantity" },
  { title: "ราคา", dataIndex: "Price", key: "Price" },
  { title: "Supplier", dataIndex: "Supplier", key: "Supplier" },
  { 
    title: "ผู้บันทึก", 
    key: "UserName", 
    render: (_: any, record: any) => {
      // แสดงชื่อผู้สั่งซื้อจาก User (ถ้ามี)
      return record.User?.Name || record.User?.FirstName || "-";
    }
  },
];

const PurchaseHistoryPage = () => {
  const [data, setData] = useState<any[]>([]);
  const navigate = useNavigate();
  useEffect(() => {
    getPurchaseDetergentHistory().then(res => {
      if (Array.isArray(res)) {
        setData(res);
      } else if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    });
  }, []);
  return (
    <AdminSidebar>
      <Card style={{ margin: 32 }}>
        <Title level={4}>ประวัติการสั่งซื้อน้ำยา</Title>
        <Table columns={columns} dataSource={data} rowKey="ID" />
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
