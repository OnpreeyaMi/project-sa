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
  createDetergentWithPurchase,
  getAllDetergents,
  deleteDetergent, // เพิ่ม import
} from "../../../services/stockService";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../component/layout/admin/AdminSidebar";
import { RiDeleteBin5Line } from "react-icons/ri";

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

const StockAdminPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useItemModal, setUseItemModal] = useState<{visible: boolean, item?: StockItem}>({visible: false});
  const [form] = Form.useForm();
  const [useItemForm] = Form.useForm();
  const navigate = useNavigate();

  const handleDelete = (key: number) => {
    setStockData(stockData.filter((item) => item.key !== key));
  };

  const handleDelete = async (key: number) => {
    try {
      await deleteDetergent(key);
      message.success("ลบสินค้าสำเร็จ");
      fetchStockData(); // refresh ข้อมูลใหม่
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const handleAddStock = async (values: any) => {
    try {
      // สมมุติ UserID และ CategoryID เป็น 1 (ควรดึงจริงจากระบบ)
      const detergentTypeMap: Record<string, number> = {
        detergent: 1, // น้ำยาซักผ้า
        softener: 2,  // น้ำยาปรับผ้านุ่ม
      };
      const categoryId = detergentTypeMap[values.type] || 1;
      const userId = 1; // สมมุติ admin id

      await createDetergentWithPurchase({
        detergent: {
          Name: values.name,
          Type: values.type,
          InStock: values.quantity,
          UserID: userId,
          CategoryID: categoryId,
        },
        purchase: {
          Quantity: values.quantity,
          Price: values.price,
          Supplier: values.supplier || "",
          UserID: userId,
        },
      });
      message.success("เพิ่มสินค้าและบันทึกการจัดซื้อสำเร็จ");
      setIsModalVisible(false);
      form.resetFields();
      fetchStockData(); // เพิ่มบรรทัดนี้เพื่อ refresh ข้อมูลทันทีหลังเพิ่ม
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
    // TODO: call backend to decrease stock and log usage
    // ตัวอย่าง mock
    // await useDetergent({ id: item.key, quantity: values.quantity, reason: values.reason, orderId: values.orderId });
    message.success("บันทึกการใช้สินค้าเรียบร้อย");
    setUseItemModal({visible: false});
    useItemForm.resetFields();
    fetchStockData();
  };

  return (
    <AdminSidebar>
      <Title
        level={4}
        style={{ textAlign: "center", marginTop: 30, marginBottom: 30 }}
      >
        สินค้าที่มีอยู่ในสต็อก
      </Title>

      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 20 }}>
        <Card
          style={{
            width: 400,
            height: 200,
            margin: 20,
            backgroundColor: "#F9FBFF",
          }}
        >
          <Text
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 50,
              fontWeight: "bold",
            }}
          >
            30
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", fontSize: 16 }}
          >
            ยอดใช้งานวันนี้
          </Text>
        </Card>
        <Card
          style={{
            width: 400,
            height: 200,
            margin: 20,
            backgroundColor: "#F9FBFF",
          }}
        >
          <Text
            style={{
              display: "block",
              textAlign: "center",
              fontSize: 50,
              fontWeight: "bold",
            }}
          >
            20
          </Text>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", fontSize: 16 }}
          >
            ยอดใช้งานเดือนนี้
          </Text>
        </Card>
      </Row>

      <Row justify="center" style={{ marginBottom: 20 }}>
        <Space>
          <Button
            type="primary"
            style={{ height: 40, fontSize: 16 }}
            onClick={() => setIsModalVisible(true)}
          >
            เพิ่มรายการสินค้า
          </Button>
          <Button
            type="primary"
            style={{ height: 40, fontSize: 16 }}
            onClick={() => navigate("/admin/stock/history")}
          >
            ประวัติการซื้อสินค้า
          </Button>
        </Space>
      </Row>

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
                <Popconfirm
                  title="คุณแน่ใจหรือไม่ที่จะลบสินค้า?"
                  onConfirm={() => handleDelete(item.key)}
                  okText="ใช่"
                  cancelText="ยกเลิก"
                >
                  <RiDeleteBin5Line type="link"  style={{ minWidth: 90 ,height: 20, color: '#ED553B' }}>ลบ</RiDeleteBin5Line>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        title={<span style={{ color: '#20639B', fontWeight: 'bold', fontSize: '20px' }}>เพิ่มรายการสินค้า</span>} 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"

        onOk={() => form.submit()}
        style={{ top: '15%', textAlign: 'center' }}
        
      >
        <Form form={form} layout="vertical" onFinish={handleAddStock}>
          <Form.Item
            name="name"
            label="ชื่อสินค้า"
            rules={[{ required: true, message: "กรุณากรอกชื่อสินค้า" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="ประเภทสินค้า"
            rules={[{ required: true, message: "กรุณาเลือกประเภทสินค้า" }]}
          >
            <Select placeholder="เลือกประเภทสินค้า">
              <Option value="detergent">น้ำยาซักผ้า</Option>
              <Option value="softener">น้ำยาปรับผ้านุ่ม</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="จำนวน"
            rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="ราคา"
            rules={[{ required: true, message: "กรุณากรอกราคา" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="supplier" label="Supplier">
            <Input />
          </Form.Item>
        </Form>
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
          <Form.Item name="quantity" label="จำนวนที่ใช้" rules={[{ required: true, message: 'กรุณากรอกจำนวนที่ใช้' }]}> <InputNumber min={1} max={useItemModal.item?.quantity || 1} style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="reason" label="เหตุผล" rules={[{ required: true, message: 'กรุณาเลือกเหตุผล' }]}> <Select placeholder="เลือกเหตุผล"> <Option value="ล้างเครื่อง">ล้างเครื่อง</Option> <Option value="ทดลอง">ทดลอง</Option> <Option value="เสียหาย">เสียหาย</Option> <Option value="อื่น ๆ">อื่น ๆ</Option> </Select> </Form.Item>
          <Form.Item name="orderId" label="เลข Order (ถ้ามี)"> <Input placeholder="กรอกเลข Order หรือเลือกจากรายการ" /> </Form.Item>
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
    </AdminSidebar>
  );
};

export default StockAdminPage;
