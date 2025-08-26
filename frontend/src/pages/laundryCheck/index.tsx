import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Typography,
  Form,
  Space,
  Select,
  InputNumber,
  Popconfirm,
  Card,
  Table,
  message,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  SaveOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  ClearOutlined,
  FileTextOutlined,
  PrinterOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  note?: string;      // หมายเหตุจากลูกค้า
}

interface LaundryItem {
  id: number;
  type: string;
  service: string;
  quantity: number;
}

interface OrderRecord {
  id: string;            // เลขที่บิล (จาก API)
  createdAt: string;     // วันที่ออกบิล
  customer: Customer;
  items: LaundryItem[];
  totalItems: number;
  totalQuantity: number;
  note?: string;         // หมายเหตุที่บันทึกคู่กับคำสั่ง
}

// --- ลูกค้าตัวอย่าง (แทน API จริง) ---
const mockCustomers: Customer[] = [
  {
    id: 101,
    name: "คุณวิไลรัตน์ วงศ์ทอง",
    phone: "089-111-2222",
    address: "99/1 ถ.เจริญกรุง เขตบางรัก กทม.",
    note: "แพ้กลิ่นน้ำยาบางชนิด • ขอสูตรอ่อน • ห้ามอบร้อน",
  },
  {
    id: 102,
    name: "คุณศิริชัย จันทร์สม",
    phone: "081-333-4444",
    address: "88/2 ถ.สุขุมวิท อ.เมือง จ.ชลบุรี",
    note: "เน้นรีดกางเกงมีจีบ • ส่งด่วนภายใน 48 ชม.",
  },
  {
    id: 103,
    name: "บริษัท คลีนคลับ จำกัด",
    phone: "02-555-9999",
    address: "123 หมู่บ้านสีขาว ต.คลองหนึ่ง อ.คลองหลวง ปทุมธานี",
    note: "ใบกำกับภาษีทุกเดือน • รับส่งเฉพาะวันศุกร์",
  },
];

const laundryTypes = [
  { value: "normal", label: "ทั่วไป" },
  { value: "cotton", label: "ผ้าฝ้าย" },
  { value: "silk", label: "ผ้าไหม" },
  { value: "denim", label: "ผ้ายีนส์" },
];

const laundryServices = [
  { value: "wash", label: "ซักอย่างเดียว" },
  { value: "washIron", label: "ซักและอบ" },
];

const STORAGE_KEY = "laundry_orders_history";

