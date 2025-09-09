import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useState, useMemo, useEffect } from "react";
import {
  Button, Card, Descriptions, Divider, Input, Table, Tag, Typography, Space,
  Modal, Select, InputNumber, AutoComplete, Popconfirm, message
} from "antd";
import { SearchOutlined, RollbackOutlined, PrinterOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FetchOrderDetail, FetchOrderHistory, FetchClothTypes, UpsertLaundryCheck, UpdateSortedItem, DeleteSortedItem } from "../../services/LaundryCheck";
import type { OrderDetail, HistoryEntry, ClothType } from "../../interfaces/LaundryCheck/types";

const { Title, Text } = Typography;

const renderServiceTags = (detail?: OrderDetail | null) => {
  const list = (detail as any)?.ServiceTypes as { ID: number; Name: string }[] | undefined;
  if (Array.isArray(list) && list.length > 0) {
    return list.map((st) => (
      <Tag key={st.ID} color="processing" style={{ marginBottom: 6 }}>
        {st.Name}
      </Tag>
    ));
  }
  return <span>-</span>;
};

const LaundryHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<number | undefined>();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [clothTypes, setClothTypes] = useState<ClothType[]>([]);
  const [billOpen, setBillOpen] = useState(false);

  // add new row
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState<{ ClothTypeName?: string; ServiceTypeID?: number; Quantity: number }>({
    ClothTypeName: undefined, ServiceTypeID: undefined, Quantity: 1
  });

  // edit row
  const [editOpen, setEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ ClothTypeName: string; ServiceTypeID?: number; Quantity: number }>({
    ClothTypeName: "", ServiceTypeID: undefined, Quantity: 1
  });

  useEffect(() => { (async ()=> { try { setClothTypes(await FetchClothTypes()); } catch {} })(); }, []);

  const totalQty = useMemo(() => history.reduce((s, h) => s + (h.Quantity || 0), 0), [history]);

  const load = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const [d, h] = await Promise.all([FetchOrderDetail(orderId), FetchOrderHistory(orderId)]);
      setDetail(d);
      setHistory(h);
    } catch (e) {
      setDetail(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeSidebar>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 16px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Title level={4} style={{ margin: 0, color: "#0f172a" }}>ประวัติการรับผ้า</Title>
          <div className="ml-auto flex items-center gap-2">
            <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)} size="middle" shape="round">ย้อนกลับ</Button>
            <Button type="primary" icon={<PrinterOutlined />} disabled={!detail} onClick={() => setBillOpen(true)} size="middle" shape="round">ออกบิล</Button>
          </div>
        </div>

        {/* Search + Content */}
        <Card>
          <Space size="middle" wrap>
            <Input
              allowClear
              placeholder="เลขที่ออเดอร์"
              prefix={<SearchOutlined />}
              type="number"
              value={orderId ?? undefined}
              onChange={(e) => setOrderId(Number(e.target.value || 0) || undefined)}
              style={{ width: 260 }}
              size="large"
            />
            <Button type="primary" onClick={load} loading={loading} size="large" shape="round">ดึงประวัติ</Button>
          </Space>

          <Divider />

          {detail ? (
            <>
              {/* เพิ่มรายการใหม่ */}
              <div style={{ marginBottom: 12, padding: 12, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <Space wrap size="middle">
                  <AutoComplete
                    options={clothTypes.map(ct => ({ value: ct.Name }))}
                    value={addForm.ClothTypeName}
                    onChange={(v) => setAddForm(s => ({ ...s, ClothTypeName: v }))}
                    style={{ minWidth: 220 }}
                  >
                    <Input placeholder="ประเภทผ้า (พิมพ์เองได้)" />
                  </AutoComplete>

                  <Select
                    placeholder="บริการ"
                    value={addForm.ServiceTypeID}
                    onChange={(v)=> setAddForm(s => ({ ...s, ServiceTypeID: v }))}
                    options={(detail.ServiceTypes || []).map(s => ({ label: s.Name, value: s.ID }))}
                    style={{ minWidth: 200 }}
                  />

                  <InputNumber
                    min={1}
                    value={addForm.Quantity}
                    onChange={(v)=> setAddForm(s => ({ ...s, Quantity: Number(v || 1) }))}
                  />

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    loading={adding}
                    onClick={async ()=> {
                      if (!orderId || !addForm.ClothTypeName?.trim() || !addForm.ServiceTypeID || !addForm.Quantity) {
                        message.warning("กรอกประเภท/บริการ/จำนวนให้ครบ");
                        return;
                      }
                      try {
                        setAdding(true);
                        await UpsertLaundryCheck(orderId, {
                          StaffNote: detail?.StaffNote || "",
                          Items: [{
                            ClothTypeName: addForm.ClothTypeName.trim(),
                            ServiceTypeID: addForm.ServiceTypeID,
                            Quantity: addForm.Quantity,
                          }]
                        });
                        message.success("เพิ่มรายการสำเร็จ");
                        const [d, h] = await Promise.all([FetchOrderDetail(orderId), FetchOrderHistory(orderId)]);
                        setDetail(d); setHistory(h);
                        setAddForm({ ClothTypeName: undefined, ServiceTypeID: undefined, Quantity: 1 });
                      } catch (e:any) {
                        message.error(e?.message || "เพิ่มไม่สำเร็จ");
                      } finally {
                        setAdding(false);
                      }
                    }}
                  >
                    เพิ่มรายการใหม่
                  </Button>
                </Space>
              </div>

              <Descriptions bordered column={2} size="small" style={{ marginBottom: 12, borderRadius: 10, overflow: "hidden" }}>
                <Descriptions.Item label="เลขที่ออเดอร์"><Tag color="blue" style={{ fontSize: 12 }}>#{detail.ID}</Tag></Descriptions.Item>
                <Descriptions.Item label="วันที่สร้าง">{new Date(detail.CreatedAt).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="ลูกค้า">{detail.CustomerName}</Descriptions.Item>
                <Descriptions.Item label="เบอร์">{detail.Phone}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={2}>{detail.Address}</Descriptions.Item>
                <Descriptions.Item label="บริการ" span={2}>{renderServiceTags(detail)}</Descriptions.Item>
                {detail.OrderNote && (<Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>{detail.OrderNote}</Descriptions.Item>)}
                {detail.StaffNote && (<Descriptions.Item label="หมายเหตุ (พนักงาน)" span={2}>{detail.StaffNote}</Descriptions.Item>)}
              </Descriptions>

              <Space size="small" style={{ marginBottom: 8 }}>
                <Tag>จำนวนครั้งที่บันทึก: {history.length}</Tag>
                <Tag color="blue">รวมชิ้น: {totalQty}</Tag>
              </Space>

              <Title level={5} style={{ marginTop: 10 }}>ประวัติ</Title>
              <Table<HistoryEntry>
                rowKey={(r) => String(r.ID)}
                dataSource={history.map((h, idx) => ({ ...h, No: idx + 1 }))}
                columns={[
                  { title: "ลำดับ", dataIndex: "No", width: 80, align: "center" as const },
                  { title: "เวลา", dataIndex: "RecordedAt", width: 220, render: (v) => new Date(v).toLocaleString() },
                  { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
                  { title: "บริการ", dataIndex: "ServiceType", width: 180 },
                  { title: "จำนวน", dataIndex: "Quantity", width: 120, align: "right" as const },
                  {
                    title: "จัดการ",
                    width: 170,
                    render: (_, r) => (
                      <Space>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={()=>{
                            if (!detail) return;
                            const full = detail.Items.find((it)=> it.ID === r.SortedClothesID);
                            setEditingItemId(r.SortedClothesID);
                            setEditForm({
                              ClothTypeName: full?.ClothTypeName || r.ClothTypeName,
                              ServiceTypeID: full?.ServiceTypeID,
                              Quantity: full?.Quantity ?? r.Quantity,
                            });
                            setEditOpen(true);
                          }}
                        >
                          แก้ไข
                        </Button>
                        <Popconfirm
                          title="ลบรายการนี้?"
                          onConfirm={async ()=>{
                            if (!orderId) return;
                            try {
                              await DeleteSortedItem(orderId, r.SortedClothesID);
                              message.success("ลบสำเร็จ");
                              const [d, h] = await Promise.all([FetchOrderDetail(orderId), FetchOrderHistory(orderId)]);
                              setDetail(d); setHistory(h);
                            } catch (e:any) {
                              message.error(e?.message || "ลบไม่สำเร็จ");
                            }
                          }}
                          okText="ลบ" cancelText="ยกเลิก"
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
                size="middle"
                bordered
                pagination={{ pageSize: 10, showSizeChanger: false }}
              />
            </>
          ) : null}
        </Card>
      </div>

      {/* Modal ใบเสร็จสำหรับพิมพ์ */}
      <Modal
        title={<span>ใบเสร็จรับผ้า — <Text type="secondary">{detail?.ID ?? "-"}</Text></span>}
        open={billOpen}
        onCancel={() => setBillOpen(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => window.print()} className="no-print">
            พิมพ์
          </Button>,
        ]}
        width={900}
      >
        <div className="print-area">
          <div className="px-1 py-2 flex items-center gap-3">
            <Title level={4} className="mb-0">Neatii Service</Title>
            {detail && <Tag color="blue">#{detail.ID}</Tag>}
          </div>
          <Divider style={{ margin: "8px 0" }} />

          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="เลขที่ออเดอร์">{detail?.ID}</Descriptions.Item>
            <Descriptions.Item label="วันที่สร้าง">{detail ? new Date(detail.CreatedAt).toLocaleString() : "-"}</Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{detail?.CustomerName}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{detail?.Phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{detail?.Address}</Descriptions.Item>
            <Descriptions.Item label="บริการ" span={2}>{renderServiceTags(detail)}</Descriptions.Item>
            {detail?.OrderNote && (<Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>{detail.OrderNote}</Descriptions.Item>)}
          </Descriptions>

          <Divider style={{ margin: "12px 0" }} />
          <Table
            dataSource={(detail?.Items || []).map((it, idx) => ({ key: it.ID, No: idx + 1, ...it }))}
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
              <Descriptions.Item label="รวมจำนวนรายการ">{detail?.TotalItems ?? (detail?.Items?.length || 0)}</Descriptions.Item>
              <Descriptions.Item label="รวมจำนวนชิ้น">{detail?.TotalQuantity ?? (detail?.Items?.reduce((s, x) => s + (x.Quantity || 0), 0) || 0)}</Descriptions.Item>
            </Descriptions>
          </div>

          <Divider style={{ margin: "12px 0" }} />
          <Title level={5} style={{ marginTop: 0 }}>ประวัติการรับผ้า</Title>
          <Table<HistoryEntry>
            size="small"
            rowKey={(r) => String(r.ID)}
            dataSource={history.map((h, idx) => ({ ...h, No: idx + 1 }))}
            columns={[
              { title: "ลำดับ", dataIndex: "No", width: 80, align: "center" as const },
              { title: "เวลา", dataIndex: "RecordedAt", width: 220, render: (v) => new Date(v).toLocaleString() },
              { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
              { title: "บริการ", dataIndex: "ServiceType", width: 160 },
              { title: "จำนวน", dataIndex: "Quantity", width: 120, align: "right" as const },
            ]}
            pagination={false}
          />

          {detail?.StaffNote ? (
            <>
              <Divider style={{ margin: "12px 0" }} />
              <Descriptions size="small" column={1} bordered>
                <Descriptions.Item label="หมายเหตุ (พนักงาน)">{detail.StaffNote}</Descriptions.Item>
              </Descriptions>
            </>
          ) : null}
        </div>
      </Modal>

      {/* Modal แก้ไขรายการ */}
      <Modal
        title="แก้ไขรายการ"
        open={editOpen}
        onCancel={()=> setEditOpen(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
        onOk={async ()=>{
          if (!orderId || !editingItemId) return;
          try {
            await UpdateSortedItem(orderId, editingItemId, {
              ClothTypeName: editForm.ClothTypeName?.trim(),
              ServiceTypeID: editForm.ServiceTypeID,
              Quantity: editForm.Quantity,
            });
            message.success("บันทึกการแก้ไขสำเร็จ");
            const [d, h] = await Promise.all([FetchOrderDetail(orderId), FetchOrderHistory(orderId)]);
            setDetail(d); setHistory(h);
            setEditOpen(false);
          } catch (e:any) {
            message.error(e?.message || "บันทึกไม่สำเร็จ");
          }
        }}
      >
        <Space direction="vertical" className="w-full">
          <AutoComplete
            options={clothTypes.map(ct => ({ value: ct.Name }))}
            value={editForm.ClothTypeName}
            onChange={(v)=> setEditForm(s => ({ ...s, ClothTypeName: v }))}
            style={{ width: "100%" }}
          >
            <Input placeholder="ประเภทผ้า" />
          </AutoComplete>

          {(detail?.ServiceTypes?.length || 0) > 1 && (
            <Select
              value={editForm.ServiceTypeID}
              onChange={(v)=> setEditForm(s => ({ ...s, ServiceTypeID: v }))}
              options={(detail?.ServiceTypes || []).map(s => ({ label: s.Name, value: s.ID }))}
              style={{ width: "100%" }}
              placeholder="บริการ"
            />
          )}

          <InputNumber
            min={1}
            value={editForm.Quantity}
            onChange={(v)=> setEditForm(s => ({ ...s, Quantity: Number(v || 1) }))}
            style={{ width: "100%" }}
          />
        </Space>
      </Modal>
    </EmployeeSidebar>
  );
};

export default LaundryHistoryPage;
