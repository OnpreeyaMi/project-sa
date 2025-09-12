import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Typography,
  Button,
  Modal,
  Input,
  InputNumber,
  Form,
  Select,
  message,
  Col,
  Tooltip,
  Upload,
} from "antd";
import {
  createDetergentWithPurchase,
  getAllDetergents,
  deleteDetergent,
  useDetergent,
  getDetergentUsageHistory,
  updateDetergentStock,
  getDeletedDetergents,
} from "../../../services/stockService";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../component/layout/admin/AdminSidebar";
import { FaChartBar,  FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { BsFillBarChartFill } from "react-icons/bs";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

interface StockItem {
  key: number;
  name: string;
  quantity: number;
  type: string;
  lastUpdated: string;
  editor: string;
  image: string; // เพิ่ม property image
}

const StockAdminPage: React.FC = () => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useItemModal, setUseItemModal] = useState<{
    visible: boolean;
    item?: StockItem;
  }>({ visible: false });
  const [form] = Form.useForm();
  const [useItemForm] = Form.useForm();
  const [historyModal, setHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [usageHistoryAll, setUsageHistoryAll] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  // State สำหรับสินค้าที่ถูกลบจาก backend
  const [deletedItems, setDeletedItems] = useState<StockItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStockData();
    fetchUsageHistory();
    // ดึงข้อมูลครั้งเดียวตอน mount ไม่เกิด loop
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
      setUsageHistoryAll(res.data || []);
      setHistoryData(res.data || []);
    } catch {
      message.error("โหลดประวัติการใช้สินค้าไม่สำเร็จ");
    }
  };

  const fetchUsageHistoryForItem = async (key: number) => {
    let allHistory = usageHistoryAll;
    if (!allHistory || allHistory.length === 0) {
      const res = await getDetergentUsageHistory();
      allHistory = res.data || [];
      setUsageHistoryAll(allHistory);
    }
    const itemHistory = allHistory.filter(
      (h: any) =>
        h.detergent_id === key ||
        h.DetergentID === key ||
        (h.Detergent && h.Detergent.ID === key)
    );
    setHistoryData(itemHistory);
  };

  const handleDelete = async (key: number) => {
    try {
      const item = stockData.find(i => i.key === key);
      await deleteDetergent(key);
      message.success("ลบสินค้าสำเร็จ");
      if (item) setDeletedItems(prev => [...prev, item]);
      fetchStockData(); // refresh ข้อมูลใหม่
      fetchUsageHistory(); // อัพเดทการ์ดการใช้งานเดือนนี้ทันที
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  const handleAddStock = async (values: any) => {
    try {
      const detergents = stockData;
      const exist = detergents.find(
        (d) => d.name === values.name && d.type === values.type
      );
      const detergentTypeMap: Record<string, number> = {
        detergent: 1,
        softener: 2,
      };
      const categoryId = detergentTypeMap[values.type] || 1;
      const userId = 1; // สมมุติ admin id
      const image = uploadedImage || null;
      if (exist) {
        await updateDetergentStock(exist.key, values.quantity);
        message.success("อัพเดทจำนวนสินค้าเดิมสำเร็จ");
      } else {
        await createDetergentWithPurchase({
          detergent: {
            Name: values.name,
            Type: values.type,
            InStock: values.quantity,
            UserID: userId,
            CategoryID: categoryId,
            Image: image || "",
          },
          purchase: {
            Quantity: values.quantity,
            Price: values.price,
            Supplier: values.supplier || "",
            UserID: userId,
            Image: image || "",
          },
        });
        message.success("เพิ่มสินค้าใหม่และบันทึกการจัดซื้อสำเร็จ");
      }
      setIsModalVisible(false);
      form.resetFields();
      setUploadedImage(null);
      fetchStockData();
      fetchUsageHistory(); // อัพเดทการ์ดการใช้งานเดือนนี้ทันที
    } catch (err) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  const handleUseItem = (item: StockItem) => {
    setUseItemModal({ visible: true, item });
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
      const payload: any = {
        user_id: 1,
        detergent_id: item.key,
        quantity_used: values.quantity,
        reason: values.reason,
      };
      if (values.orderId) {
        payload.order_id = values.orderId;
      }
      await useDetergent(payload);
      message.success("บันทึกการใช้สินค้าเรียบร้อย");
      setUseItemModal({ visible: false });
      useItemForm.resetFields();
      fetchStockData();
      fetchUsageHistory(); // อัพเดทการ์ดการใช้งานเดือนนี้ทันที
    } catch (err: any) {
      message.error(err?.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  // สรุปจำนวนรวม
  const totalStock = stockData.reduce((sum, item) => sum + item.quantity, 0);
  const highStock = stockData.filter((item) => item.quantity > 50);
  const lowStock = stockData.filter(
    (item) => item.quantity <= 10 && item.quantity > 0
  );
  const outStock = stockData.filter((item) => item.quantity === 0);

  // สินค้าต้องเฝ้าระวัง (เหลือน้อย)
  const watchList = stockData.filter(item => item.quantity <= 10);

  // Helper function: get usage summary by month
  function getMonthlyUsage(history: any[], month: number, year: number) {
    return history.filter(h => {
      const d = new Date(h.CreatedAt);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).reduce((sum, h) => sum + (h.QuantityUsed || 0), 0);
  }

  // Helper function: forecast next month usage (simple average)
  function forecastUsage(history: any[], months: number = 3) {
    const now = new Date();
    let total = 0;
    let count = 0;
    for (let i = 0; i < months; i++) {
      const month = now.getMonth() + 1 - i;
      const year = now.getFullYear();
      const usage = getMonthlyUsage(history, month, year);
      if (usage > 0) {
        total += usage;
        count++;
      }
    }
    return count ? Math.round(total / count) : 0;
  }

  // Filter & Search State
  // (Removed duplicate declarations of searchText, filterCategory, filterStatus)

  // Filtered stock data
  const filteredStock = stockData.filter(item => {
    // Search by name
    const matchName = item.name.toLowerCase().includes(searchText.toLowerCase());
    // Filter by category
    const matchCategory = filterCategory ? item.type === filterCategory : true;
    // Filter by status
    let matchStatus = true;
    if (filterStatus === "หมด") matchStatus = item.quantity === 0;
    else if (filterStatus === "ใกล้หมด") matchStatus = item.quantity > 0 && item.quantity <= 10;
    else if (filterStatus === "เพียงพอ") matchStatus = item.quantity > 10;
    return matchName && matchCategory && matchStatus;
  });

  return (
    <AdminSidebar>
      {/* Header Gradient */}
      <div style={{
        width: '100%',
        padding: '32px 0 24px 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0 0 32px 32px',
        boxShadow: '0 4px 24px #eaeaea',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        marginBottom: 32
      }}>
        <FaChartBar size={48} style={{ color: '#fff', marginLeft: 32 }} />
        <div>
          <Title level={2} style={{ margin: 0, color: '#fff' }}>คลังสินค้า</Title>
          <Text type="secondary" style={{ color: '#fff' }}>ระบบติดตามและวิเคราะห์สต็อก พร้อมคำแนะนำการจัดซื้อ</Text>
        </div>
      </div>

      {/* Card สถิติแบบ Gradient */}
      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          <Card style={{ background: '#20639B', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 36, minWidth: 240, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{totalStock}</div>
            <div style={{ fontSize: 22, color: '#fff', fontWeight: 500 }}>จำนวนสินค้าทั้งหมด</div>
          </Card>
          <Card style={{ background: '#3BAEA3', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 36, minWidth: 240, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{highStock.length}</div>
            <div style={{ fontSize: 22, color: '#fff', fontWeight: 500 }}>สินค้าคงเหลือสูง</div>
          </Card>
          <Card style={{ background: '#F7D55C', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 36, minWidth: 240, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{lowStock.length}</div>
            <div style={{ fontSize: 22, color: '#fff', fontWeight: 500 }}>ใกล้หมด</div>
          </Card>
          <Card style={{ background: '#FE6F91', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 36, minWidth: 240, minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 44, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{outStock.length}</div>
            <div style={{ fontSize: 22, color: '#fff', fontWeight: 500 }}>หมดแล้ว</div>
          </Card>
        </div>
      </Row>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
        <Card style={{ background: '#fff', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minWidth: 340, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 32, marginRight: 12 }}>
              <FaCheckCircle size={32} style={{ color: '#43A047' }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#2196F3' }}>การใช้งานเดือนนี้</span>
          </div>
          {/* Usage summary calculation */}
          {(() => {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const usageThisMonth = getMonthlyUsage(usageHistoryAll, month, year);
            const usageLastMonth = getMonthlyUsage(usageHistoryAll, month === 1 ? 12 : month - 1, month === 1 ? year - 1 : year);
            const percentChange = usageLastMonth ? ((usageThisMonth - usageLastMonth) / usageLastMonth * 100).toFixed(1) : '0';
            const forecast = forecastUsage(usageHistoryAll, 3);
            return (
              <>
                <div style={{ fontSize: 40, fontWeight: 700, color: '#43A047', marginBottom: 4 }}>{usageThisMonth}</div>
                <div style={{ color: '#43A047', fontSize: 18, marginBottom: 4 }}>ใช้งานแล้ว (ขวด)</div>
                <div style={{ color: Number(percentChange) < 0 ? '#E53935' : '#43A047', fontSize: 16, marginBottom: 8 }}>
                  {Number(percentChange) < 0 ? '↓' : '↑'} {Math.abs(Number(percentChange))}% เทียบเดือนก่อน
                </div>
                <div style={{ color: '#2196F3', fontSize: 16 }}>คาดการณ์ความต้องการ <span style={{ fontWeight: 700 }}>{forecast} ขวด/เดือน</span></div>
              </>
            );
          })()}
        </Card>
        <Card style={{ background: '#FFF7E6', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', padding: 32, minWidth: 340, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 32, marginRight: 12 }}>
              <FaExclamationTriangle size={32} style={{ color: '#E53935' }} />
            </span>
            <span style={{ fontWeight: 700, fontSize: 22, color: '#E53935' }}>สินค้าเฝ้าระวัง</span>
          </div>
          {watchList.length === 0 ? (
            <div style={{ color: '#43A047', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>ไม่มีสินค้าเฝ้าระวัง</div>
          ) : (
            watchList.map((item, idx) => (
              <div key={item.key} style={{ color: '#E53935', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                {item.name} <span style={{ fontWeight: 700 }}>{item.quantity} ขวด</span>
              </div>
            ))
          )}
        </Card>
      </div>

      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 , gap: 12 }}>
        <Button
          type="default"
          icon={<UploadOutlined />}
          style={{ height: 44, fontSize: 17, borderRadius: 12, boxShadow: '0 2px 8px #6DA3D340', background: '#F9FBFF', border: '1.5px solid #6DA3D3', color: '#20639B', fontWeight: 600, letterSpacing: 1 }}
          onClick={() => setIsModalVisible(true)}
        >
          เพิ่มรายการสินค้า
        </Button>
        <Button
          type="default"
          icon={<FaChartBar style={{ color: '#20639B' }} />}
          style={{ height: 44, fontSize: 17, borderRadius: 12, boxShadow: '0 2px 8px #20639B30', background: '#F9FBFF', border: '1.5px solid #20639B', color: '#20639B', fontWeight: 600, letterSpacing: 1 }}
          onClick={() => navigate("/admin/stock/history")}
        >
          ประวัติการซื้อสินค้า
        </Button>
        <Button
          type="default"
          icon={<FaCheckCircle style={{ color: '#43A047' }} />}
          style={{ height: 44, fontSize: 17, borderRadius: 12, boxShadow: '0 2px 8px #43A04730', background: '#F6FBEA', border: '1.5px solid #43A047', color: '#43A047', fontWeight: 600, letterSpacing: 1 }}
          onClick={() => navigate("/admin/stock/usage")}
        >
          ประวัติการใช้สินค้า
        </Button>
        <Button
          type="default"
          icon={<FaExclamationTriangle style={{ color: '#ED553B' }} />} 
          style={{ height: 44, fontSize: 17, borderRadius: 12, boxShadow: '0 2px 8px #ED553B30', background: '#FFF9E5', border: '1.5px solid #ED553B', color: '#ED553B', fontWeight: 600, letterSpacing: 1 }}
          onClick={() => navigate('/admin/stock/delete')}
        >
          ดูรายการที่ถูกลบ
        </Button>
      </Row>

      {/* Filter & Search UI */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Input
          placeholder="ค้นหาสินค้าตามชื่อ..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 220 }}
        />
        <Select
          placeholder="เลือกหมวดหมู่"
          allowClear
          value={filterCategory || undefined}
          onChange={v => setFilterCategory(v || "")}
          style={{ width: 160 }}
        >
          <Option value="detergent">น้ำยาซักผ้า</Option>
          <Option value="softener">น้ำยาปรับผ้านุ่ม</Option>
        </Select>
        <Select
          placeholder="เลือกสถานะ"
          allowClear
          value={filterStatus || undefined}
          onChange={v => setFilterStatus(v || "")}
          style={{ width: 140 }}
        >
          <Option value="หมด">หมด</Option>
          <Option value="ใกล้หมด">ใกล้หมด</Option>
          <Option value="เพียงพอ">เพียงพอ</Option>
        </Select>
      </div>

      {/* Card รายการสินค้า พร้อม Progress Bar, Animation, สีตามสถานะ */}
      <Title level={4} style={{ margin: '32px 0 16px 0' }}>📋 รายการสินค้าในสต็อก</Title>
      <Row gutter={[16, 16]} justify="center">
        {filteredStock.map(item => {
          // สถานะสี
          let status = "เพียงพอ", color = "#43A047", bg = "#EAFBE7";
          if (item.quantity <= 10 && item.quantity > 0) { status = "ใกล้หมด"; color = "#F6D55C"; bg = "#FFF9E5"; }
          if (item.quantity === 0) { status = "หมด"; color = "#ED553B"; bg = "#FFEAEA"; }
          return (
            <Col key={item.key} span={8}>
              <Card
                style={{
                  borderRadius: 18,
                  boxShadow: '0 2px 12px #eaeaea',
                  background: bg,
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                styles={{ body: { padding: 24 } }}
                hoverable
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 12, background: '#fff', marginRight: 8 }} />
                  ) : (
                    <div style={{ width: 100, height: 100, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BsFillBarChartFill size={32} style={{ color }} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{item.name}</div>
                    <div style={{ color }}>{status}</div>
                  </div>
                </div>
                <div style={{ marginTop: 18, marginBottom: 8, fontWeight: 500 }}>จำนวนคงเหลือ: <span style={{ color }}>{item.quantity} ขวด</span></div>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${Math.min(item.quantity, 100)}%`, height: '100%', background: color, transition: 'width 0.5s' }} />
                </div>
                <div style={{ color: '#888', fontSize: 13 }}>อัปเดต: {new Date(item.lastUpdated).toLocaleDateString('th-TH')}</div>
                <div style={{ color: '#888', fontSize: 13 }}>โดย: {item.editor}</div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  <Button
                    variant="solid"
                    color={item.quantity === 0 ? "default" : "primary"}
                    disabled={item.quantity === 0}
                    style={{
                      backgroundColor: item.quantity === 0 ? '#E0E0E0' : undefined,
                      color: item.quantity === 0 ? '#757575' : undefined,
                      boxShadow: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: 8,
                      minWidth: 120,
                      height: 32,
                    }}
                    onClick={item.quantity > 0 ? () => handleUseItem(item) : undefined}
                  >
                    {item.quantity === 0 ? 'หมดสต็อก' : 'ใช้สินค้า'}
                  </Button>
                  <Button danger style={{ borderRadius: 8, minWidth: 80, height: 32 }} onClick={() => handleDelete(item.key)}>ลบ</Button>
                  <Tooltip title="ดูประวัติการใช้สินค้า">
                    <Button icon={<AiOutlineInfoCircle />} style={{ borderRadius: 8 }} onClick={async () => { await fetchUsageHistoryForItem(item.key); setHistoryModal(true); }} />
                  </Tooltip>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={
          <span
            style={{
              color: "#20639B",
              fontWeight: "bold",
              fontSize: "20px",
              marginTop: "10px",
            }}
          >
            เพิ่มรายการสินค้า
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={() => form.submit()}
        style={{ top: "2%", textAlign: "center" }}
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
          <Form.Item label="อัพโหลดรูปสินค้า" name="image">
            <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={file => {
                  const reader = new FileReader();
                  reader.onload = e => {
                    setUploadedImage(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                  return false;
                }}
                style={{ width: 150, height: 150 }}
              >
                {uploadedImage ? (
                  <img src={uploadedImage} alt="สินค้า" style={{ width: 150, height: 150, objectFit: 'contain', borderRadius: 12 }} />
                ) : (
                  <Button icon={<UploadOutlined />}>อัพโหลดรูป</Button>
                )}
              </Upload>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <span
            style={{
              color: "#ED553B",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            ใช้สินค้า
          </span>
        }
        open={useItemModal.visible}
        onCancel={() => {
          setUseItemModal({ visible: false });
          useItemForm.resetFields();
        }}
        onOk={() => useItemForm.submit()}
        okText="ยืนยัน"
        cancelText="ยกเลิก"
        style={{ top: "15%", textAlign: "center" }}
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

      <Modal
        title="ประวัติการใช้สินค้า"
        open={historyModal}
        onCancel={() => setHistoryModal(false)}
        footer={null}
        style={{ top: '2%' }}
      >
        {historyData.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center' }}>ไม่มีประวัติการใช้สินค้า</div>
        ) : (
          historyData.map((h, idx) => (
            <div key={idx} style={{ marginBottom: 12, padding: 8, borderBottom: '1px solid #eee' }}>
              <div>วันที่: {new Date(h.CreatedAt).toLocaleString('th-TH')}</div>
              <div>จำนวนที่ใช้: {h.QuantityUsed || '-'}</div>
              <div>หมายเหตุ: {h.Reason || '-'}</div>
              <div>ผู้ใช้: {h.User?.Employee?.FirstName || h.User?.FirstName || 'ผู้ดูแล'}</div>
            </div>
          ))
        )}
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