const LaundryCheckPage: React.FC = () => {
  // บิลล่าสุดหลังบันทึก (ไว้กดออกบิลล่าสุดได้)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [currentCreatedAt, setCurrentCreatedAt] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [laundryItems, setLaundryItems] = useState<LaundryItem[]>([]);
  const [saving, setSaving] = useState(false);

  // เลือกลูกค้า (ดึง note อัตโนมัติ)
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const selectedCustomer = useMemo(
    () => mockCustomers.find((c) => c.id === selectedCustomerId) || null,
    [selectedCustomerId]
  );

  // เมื่อเปลี่ยนลูกค้า → เซ็ตหมายเหตุลงฟอร์มอัตโนมัติ (อ่านอย่างเดียว)
  useEffect(() => {
    form.setFieldsValue({ note: selectedCustomer?.note || "" });
  }, [selectedCustomer, form]);

  // ประวัติ
  const [history, setHistory] = useState<OrderRecord[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { setHistory(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // ---------- ออกบิล (พรีวิว/พิมพ์) ----------
  const [billOpen, setBillOpen] = useState(false);
  const [billRecord, setBillRecord] = useState<OrderRecord | null>(null);

  // เปิดบิลจาก record
  const openBill = (rec: OrderRecord) => {
    setBillRecord(rec);
    setBillOpen(true);
  };
  // ออกบิลล่าสุด (หาจาก currentOrderId)
  const openLatestBill = () => {
    if (!currentOrderId) return;
    const rec = history.find((r) => r.id === currentOrderId);
    if (rec) openBill(rec);
  };
  const handlePrint = () => window.print();

  // ---------- ตารางประวัติ ----------
  const historyColumns = [
    { title: "เลขที่บิล", dataIndex: "id" },
    { title: "วันที่ออกบิล", dataIndex: "createdAt" },
    { title: "ลูกค้า", dataIndex: ["customer", "name"] },
    { title: "เบอร์", dataIndex: ["customer", "phone"] },
    { title: "จำนวนรายการ", dataIndex: "totalItems", align: "right" as const, width: 130 },
    { title: "จำนวนชิ้น", dataIndex: "totalQuantity", align: "right" as const, width: 130 },
    { title: "หมายเหตุ", dataIndex: "note" },
    {
      title: "การทำงาน",
      key: "actions",
      width: 210,
      render: (_: any, rec: OrderRecord) => (
        <Space>
          <Button size="small" icon={<FileTextOutlined />} onClick={() => openBill(rec)}>
            ออกบิล
          </Button>
          <Popconfirm title="ลบประวัติรายการนี้?" onConfirm={() => deleteHistory(rec.id)} okText="ลบ" cancelText="ยกเลิก">
            <Button size="small" danger icon={<DeleteOutlined />}>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ---------- Items CRUD ----------
  const addLaundryItem = () => {
    const newItem: LaundryItem = { id: Date.now(), type: "", service: "", quantity: 1 };
    setLaundryItems((prev) => [...prev, newItem]);
  };
  const updateLaundryItem = (id: number, field: keyof LaundryItem, value: any) => {
    setLaundryItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };
  const removeLaundryItem = (id: number) => setLaundryItems((prev) => prev.filter((it) => it.id !== id));

  const totalItems = laundryItems.length;
  const totalQuantity = laundryItems.reduce((acc, i) => acc + i.quantity, 0);

  // ---------- บันทึก → ขอเลขที่จาก API + บันทึก + เก็บประวัติ ----------
  const onFinish = async () => {
    if (!selectedCustomer) {
      message.warning("โปรดเลือกลูกค้า");
      return;
    }
    if (laundryItems.length === 0) {
      message.warning("โปรดเพิ่มรายการผ้าอย่างน้อย 1 รายการ");
      return;
    }

    try {
      setSaving(true);

      const newOrderId = await apiRequestNewOrderId(); // แทนด้วย API จริง
      const createdAt = nowString();
      const note = selectedCustomer?.note || ""; // ใช้หมายเหตุจากลูกค้า

      const payload = {
        id: newOrderId,
        createdAt,
        customer: selectedCustomer,
        items: laundryItems,
        totals: { totalItems, totalQuantity },
        note,
      };
      await apiSaveOrder(payload); // แทนด้วย API จริง

      const record: OrderRecord = {
        id: newOrderId,
        createdAt,
        customer: selectedCustomer,
        items: laundryItems,
        totalItems,
        totalQuantity,
        note,
      };
      setHistory((prev) => [record, ...prev]);

      setCurrentOrderId(newOrderId);
      setCurrentCreatedAt(createdAt);

      setLaundryItems([]);
      message.success(`บันทึกคำสั่งซักเรียบร้อย • เลขที่บิล: ${newOrderId}`);
    } catch (e) {
      console.error(e);
      message.error("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      setSaving(false);
    }
  };

  const deleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
    message.success("ลบประวัติแล้ว");
  };
  const clearAllHistory = () => {
    setHistory([]);
    message.success("ล้างประวัติทั้งหมดแล้ว");
  };

  // ---------- Helper สำหรับบิล ----------
  const labelOf = (arr: { value: string; label: string }[], v?: string) =>
    arr.find((x) => x.value === v)?.label || v || "-";

  // ตารางรายการในบิล
  const billTableData = (billRecord?.items || []).map((it, idx) => ({
    key: it.id,
    no: idx + 1,
    type: labelOf(laundryTypes, it.type),
    service: labelOf(laundryServices, it.service),
    quantity: it.quantity,
  }));

  const billColumns = [
    { title: "ลำดับ", dataIndex: "no", width: 80, align: "center" as const },
    { title: "ประเภทผ้า", dataIndex: "type" },
    { title: "บริการ", dataIndex: "service" },
    { title: "จำนวน (ชิ้น)", dataIndex: "quantity", width: 140, align: "right" as const },
  ];

  return (
    <EmployeeSidebar>
      {/* CSS สำหรับพิมพ์เฉพาะบิล */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 16px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">
        <header className="bg-blue-300 rounded-lg p-4 flex items-center gap-4">
          <ShoppingOutlined style={{ fontSize: 24, color: "#1d4ed8" }} />
          <div>
            <Title level={4} className="mb-0 text-blue-900">ระบบรับผ้า</Title>
            <Text className="text-blue-900">บันทึกรายการซักที่ลูกค้านำมาฝาก</Text>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm text-blue-900 font-medium">
            <div className="bg-blue-600 text-white rounded px-2 py-0.5">
              เลขที่บิล: {currentOrderId ?? "ยังไม่ออกเลขที่ (จะออกเมื่อกดบันทึก)"}
            </div>
            <div>{currentCreatedAt ?? "-"}</div>
            <Button
              type="default"
              icon={<FileTextOutlined />}
              disabled={!currentOrderId}
              onClick={openLatestBill}
            >
              ออกบิลล่าสุด
            </Button>
          </div>
        </header>

        <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-6" initialValues={{ note: "" }}>
          {/* ลูกค้า + หมายเหตุอัตโนมัติ */}
          <Card className="shadow-sm">
            <Title level={5} className="mb-4 flex items-center gap-2"><UserOutlined /> ข้อมูลลูกค้า</Title>
            <Space direction="vertical" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">เลือกชื่อลูกค้า</label>
                  <Select
                    showSearch
                    placeholder="ค้นหาชื่อ/เบอร์โทรลูกค้า"
                    value={selectedCustomerId ?? undefined}
                    onChange={(id) => setSelectedCustomerId(id)}
                    className="w-full"
                    optionFilterProp="children"
                    // filterOption={(input, option) => (option?.children as string).toLowerCase().includes(input.toLowerCase())}
                  >
                    {mockCustomers.map((c) => (
                      <Option key={c.id} value={c.id}>{c.name} • {c.phone}</Option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
                  <Input value={selectedCustomer?.phone || "-"} disabled />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">ที่อยู่</label>
                  <Input value={selectedCustomer?.address || "-"} disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mt-2">
                <Form.Item label="หมายเหตุจากลูกค้า" name="note">
                  <TextArea autoSize={{ minRows: 2, maxRows: 5 }} readOnly />
                </Form.Item>
              </div>
            </Space>
          </Card>

          {/* รายการผ้า */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Title level={5} className="mb-4 flex items-center justify-between">
              <span><ShoppingOutlined /> รายการผ้า</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={addLaundryItem}>เพิ่มรายการ</Button>
            </Title>

            {laundryItems.length === 0 ? (
              <div className="text-center text-gray-400 py-20 select-none">
                <ShoppingOutlined style={{ fontSize: 32 }} />
                <div>ยังไม่มีรายการผ้า กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น</div>
              </div>
            ) : (
              <div className="space-y-4">
                {laundryItems.map((item) => (
                  <Space key={item.id} align="center" className="w-full" wrap style={{ padding: "8px 0", borderBottom: "1px solid #eee", gap: 12 }}>
                    <Select placeholder="เลือกประเภท" value={item.type || undefined} onChange={(v) => updateLaundryItem(item.id, "type", v)} style={{ minWidth: 150 }}>
                      {laundryTypes.map((t) => (<Option key={t.value} value={t.value}>{t.label}</Option>))}
                    </Select>
                    <Select placeholder="เลือกบริการ" value={item.service || undefined} onChange={(v) => updateLaundryItem(item.id, "service", v)} style={{ minWidth: 150 }}>
                      {laundryServices.map((s) => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
                    </Select>
                    <Space size={0} align="center" style={{ border: "1px solid #ccc", borderRadius: 6 }}>
                      <Button size="small" onClick={() => { if (item.quantity > 1) updateLaundryItem(item.id, "quantity", item.quantity - 1); }}>–</Button>
                      <InputNumber min={1} value={item.quantity} onChange={(v) => updateLaundryItem(item.id, "quantity", v || 1)} size="small" style={{ width: 60, textAlign: "center" }} />
                      <Button size="small" onClick={() => updateLaundryItem(item.id, "quantity", item.quantity + 1)}>+</Button>
                    </Space>
                    <Popconfirm title="ลบรายการนี้หรือไม่?" onConfirm={() => removeLaundryItem(item.id)} okText="ใช่" cancelText="ไม่">
                      <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm col-span-2">
              <Title level={5} className="mb-4 flex items-center gap-2"><Text strong>สรุปยอดรวม</Text></Title>
              <Space direction="vertical" size="middle" className="w-full">
                <Text>จำนวนรายการ: {laundryItems.length} รายการ</Text>
                <Text>จำนวนชิ้นทั้งหมด: {totalQuantity} ชิ้น</Text>
              </Space>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <Title level={5} className="mb-6 flex items-center gap-2">ดำเนินการ</Title>
              <Space direction="vertical" size="middle" className="w-full">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  block
                  htmlType="submit"
                  size="large"
                  disabled={!selectedCustomer || laundryItems.length === 0}
                  loading={saving}
                >
                  บันทึกข้อมูล
                </Button>
              </Space>
            </div>
          </div>
        </Form>

        {/* ประวัติคำสั่ง */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="mb-0">ประวัติคำสั่งซัก</Title>
            <Button size="small" icon={<ClearOutlined />} onClick={clearAllHistory} danger>ล้างทั้งหมด</Button>
          </div>
          <Table
            rowKey={(r: OrderRecord) => r.id}
            dataSource={history}
            pagination={{ pageSize: 5 }}
            columns={historyColumns}
          />
        </Card>
      </div>

      {/* ----- Bill Modal (พรีวิว/พิมพ์) ----- */}
      <Modal
        title={
          <span>
            ใบเสร็จรับผ้า — <Text type="secondary">{billRecord?.id || "-"}</Text>
          </span>
        }
        open={billOpen}
        onCancel={() => setBillOpen(false)}
        footer={[
          <Button key="close" onClick={() => setBillOpen(false)} className="no-print">ปิด</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} className="no-print">พิมพ์</Button>,
        ]}
        width={800}
      >
        <div className="print-area">
          <div className="px-1 py-2">
            <Title level={4} className="mb-0">Neatii Service</Title>
          </div>
          <Divider style={{ margin: "8px 0" }} />

          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="เลขที่บิล">{billRecord?.id}</Descriptions.Item>
            <Descriptions.Item label="วันที่ออกบิล">{billRecord?.createdAt}</Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{billRecord?.customer.name}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{billRecord?.customer.phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{billRecord?.customer.address}</Descriptions.Item>
            {billRecord?.note ? (
              <Descriptions.Item label="หมายเหตุ" span={2}>{billRecord?.note}</Descriptions.Item>
            ) : null}
          </Descriptions>

          <Divider style={{ margin: "12px 0" }} />
          <Table
            dataSource={billTableData}
            columns={billColumns}
            pagination={false}
            size="small"
          />

          <div className="mt-4 flex justify-end">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="รวมจำนวนรายการ">{billRecord?.totalItems} รายการ</Descriptions.Item>
              <Descriptions.Item label="รวมจำนวนชิ้น">{billRecord?.totalQuantity} ชิ้น</Descriptions.Item>
            </Descriptions>
          </div>

          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary">* โปรดเก็บใบเสร็จนี้ไว้เพื่อใช้ในการรับผ้า</Text>
        </div>
      </Modal>
    </EmployeeSidebar>
  );
};

// ----- Utils & Mock API -----
function nowString() {
  const ts = new Date();
  const dd = String(ts.getDate()).padStart(2, "0");
  const mm = String(ts.getMonth() + 1).padStart(2, "0");
  const yyyy = ts.getFullYear();
  const hh = String(ts.getHours()).padStart(2, "0");
  const mi = String(ts.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/** แทนด้วยการเรียก API จริงเพื่อขอเลขที่บิลใหม่ */
async function apiRequestNewOrderId(): Promise<string> {
  await wait(500);
  const ts = new Date();
  const y = String(ts.getFullYear()).slice(-2);
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  const h = String(ts.getHours()).padStart(2, "0");
  const mi = String(ts.getMinutes()).padStart(2, "0");
  const s = String(ts.getSeconds()).padStart(2, "0");
  return `ORD${y}${m}${d}-${h}${mi}${s}`;
}

/** แทนด้วย POST ไป backend ตามสัญญา API ของคุณ */
async function apiSaveOrder(payload: {
  id: string;
  createdAt: string;
  customer: Customer;
  items: LaundryItem[];
  totals: { totalItems: number; totalQuantity: number };
  note?: string;
}): Promise<void> {
  await wait(400);
  // ตัวจริง:
  // await fetch('/api/orders', { method: 'POST', headers: {...}, body: JSON.stringify(payload) })
  return;
}

function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default LaundryCheckPage;
