import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Typography,
  Button,
  Space,
  Popconfirm,
  Modal,
  Input,
  InputNumber,
  Form,
  Select,
  message,
} from "antd";
import {
  getAllDetergents,
  getPurchaseDetergentHistory,
  getDetergentUsageHistory, useDetergent
} from "../../../services/stockService";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../../component/layout/employee/empSidebar";

const { Title, Text } = Typography;
const { Option } = Select;

interface StockItem {
  key: number;
  name: string;
  quantity: number;
  type: string;
  lastUpdated: string;
  editor: string;
}

const StockEmployeePage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useItemModal, setUseItemModal] = useState<{visible: boolean, item?: StockItem}>({visible: false});
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [useItemForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStockData();
    fetchUsageHistory();
    // eslint-disable-next-line
  }, []);

  const fetchStockData = async () => {
    try {
      const res = await getAllDetergents();
      const detergents = res.data || [];
      setStockData(
        detergents.map((d: any, idx: number) => ({
          key: d.ID || idx + 1,
          name: d.Name,
          type: d.Type,
          quantity: d.InStock,
          lastUpdated: d.UpdatedAt,
          editor: d.UserID ? `User ${d.UserID}` : "-",
        }))
      );
    } catch (err) {
      // สามารถแจ้งเตือน error ได้
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const res = await getPurchaseDetergentHistory();
      setHistoryData(res.data || []);
      setHistoryModal(true);
    } catch {
      message.error('โหลดประวัติการลด stock ไม่สำเร็จ');
    }
  };

  const fetchUsageHistory = async () => {
    try {
      const res = await getDetergentUsageHistory();
      setHistoryData(res.data || []);
    } catch {
      message.error('โหลดประวัติการใช้สินค้าไม่สำเร็จ');
    }
  };

  const handleUseItem = (item: StockItem) => {
    setUseItemModal({visible: true, item});
  };

  const handleUseItemSubmit = async (values: any) => {
    const item = useItemModal.item;
    if (!item) return;
    if (values.quantity <= 0) {
      message.error("จำนวนที่ใช้ต้องมากกว่า 0");
      return;
    }
    if (values.quantity > item.quantity) {
      message.error("สินค้าไม่เพียงพอ");
      return;
    }
    try {
      // สมมุติ user_id = 1 (ควรดึงจาก auth จริง)
      await useDetergent({
        user_id: 1,
        detergent_id: item.key,
        quantity: values.quantity,
        reason: values.reason
      });
      message.success("บันทึกการใช้สินค้าเรียบร้อย");
      setUseItemModal({visible: false});
      useItemForm.resetFields();
      fetchStockData();
      fetchUsageHistory(); // refresh ประวัติการใช้
    } catch (err: any) {
      message.error(err?.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <EmployeeSidebar>
      <Title
        level={4}
        style={{ textAlign: "center", marginTop: 30, marginBottom: 30 }}
      >
        สินค้าที่มีอยู่ในสต็อก
      </Title>


      {/* Card List แสดงรายการสินค้า */}
      <div style={{ background: '#f6f6f8', minHeight: '100vh', padding: '32px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {stockData.map(item => (
            <div
              key={item.key}
              style={{
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 12px #eee',
                marginBottom: 22,
                padding: '22px 28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                {/* ไอคอนสินค้า */}
                <div style={{ width: 54, height: 54, borderRadius: 12, background: item.type === 'detergent' ? '#e3f2fd' : '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* สามารถเปลี่ยนเป็นไอคอนจริงตามประเภทสินค้าได้ */}
                  <span style={{ fontSize: 32 }}>{item.type === 'detergent' ? '🧴' : item.type === 'softener' ? '🧴' : '📦'}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{item.name}</div>
                  <div style={{ color: '#888', fontSize: 15 }}>{item.type === 'detergent' ? 'น้ำยาซักผ้า' : item.type === 'softener' ? 'น้ำยาปรับผ้านุ่ม' : item.type}</div>
                  <div style={{ color: '#222', fontSize: 15, marginTop: 2 }}>
                    จำนวนคงเหลือ: <b>{item.quantity}</b>
                    {item.quantity < 10 && item.quantity > 0 && (
                      <span style={{ color: '#ED553B', fontWeight: 600, marginLeft: 8, fontSize: 15, background: '#fff3e0', borderRadius: 6, padding: '2px 10px' }}>ใกล้หมด</span>
                    )}
                  </div>
                  <div style={{ color: '#aaa', fontSize: 13, marginTop: 2 }}>แก้ไขล่าสุด: {new Date(item.lastUpdated).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                  <div style={{ color: '#aaa', fontSize: 13 }}>ผู้แก้ไข: {item.editor}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button
                  type="default"
                  size="small"
                  style={{ borderRadius: 8, border: '1.5px solid #ED553B', color: '#ED553B', minWidth: 90 }}
                  disabled={item.quantity === 0}
                  onClick={() => handleUseItem(item)}
                >ใช้สินค้า</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="primary"
        style={{ height: 40, fontSize: 16, marginBottom: 18 }}
        onClick={fetchPurchaseHistory}
      >
        ประวัติการใช้สินค้า
      </Button>

      <Modal
        title={<span style={{ color: '#ED553B', fontWeight: 'bold', fontSize: '20px' }}>ใช้สินค้า</span>}
        open={useItemModal.visible}
        onCancel={() => { setUseItemModal({visible: false}); useItemForm.resetFields(); }}
        onOk={() => useItemForm.submit()}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        style={{ top: '15%', textAlign: 'center' }}
      >
        <Form form={useItemForm} layout="vertical" onFinish={handleUseItemSubmit}>
          <Form.Item name="quantity" label="จำนวนที่ใช้" rules={[{ required: true, message: 'กรุณากรอกจำนวนที่ใช้' }]}> <InputNumber min={1} max={useItemModal.item?.quantity || 1} style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="reason" label="เหตุผล" rules={[{ required: true, message: 'กรุณาเลือกเหตุผล' }]}> <Select placeholder="เลือกเหตุผล"> <Option value="ล้างเครื่อง">ล้างเครื่อง</Option> <Option value="ทดลอง">ทดลอง</Option> <Option value="เสียหาย">เสียหาย</Option> <Option value="อื่น ๆ">อื่น ๆ</Option> </Select> </Form.Item>
          <Form.Item name="orderId" label="เลข Order (ถ้ามี)"> <Input placeholder="กรอกเลข Order หรือเลือกจากรายการ" /> </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<span style={{ color: '#20639B', fontWeight: 'bold', fontSize: '20px' }}>ประวัติการลด stock</span>}
        open={historyModal}
        onCancel={() => setHistoryModal(false)}
        footer={null}
        width={700}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {historyData.length === 0 ? (
            <Text type="secondary">ไม่มีข้อมูล</Text>
          ) : (
            historyData.map((h, idx) => (
              <Card key={idx} style={{ marginBottom: 12, borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div><b>สินค้า:</b> {h.Detergent?.Name || '-'}</div>
                    <div><b>จำนวนที่ลด:</b> {h.Quantity}</div>
                    <div><b>ราคา:</b> {h.Price || '-'}</div>
                    <div><b>ผู้ใช้:</b> {h.User?.Name || '-'}</div>
                    <div><b>วันที่:</b> {h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('th-TH') : '-'}</div>
                  </div>
                  <div style={{ color: '#888', fontSize: 13 }}>{h.Supplier ? `Supplier: ${h.Supplier}` : ''}</div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Modal>

      {/* Add styles for row backgrounds */}
      <style>
      {`
      .detergent-row {
        background-color: #f4fbff !important; /* ฟ้าอ่อนมาก */
      }
      .softener-row {
        background-color: #fff8f0 !important; /* ส้มอ่อนมาก */
      }
      `}
      </style>
    </EmployeeSidebar>
  );
};

export default StockEmployeePage;