import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Input,
  InputNumber,
  Form,
  Select,
  message,
} from "antd";
import {
  getAllDetergents,
  getDetergentUsageHistory, 
  useDetergent
} from "../../../services/stockService";
import { useNavigate } from "react-router-dom";
import EmployeeSidebar from "../../../component/layout/employee/empSidebar";
import { TbBackground } from "react-icons/tb";
import { useUser } from "../../../hooks/UserContext";

const { Title, Text } = Typography;
const { Option } = Select;

interface StockItem {
  key: number;
  name: string;
  quantity: number;
  type: string;
  lastUpdated: string;
  editor: string;
  image: string;
}

const StockEmployeePage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [useItemModal, setUseItemModal] = useState<{visible: boolean, item?: StockItem}>({visible: false});
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [useItemForm] = Form.useForm();
  const navigate = useNavigate();
  const { user } = useUser();

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
        detergents.map((d: any) => ({
          key: d.ID, // ใช้ d.ID จริง
          ID: d.ID,  // เพิ่ม field ID
          name: d.Name,
          type: d.Type,
          quantity: d.InStock,
          lastUpdated: d.UpdatedAt,
          editor: d.UserID ? `User ${d.UserID}` : "-",
          image: d.Image || d.image || "", // map รูปภาพ
        }))
      );
    } catch (err) {
      // สามารถแจ้งเตือน error ได้
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
    console.log('เปิด modal ใช้สินค้า:', item);
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
      const payload: any = {
        user_id: user?.id, // ส่ง user_id ของคนที่ login
        detergent_id: item.key,
        quantity_used: values.quantity,
        reason: values.reason
      };
      if (values.orderId) {
        payload.order_id = values.orderId;
      }
      console.log('ส่งข้อมูลไป backend:', payload);
      await useDetergent(payload);
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
      {/* DASHBOARD SECTION */}
      <div style={{ width: '100%', background: '#fff', borderRadius: 32, padding: '32px 0 24px 0', marginBottom: 32, position: 'relative', boxShadow: '0 4px 32px rgba(32,99,155,0.10)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', width: '100%' }}>
            <span style={{ fontSize: 32 }}>📦</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#20639B' }}>คลังสินค้า</div>
              <div style={{ fontSize: 16, color: '#888', fontWeight: 400 }}>น้ำยาซักผ้าและปรับผ้านุ่ม</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 32, width: '100%', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: 220, background: '#3BAEA3', borderRadius: 20, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 16px #173F5F40' }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}><img src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" alt="chart" style={{ width: 38, height: 38 }} /></div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stockData.length}</div>
              <div style={{ fontSize: 16 }}>รายการทั้งหมด</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, background: '#F7D55C', borderRadius: 20, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 16px #F6D55C40' }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}><img src="https://cdn-icons-png.flaticon.com/512/1828/1828849.png" alt="warning" style={{ width: 38, height: 38 }} /></div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stockData.filter(i => i.quantity < 10 && i.quantity > 0).length}</div>
              <div style={{ fontSize: 16 }}>สินค้าใกล้หมด</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, background: '#FE6F91', borderRadius: 20, padding: 24, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 2px 16px #ED553B40' }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}><img src="https://cdn-icons-png.flaticon.com/512/1828/1828859.png" alt="no-stock" style={{ width: 38, height: 38 }} /></div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stockData.filter(i => i.quantity === 0).length}</div>
              <div style={{ fontSize: 16 }}>สินค้าหมดสต็อก</div>
            </div>
          </div>
        </div>
      </div>

      {/* รายการสินค้าในสต็อก */}
      <div style={{ maxWidth: 1200, margin: '0 auto', marginTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#444', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span role="img" aria-label="list">📋</span> รายการสินค้าในสต็อก
          </div>
          <Button
            type="default"
            icon={<span style={{ fontSize: 20, marginRight: 4 }}>🕑</span>}
            style={{ background: 'linear-gradient(90deg, #7F7FD5 0%, #86A8E7 100%)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, boxShadow: '0 2px 8px #eaeaea', padding: '0 18px', height: 38 }}
            onClick={() => setHistoryModal(true)}
          >
            ประวัติการใช้สินค้า
          </Button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          {stockData.map(item => {
            // Card สินค้า
            let bgColor = '#EAF7EA'; // default (เขียวอ่อน)
            let statusColor = '#43A047';
            let statusText = 'เพียงพอ';
            if (item.quantity <= 10 && item.quantity > 3) {
              bgColor = '#FFF9E5'; // เหลืองอ่อน
              statusColor = '#F6D55C';
              statusText = 'ใกล้หมด';
            }
            if (item.quantity <= 3 && item.quantity > 0) {
              bgColor = '#FFF9E5'; // เหลืองอ่อน
              statusColor = '#F6D55C';
              statusText = 'ใกล้หมด';
            }
            if (item.quantity === 0) {
              bgColor = '#FDEAEA'; // แดงอ่อน
              statusColor = '#ED553B';
              statusText = 'หมดสต็อก';
            }
            return (
              <div key={item.key} style={{ width: 320, minHeight: 260, background: bgColor, borderRadius: 24, boxShadow: '0 2px 16px #eaeaea', padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 70, height: 70, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 16, background: '#fff' }} />
                    ) : (
                      <span style={{ fontSize: 38 }}>{item.type === 'detergent' ? '🧴' : item.type === 'softener' ? '✨' : '📦'}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 20, textAlign: 'center', color: '#222' }}>{item.name}</div>
                  <div style={{ fontWeight: 500, fontSize: 15, textAlign: 'center', color: statusColor, borderRadius: 8, padding: '2px 12px', marginBottom: 4 }}>{item.type === 'detergent' ? 'น้ำยาซักผ้า' : item.type === 'softener' ? 'น้ำยาปรับผ้านุ่ม' : item.type}</div>
                  <div style={{ color: '#222', fontSize: 16, marginTop: 2, textAlign: 'center', fontWeight: 500 }}>
                    <span style={{ color: statusColor }}>• คงเหลือ: {item.quantity} หน่วย</span>
                  </div> 
                  <div style={{ color: '#aaa', fontSize: 13, marginTop: 2, textAlign: 'center', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                    <span>📅 {new Date(item.lastUpdated).toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                    <span>👤 {item.editor}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 18 }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{ borderRadius: 10, background: item.quantity === 0 ? '#ccc' : '#7F7FD5', minWidth: 110, fontWeight: 600, fontSize: 16, color: '#fff', boxShadow: item.quantity === 0 ? 'none' : '0 2px 8px #7F7FD540' }}
                    disabled={item.quantity === 0}
                    onClick={() => handleUseItem(item)}
                  >
                    {item.quantity === 0 ? 'หมดสต็อก' : 'ใช้สินค้า'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        title={<span style={{ color: '#20639B', fontWeight: 'bold', fontSize: '20px' }}>ประวัติการใช้สินค้า</span>}
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
                    <div><b>จำนวนที่ใช้:</b> {h.QuantityUsed}</div>
                    <div><b>เหตุผล:</b> {h.Reason || '-'}</div>
                    <div><b>ผู้ใช้:</b> {h.User?.Employee?.FirstName || '-'}</div>
                    <div><b>วันที่:</b> {h.CreatedAt ? new Date(h.CreatedAt).toLocaleString('th-TH') : '-'}</div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Modal>

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
          <Form.Item name="quantity" label="จำนวนที่ใช้" rules={[{ required: true, message: 'กรุณากรอกจำนวนที่ใช้' }]}> 
            <InputNumber min={1} max={useItemModal.item?.quantity || 1} style={{ width: '100%' }} /> 
          </Form.Item>
          <Form.Item name="reason" label="เหตุผล" rules={[{ required: true, message: 'กรุณาเลือกเหตุผล' }]}> 
            <Select placeholder="เลือกเหตุผล"> 
              <Option value="ล้างเครื่อง">ล้างเครื่อง</Option> 
              <Option value="ทดลอง">ทดลอง</Option> 
              <Option value="เสียหาย">เสียหาย</Option> 
              <Option value="อื่น ๆ">อื่น ๆ</Option> 
            </Select> 
          </Form.Item>
          <Form.Item name="orderId" label="เลข Order (ถ้ามี)"> 
            <Input placeholder="กรอกเลข Order หรือเลือกจากรายการ" /> 
          </Form.Item>
        </Form>
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