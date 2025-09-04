import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Input, Typography, Form, Space, Select, InputNumber, Popconfirm,
  Card, Table, message, Modal, Descriptions, Divider, Tag, Badge, Tooltip, Drawer,
} from "antd";
import {
  UserOutlined, PlusOutlined, SaveOutlined, ShoppingOutlined, DeleteOutlined,
  FileTextOutlined, PrinterOutlined, EyeOutlined, CopyOutlined, SearchOutlined, ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

import {
  FetchCustomers, FetchClothTypes, FetchServiceTypes,
  CreateLaundryCheck, FetchOrders, FetchOrderDetail,
} from "../../lib/LaundryCheck/api";

import type {
  Customer, ClothType, ServiceType,
  LaundryItemInput, LaundryCheckInput, OrderSummary, OrderDetail,
} from "../../interfaces/LaundryCheck/types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface LaundryItemLocal {
  id: number;
  clothTypeId?: number;
  serviceTypeId?: number;
  quantity: number;
}

const LaundryCheckPage: React.FC = () => {
  const [form] = Form.useForm();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clothTypes, setClothTypes] = useState<ClothType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [selectedCustomerID, setSelectedCustomerID] = useState<number | undefined>();
  const selectedCustomer = useMemo(
    () => customers.find(c => c.ID === selectedCustomerID),
    [customers, selectedCustomerID]
  );

  const [items, setItems] = useState<LaundryItemLocal[]>([]);
  const totalItems = items.length;
  const totalQuantity = items.reduce((s, x) => s + (x.quantity || 0), 0);

  const [orders, setOrders] = useState<OrderSummary[]>([]);

  const [billOpen, setBillOpen] = useState(false);
  const [billRecord, setBillRecord] = useState<OrderDetail | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<OrderDetail | null>(null);

  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cs, cts, sts, os] = await Promise.all([
          FetchCustomers(),
          FetchClothTypes(),
          FetchServiceTypes(),
          FetchOrders(),
        ]);
        setCustomers(cs);
        setClothTypes(cts);
        setServiceTypes(sts);
        setOrders(os);
      } catch (e) {
        console.error(e);
        message.error("โหลดข้อมูลเริ่มต้นไม่สำเร็จ");
      }
    })();
  }, []);

  const addItem = () => setItems(prev => [...prev, { id: Date.now(), quantity: 1 }]);
  const updateItem = (id: number, field: keyof LaundryItemLocal, value: any) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, [field]: value } : x));
  };
  const removeItem = (id: number) => setItems(prev => prev.filter(x => x.id !== id));

  const onSubmit = async () => {
    if (!selectedCustomer || !selectedCustomer.AddressID) {
      message.warning("โปรดเลือกลูกค้าที่มีที่อยู่เริ่มต้น");
      return;
    }
    if (!items.length || items.some(x => !x.clothTypeId || !x.serviceTypeId || !x.quantity)) {
      message.warning("โปรดกรอกประเภท/บริการ/จำนวน ให้ครบถ้วน");
      return;
    }

    const staffNote: string = form.getFieldValue("StaffNote") || "";

    const payload: LaundryCheckInput = {
      CustomerID: selectedCustomer.ID,
      AddressID: selectedCustomer.AddressID!,
      StaffNote: staffNote,
      Items: items.map<LaundryItemInput>(x => ({
        ClothTypeID: x.clothTypeId!,
        ServiceTypeID: x.serviceTypeId!,
        Quantity: x.quantity,
      })),
    };

    try {
      setSaving(true);
      const { OrderID } = await CreateLaundryCheck(payload);
      message.success(`บันทึกสำเร็จ • เลขที่ออเดอร์ ${OrderID}`);

      const [os, detail] = await Promise.all([
        FetchOrders(),
        FetchOrderDetail(OrderID),
      ]);
      setOrders(os);
      setBillRecord(detail);
      setBillOpen(true);

      setItems([]);
      form.resetFields(["StaffNote"]);
    } catch (e) {
      console.error(e);
      message.error("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = React.useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      String(o.ID).includes(q) ||
      (o.CustomerName || "").toLowerCase().includes(q) ||
      (o.Phone || "").includes(q)
    );
  }, [orders, searchText]);

  const columns: ColumnsType<OrderSummary> = [
    {
      title: "เลขที่ออเดอร์",
      dataIndex: "ID",
      width: 140,
      render: (id: number) => (
        <Space size={6}>
          <Text copyable={{ text: String(id) }}>
            <Tooltip title="คัดลอกเลขที่ออเดอร์"><span className="cursor-pointer">{id}</span></Tooltip>
          </Text>
          <CopyOutlined style={{ color: "#64748b" }} />
        </Space>
      )
    },
    { title: "วันที่สร้าง", dataIndex: "CreatedAt", width: 200, render: (v: string) => <Tag color="blue">{new Date(v).toLocaleString()}</Tag> },
    { title: "ลูกค้า", dataIndex: "CustomerName", width: 220 },
    { title: "เบอร์", dataIndex: "Phone", width: 140 },
    { title: "จำนวนรายการ", dataIndex: "TotalItems", align: "right", width: 120, render: (n: number) => <Badge count={n} /> },
    { title: "จำนวนชิ้น", dataIndex: "TotalQuantity", align: "right", width: 120, render: (n: number) => <Badge count={n} /> },
    {
      title: "การทำงาน",
      fixed: "right",
      width: 220,
      render: (_, r) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={async () => {
            const detail = await FetchOrderDetail(r.ID);
            setDetailRecord(detail);
            setDetailOpen(true);
          }}>ดูรายละเอียด</Button>
          <Button size="small" icon={<FileTextOutlined />} onClick={async () => {
            const detail = await FetchOrderDetail(r.ID);
            setBillRecord(detail);
            setBillOpen(true);
          }}>ออกบิล</Button>
        </Space>
      )
    }
  ];

  return (
    <EmployeeSidebar>
      <style>{`
        @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left:0; top:0; width:100%; padding:0 16px; } .no-print { display:none !important; } }
        .row-hover:hover { background:#f8fafc !important; }
      `}</style>

      <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">
        <header className="bg-blue-300 rounded-lg p-4 flex items-center gap-4">
          <ShoppingOutlined style={{ fontSize: 24, color: "#1d4ed8" }} />
          <div>
            <Title level={4} className="mb-0 text-blue-900">ระบบรับผ้า</Title>
            <Text className="text-blue-900">บันทึกรายการซักและเชื่อม API จริง (PascalCase)</Text>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Input allowClear prefix={<SearchOutlined />} placeholder="ค้นหา เลขที่/ชื่อลูกค้า/เบอร์" value={searchText} onChange={(e)=>setSearchText(e.target.value)} style={{ width: 280 }} />
            <Button icon={<ReloadOutlined />} onClick={async ()=>{ setOrders(await FetchOrders()); }}>รีเฟรช</Button>
          </div>
        </header>

        <Form form={form} layout="vertical" onFinish={onSubmit} initialValues={{ StaffNote: "" }}>
          <Card className="shadow-sm">
            <Title level={5} className="mb-4 flex items-center gap-2"><UserOutlined /> ข้อมูลลูกค้า</Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">เลือกชื่อลูกค้า</label>
                <Select
                  showSearch
                  placeholder="ค้นหาชื่อ/เบอร์ลูกค้า"
                  value={selectedCustomerID}
                  onChange={setSelectedCustomerID}
                  optionFilterProp="children"
                >
                  {customers.map(c => (
                    <Option key={c.ID} value={c.ID}>{c.Name} • {c.Phone}</Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">เบอร์โทร</label>
                <Input value={selectedCustomer?.Phone || "-"} disabled />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">ที่อยู่</label>
                <Input value={selectedCustomer?.Address || "-"} disabled />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <Form.Item label="หมายเหตุสำหรับพนักงาน" name="StaffNote">
                <TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="เช่น คราบ/ข้อควรระวัง" />
              </Form.Item>
            </div>
          </Card>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <Title level={5} className="mb-4 flex items-center justify-between">
              <span><ShoppingOutlined /> รายการผ้า</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>เพิ่มรายการ</Button>
            </Title>

            {items.length === 0 ? (
              <div className="text-center text-gray-400 py-20 select-none">
                <ShoppingOutlined style={{ fontSize: 32 }} />
                <div>ยังไม่มีรายการผ้า กดปุ่ม "เพิ่มรายการ" เพื่อเริ่มต้น</div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(it => (
                  <Space key={it.id} align="center" className="w-full" wrap style={{ padding: "8px 0", borderBottom: "1px solid #eee", gap: 12 }}>
                    <Select placeholder="ประเภทผ้า" value={it.clothTypeId} onChange={(v)=>updateItem(it.id, "clothTypeId", v)} style={{ minWidth: 180 }}>
                      {clothTypes.map(t => (<Option key={t.ID} value={t.ID}>{t.Name}</Option>))}
                    </Select>
                    <Select placeholder="บริการ" value={it.serviceTypeId} onChange={(v)=>updateItem(it.id, "serviceTypeId", v)} style={{ minWidth: 180 }}>
                      {serviceTypes.map(s => (<Option key={s.ID} value={s.ID}>{s.Name}</Option>))}
                    </Select>
                    <Space size={0} align="center" style={{ border: "1px solid #ccc", borderRadius: 6 }}>
                      <Button size="small" onClick={()=>{ if ((it.quantity||1) > 1) updateItem(it.id, "quantity", (it.quantity||1)-1); }}>–</Button>
                      <InputNumber min={1} value={it.quantity} onChange={(v)=>updateItem(it.id, "quantity", v || 1)} size="small" style={{ width: 60, textAlign: "center" }} />
                      <Button size="small" onClick={()=> updateItem(it.id, "quantity", (it.quantity||0)+1) }>+</Button>
                    </Space>
                    <Popconfirm title="ลบรายการนี้?" onConfirm={()=>removeItem(it.id)} okText="ลบ" cancelText="ยกเลิก">
                      <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ))}
              </div>
            )}

            <Divider className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Title level={5} className="mb-3">สรุปยอดรวม</Title>
                <Space direction="vertical" size="middle" className="w-full">
                  <Text>จำนวนรายการ: {totalItems} รายการ</Text>
                  <Text>จำนวนชิ้นทั้งหมด: {totalQuantity} ชิ้น</Text>
                </Space>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <Button type="primary" icon={<SaveOutlined />} block htmlType="submit" size="large" disabled={!selectedCustomer || items.length===0} loading={saving}>บันทึกข้อมูล</Button>
            </div>
          </div>
        </Form>

        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="mb-0">รายการออเดอร์</Title>
          </div>
          <Table<OrderSummary>
            rowKey={(r)=>String(r.ID)}
            dataSource={filteredOrders}
            columns={columns}
            size="middle"
            bordered
            sticky
            pagination={{ pageSize: 8 }}
            rowClassName={() => "row-hover"}
          />
        </Card>
      </div>

      <Drawer
        title={<Space><EyeOutlined /><span>รายละเอียดคำสั่ง</span>{detailRecord && <Tag color="blue">{detailRecord.ID}</Tag>}</Space>}
        width={640}
        open={detailOpen}
        onClose={()=>setDetailOpen(false)}
      >
        {detailRecord && (
          <>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="วันที่สร้าง">{new Date(detailRecord.CreatedAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="ลูกค้า">{detailRecord.CustomerName}</Descriptions.Item>
              <Descriptions.Item label="เบอร์">{detailRecord.Phone}</Descriptions.Item>
              <Descriptions.Item label="ที่อยู่">{detailRecord.Address}</Descriptions.Item>
              {detailRecord.StaffNote && <Descriptions.Item label="หมายเหตุ (พนักงาน)">{detailRecord.StaffNote}</Descriptions.Item>}
            </Descriptions>

            <Divider />

            <Title level={5}>รายการผ้า</Title>
            <Table
              size="small"
              rowKey={(r)=>String(r.ID)}
              dataSource={detailRecord.Items.map((it, idx)=>({ ...it, No: idx+1 }))}
              columns={[
                { title: "ลำดับ", dataIndex: "No", width: 70, align: "center" as const },
                { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
                { title: "บริการ", dataIndex: "ServiceType" },
                { title: "จำนวน (ชิ้น)", dataIndex: "Quantity", width: 140, align: "right" as const },
              ]}
              pagination={false}
            />

            <div className="mt-4 flex justify-end">
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="รวมจำนวนรายการ"><Badge count={detailRecord.TotalItems} /></Descriptions.Item>
                <Descriptions.Item label="รวมจำนวนชิ้น"><Badge count={detailRecord.TotalQuantity} /></Descriptions.Item>
              </Descriptions>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        title={<span>ใบเสร็จรับผ้า — <Text type="secondary">{billRecord?.ID ?? '-'}</Text></span>}
        open={billOpen}
        onCancel={()=>setBillOpen(false)}
        footer={[
          <Button key="close" onClick={()=>setBillOpen(false)} className="no-print">ปิด</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={()=>window.print()} className="no-print">พิมพ์</Button>,
        ]}
        width={820}
      >
        <div className="print-area">
          <div className="px-1 py-2"><Title level={4} className="mb-0">Neatii Service</Title></div>
          <Divider style={{ margin: "8px 0" }} />
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="เลขที่ออเดอร์">{billRecord?.ID}</Descriptions.Item>
            <Descriptions.Item label="วันที่สร้าง">{billRecord ? new Date(billRecord.CreatedAt).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{billRecord?.CustomerName}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{billRecord?.Phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{billRecord?.Address}</Descriptions.Item>
            {billRecord?.StaffNote ? (
              <Descriptions.Item label="หมายเหตุ (พนักงาน)" span={2}>{billRecord.StaffNote}</Descriptions.Item>
            ) : null}
          </Descriptions>
          <Divider style={{ margin: "12px 0" }} />
          <Table
            dataSource={(billRecord?.Items || []).map((it, idx)=>({ key: it.ID, No: idx+1, ...it }))}
            columns={[
              { title: "ลำดับ", dataIndex: "No", width: 80, align: "center" as const },
              { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
              { title: "บริการ", dataIndex: "ServiceType" },
              { title: "จำนวน (ชิ้น)", dataIndex: "Quantity", width: 140, align: "right" as const },
            ]}
            pagination={false}
            size="small"
          />
          <div className="mt-4 flex justify-end">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="รวมจำนวนรายการ">{billRecord?.TotalItems}</Descriptions.Item>
              <Descriptions.Item label="รวมจำนวนชิ้น">{billRecord?.TotalQuantity}</Descriptions.Item>
            </Descriptions>
          </div>
          <Divider style={{ margin: "12px 0" }} />
          <Text type="secondary">* โปรดเก็บใบเสร็จนี้ไว้เพื่อใช้ในการรับผ้า</Text>
        </div>
      </Modal>
    </EmployeeSidebar>
  );
};

export default LaundryCheckPage;
