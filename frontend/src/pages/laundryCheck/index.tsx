import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useEffect, useMemo, useState } from "react";
import {
  Button, Input, Typography, Form, Space, Select, InputNumber, Popconfirm,
  Card, Table, message, Modal, Descriptions, Divider, Tag, Drawer, AutoComplete,
  Tooltip,
} from "antd";
import {
  UserOutlined, PlusOutlined, SaveOutlined, ShoppingOutlined, DeleteOutlined,
  PrinterOutlined, EyeOutlined, ReloadOutlined, LinkOutlined, SearchOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";

import {
  FetchClothTypes, FetchServiceTypes,
  UpsertLaundryCheck, FetchOrderDetail, FetchOrders, FetchCustomers,
} from "../../services/LaundryCheck";

import type {
  ClothType, ServiceType,
  UpsertLaundryCheckInput, OrderDetail, OrderSummary,
} from "../../interfaces/LaundryCheck/types";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface LaundryItemLocal {
  id: number;
  clothTypeName?: string;
  serviceTypeId?: number;
  quantity: number;
}

const QUICK_TYPES = ["ผ้าทั่วไป", "ผ้าขาว", "อื่นๆ"];

// helper แสดงแท็กบริการ
const renderServiceTags = (detail?: OrderDetail | null) => {
  const list = (detail as any)?.ServiceTypes as { ID: number; Name: string }[] | undefined;
  if (Array.isArray(list) && list.length > 0) {
    return list.map(st => <Tag key={st.ID}>{st.Name}</Tag>);
  }
  return <span>-</span>;
};

const LaundryCheckPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [activeOrderId, setActiveOrderId] = useState<number | undefined>();
  const [activeDetail, setActiveDetail] = useState<OrderDetail | null>(null);

  const [clothTypes, setClothTypes] = useState<ClothType[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [customers, setCustomers] = useState<{ID:number;Name:string;Phone:string}[]>([]);

  const [items, setItems] = useState<LaundryItemLocal[]>([]);
  const totalItems = items.length;
  const totalQuantity = items.reduce((s, x) => s + (x.quantity || 0), 0);

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [billOpen, setBillOpen] = useState(false);
  const [billRecord, setBillRecord] = useState<OrderDetail | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<OrderDetail | null>(null);

  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [cts, sts, os, cs] = await Promise.all([
          FetchClothTypes(),
          FetchServiceTypes(),
          FetchOrders(),
          FetchCustomers(),
        ]);
        setClothTypes(cts);
        setServiceTypes(sts);
        setOrders(os);
        setCustomers(cs.map(c=>({ID:c.ID, Name:c.Name, Phone:c.Phone})));
      } catch (e) {
        console.error(e);
        message.error("โหลดข้อมูลเริ่มต้นไม่สำเร็จ");
      }
    })();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      String(o.ID).includes(q) ||
      (o.CustomerName || "").toLowerCase().includes(q) ||
      (o.Phone || "").includes(q) ||
      (o.OrderNote || "").toLowerCase().includes(q)
    );
  }, [orders, searchText]);

  const addItem = (preset?: string) => setItems(prev => [...prev, { id: Date.now(), quantity: 1, clothTypeName: preset }]);
  const updateItem = (id: number, field: keyof LaundryItemLocal, value: any) => {
    setItems(prev => prev.map(x => x.id === id ? { ...x, [field]: value } : x));
  };
  const removeItem = (id: number) => setItems(prev => prev.filter(x => x.id !== id));

  const refreshOrders = async () => {
    try {
      setLoadingOrders(true);
      setOrders(await FetchOrders());
    } catch {
      message.error("โหลดออเดอร์ไม่สำเร็จ");
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadOrder = async (orderId: number) => {
    if (!orderId) return;
    try {
      setLoadingDetail(true);
      const detail = await FetchOrderDetail(orderId);
      setActiveOrderId(orderId);
      setActiveDetail(detail);
      setItems([]);
      form.resetFields(["StaffNote"]);
      message.success(`โหลดออเดอร์ #${orderId} สำเร็จ`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setActiveOrderId(undefined);
      setActiveDetail(null);
      message.error("ไม่พบออเดอร์นี้");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openDetail = async (orderId: number) => {
    const detail = await FetchOrderDetail(orderId);
    setDetailRecord(detail);
    setDetailOpen(true);
  };

  const submitUpsert = async () => {
    if (!activeOrderId) {
      message.warning("โปรดระบุเลขที่ออเดอร์ก่อน");
      return;
    }
    if (!items.length || items.some(x => !x.clothTypeName?.trim() || !x.serviceTypeId || !x.quantity || x.quantity < 1)) {
      message.warning("โปรดกรอกประเภท/บริการ/จำนวน ให้ครบถ้วน");
      return;
    }

    const payload: UpsertLaundryCheckInput = {
      StaffNote: form.getFieldValue("StaffNote") || "",
      Items: items.map(it => ({
        ClothTypeName: it.clothTypeName!.trim(),
        ServiceTypeID: it.serviceTypeId!,
        Quantity: it.quantity,
      })),
    };

    try {
      setSaving(true);
      const { OrderID } = await UpsertLaundryCheck(activeOrderId, payload);
      message.success("บันทึกข้อมูลการรับผ้าสำเร็จ");

      const detail = await FetchOrderDetail(OrderID);
      setBillRecord(detail);
      setBillOpen(true);

      refreshOrders();
      setItems([]);
    } catch (e) {
      console.error(e);
      message.error("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  // 🔻 เอาคอลัมน์ "รวมชิ้น" ออกจากตารางออเดอร์ล่าสุด
  const orderColumns: ColumnsType<OrderSummary> = [
    {
      title: "เลขที่ออเดอร์",
      dataIndex: "ID",
      width: 150,
      render: (id: number) => (
        <a onClick={() => loadOrder(id)} title="โหลดออเดอร์นี้">
          <Tag color="blue">#{id}</Tag> <LinkOutlined />
        </a>
      ),
    },
    {
      title: "ลูกค้า",
      dataIndex: "CustomerName",
      width: 260,
      render: (_: string, r) => (
        <a onClick={() => loadOrder(r.ID)} title={`เปิดออเดอร์ของ ${r.CustomerName}`}>
          {r.CustomerName}
        </a>
      ),
    },
    { title: "เบอร์", dataIndex: "Phone", width: 140 },
    { title: "วันที่สร้าง", dataIndex: "CreatedAt", width: 200, render: (v: string) => <Tag>{new Date(v).toLocaleString()}</Tag> },
    { title: "หมายเหตุ (ลูกค้า)", dataIndex: "OrderNote", ellipsis: true },
    {
      title: "ดู", fixed: "right", width: 90,
      render: (_, r) => (
        <Tooltip title="ดูรายละเอียด">
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r.ID)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <EmployeeSidebar>
      <style>{`
        @media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left:0; top:0; width:100%; padding:0 16px; } .no-print { display:none !important; } }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-6 font-sans">
        <header className="bg-blue-300 rounded-lg p-4 flex items-center gap-4">
          <ShoppingOutlined style={{ fontSize: 24, color: "#1d4ed8" }} />
          <div>
            <Title level={4} className="mb-0 text-blue-900">รับผ้า/แยกผ้า</Title>
          </div>

        {/* ปุ่มประวัติ */}
          <div className="ml-auto">
            <Button icon={<ProfileOutlined />} onClick={() => navigate("/employee/laundry-history")}>
              ประวัติ
            </Button>
          </div>
        </header>

        <Card className="shadow-sm">
          <Title level={5} className="mb-4">ค้นหาออเดอร์</Title>
          <Space wrap>
            <Input
              placeholder="กรอกเลขที่ออเดอร์ เช่น 1024"
              type="number"
              value={activeOrderId ?? undefined}
              onChange={(e)=> setActiveOrderId(Number(e.target.value || 0) || undefined)}
              style={{ width: 220 }}
              prefix={<SearchOutlined />}
            />
            <Button type="primary" onClick={()=> activeOrderId && loadOrder(activeOrderId)} loading={loadingDetail}>
              โหลดข้อมูล
            </Button>
          </Space>
          <div className="mt-4">
            {activeDetail && (
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="เลขที่ออเดอร์"><Tag color="blue">#{activeDetail.ID}</Tag></Descriptions.Item>
                <Descriptions.Item label="วันที่">{new Date(activeDetail.CreatedAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="ลูกค้า">{activeDetail.CustomerName}</Descriptions.Item>
                <Descriptions.Item label="เบอร์">{activeDetail.Phone}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={2}>{activeDetail.Address}</Descriptions.Item>
                <Descriptions.Item label="บริการ" span={2}>
                  {renderServiceTags(activeDetail)}
                </Descriptions.Item>
                {activeDetail.OrderNote && <Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>{activeDetail.OrderNote}</Descriptions.Item>}
              </Descriptions>
            )}
          </div>
        </Card>

        <Form form={form} layout="vertical" onFinish={submitUpsert} initialValues={{ StaffNote: "" }}>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <Title level={5} className="m-0"><ShoppingOutlined /> เพิ่มรายการผ้า</Title>
              <Space wrap>
                {QUICK_TYPES.map(q => (
                  <Button key={q} onClick={()=>addItem(q)} disabled={!activeOrderId}>{q}</Button>
                ))}
                <Button type="primary" icon={<PlusOutlined />} onClick={()=>addItem()} disabled={!activeOrderId}>เพิ่มรายการ</Button>
              </Space>
            </div>

            {items.length === 0 ? (
              <div className="text-center text-gray-400 py-14 select-none">
                <ShoppingOutlined style={{ fontSize: 32 }} />
                <div>ยังไม่มีรายการผ้า — โปรดระบุเลขที่ออเดอร์ แล้วกด “เพิ่มรายการ”</div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(it => (
                  <Space key={it.id} align="center" className="w-full" wrap style={{ padding: "8px 0", borderBottom: "1px solid #eee", gap: 12 }}>
                    <AutoComplete
                      options={clothTypes.map(ct => ({ value: ct.Name }))}
                      value={it.clothTypeName}
                      onChange={(v) => updateItem(it.id, "clothTypeName", v)}
                      style={{ minWidth: 260 }}
                    >
                      <Input placeholder="ประเภทผ้า (พิมพ์เอง เช่น ผ้าขาว / ผ้าทั่วไป / อื่นๆ)" />
                    </AutoComplete>

                    <Select
                      placeholder="บริการ"
                      value={it.serviceTypeId}
                      onChange={(v)=>updateItem(it.id, "serviceTypeId", v)}
                      style={{ minWidth: 180 }}
                    >
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
              <div className="md:col-span-1">
                <Form.Item label="หมายเหตุสำหรับพนักงาน" name="StaffNote">
                  <TextArea autoSize={{ minRows: 2, maxRows: 5 }} placeholder="เช่น คราบ/ข้อควรระวัง" disabled={!activeOrderId} />
                </Form.Item>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col justify-between">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                block
                htmlType="submit"
                size="large"
                disabled={!activeOrderId || items.length===0}
                loading={saving}
              >
                บันทึกและพิมพ์ออเดอร์
              </Button>
            </div>
          </div>
        </Form>

        {/* ออเดอร์ล่าสุด */}
        <Card className="shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Title level={5} className="mb-0">ออเดอร์ล่าสุด</Title>
            <Space>
              <Input
                allowClear
                placeholder="ค้นหา เลขที่/ชื่อลูกค้า/เบอร์/หมายเหตุ"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e)=>setSearchText(e.target.value)}
                style={{ width: 320 }}
              />
              <Button icon={<ReloadOutlined />} onClick={refreshOrders} loading={loadingOrders}>รีเฟรช</Button>
            </Space>
          </div>
          <Table<OrderSummary>
            rowKey={(r)=>String(r.ID)}
            dataSource={filteredOrders}
            columns={orderColumns}
            size="middle"
            bordered
            pagination={{ pageSize: 8 }}
          />
        </Card>
      </div>

      {/* Drawer รายละเอียด (ไม่มีประวัติ) */}
      <Drawer
        title={<Space><EyeOutlined /><span>รายละเอียดคำสั่ง</span>{detailRecord && <Tag color="blue">#{detailRecord.ID}</Tag>}</Space>}
        width={720}
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
              <Descriptions.Item label="บริการ">
                {renderServiceTags(detailRecord)}
              </Descriptions.Item>
              {detailRecord.OrderNote && <Descriptions.Item label="หมายเหตุ (ลูกค้า)">{detailRecord.OrderNote}</Descriptions.Item>}
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

            <div className="mt-4">
              <Descriptions column={2} size="small" bordered>
                <Descriptions.Item label="รวมจำนวนรายการ">{detailRecord.TotalItems}</Descriptions.Item>
                <Descriptions.Item label="รวมจำนวนชิ้น">{detailRecord.TotalQuantity}</Descriptions.Item>
              </Descriptions>
            </div>

            {detailRecord.StaffNote && (
              <>
                <Divider />
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="หมายเหตุ (พนักงาน)">{detailRecord.StaffNote}</Descriptions.Item>
                </Descriptions>
              </>
            )}
          </>
        )}
      </Drawer>

      {/* Modal ใบเสร็จ (ไม่มีประวัติ) */}
      <Modal
        title={<span>ใบเสร็จรับผ้า — <Text type="secondary">{billRecord?.ID ?? '-'}</Text></span>}
        open={billOpen}
        onCancel={()=>setBillOpen(false)}
        footer={[
          billRecord ? <Button key="detail" onClick={()=> billRecord && openDetail(billRecord.ID)} className="no-print" icon={<EyeOutlined />}>ดูรายละเอียด</Button> : null,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={()=>window.print()} className="no-print">พิมพ์</Button>,
        ]}
        width={900}
      >
        <div className="print-area">
          <div className="px-1 py-2 flex items-center gap-3">
            <Title level={4} className="mb-0">Neatii Service</Title>
            {billRecord && <Tag color="blue">#{billRecord.ID}</Tag>}
          </div>
          <Divider style={{ margin: "8px 0" }} />
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="เลขที่ออเดอร์">{billRecord?.ID}</Descriptions.Item>
            <Descriptions.Item label="วันที่สร้าง">{billRecord ? new Date(billRecord.CreatedAt).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{billRecord?.CustomerName}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{billRecord?.Phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{billRecord?.Address}</Descriptions.Item>
            <Descriptions.Item label="บริการ" span={2}>
              {renderServiceTags(billRecord)}
            </Descriptions.Item>
            {billRecord?.OrderNote ? (
              <Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>{billRecord.OrderNote}</Descriptions.Item>
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
          {billRecord?.StaffNote ? (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="หมายเหตุ (พนักงาน)">{billRecord.StaffNote}</Descriptions.Item>
              </Descriptions>
            </>
          ) : null}
        </div>
      </Modal>
    </EmployeeSidebar>
  );
};

export default LaundryCheckPage;
