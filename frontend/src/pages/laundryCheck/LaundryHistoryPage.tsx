import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Input,
  Table,
  Tag,
  Typography,
  Space,
  Modal,
  Alert,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  RollbackOutlined,
  PrinterOutlined,
  ReloadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { FetchOrderDetail, FetchOrderHistory } from "../../services/LaundryCheck";
import type { OrderDetail, HistoryEntry } from "../../interfaces/LaundryCheck/types";

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

const formatDate = (v?: string | Date | null) => {
  if (!v) return "-";
  try {
    const d = typeof v === "string" ? new Date(v) : v;
    return d.toLocaleString();
  } catch {
    return "-";
  }
};

const LaundryHistoryPage: React.FC = () => {
  const navigate = useNavigate();

  const [orderId, setOrderId] = useState<number | undefined>();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ใบเสร็จ (พิมพ์)
  const [billOpen, setBillOpen] = useState(false);

  // ยอด “ปัจจุบัน” ของออเดอร์ (ใช้ในใบเสร็จ)
  const currentTotal = useMemo(
    () => detail?.TotalQuantity ?? (detail?.Items?.reduce((s, x) => s + (x.Quantity || 0), 0) || 0),
    [detail]
  );

  // เวลาล่าสุดจากประวัติ (ไว้โชว์ในบิล)
  const latestUpdatedAt = useMemo(() => {
    if (!history.length) return null;
    const max = history.reduce<Date | null>((acc, h) => {
      const d = new Date(h.RecordedAt);
      return !acc || d > acc ? d : acc;
    }, null);
    return max;
  }, [history]);

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

  const canPrint = !!detail;

  return (
    <EmployeeSidebar>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0 16px; }
          .no-print { display: none !important; }
        }
        .page-header {
          background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 14px;
          padding: 16px 18px;
        }
        .history-card {
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(2, 132, 199, 0.08);
          border: 1px solid #e5e7eb;
        }
        .soft-divider {
          margin: 12px 0 16px;
          border-top: 1px dashed #e2e8f0;
        }
        .table-elegant .ant-table-thead > tr > th {
          background: #f1f5ff;
          border-color: #e5e7eb !important;
          font-weight: 600;
        }
        .table-elegant .ant-table-tbody > tr:hover > td {
          background: #f8fbff !important;
        }
        .pill {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          color: #1d4ed8;
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="page-header flex items-center gap-3">
          <Title level={4} style={{ margin: 0, color: "#0f172a" }}>
            ประวัติการรับผ้า
          </Title>
          <span className="pill">ตรวจสอบย้อนหลัง • ออกบิลพิมพ์ได้</span>
          <div className="ml-auto flex items-center gap-6">
            <Tooltip title="กลับหน้าก่อนหน้า">
              <Button icon={<RollbackOutlined />} onClick={() => navigate(-1)} size="middle" shape="round">
                ย้อนกลับ
              </Button>
            </Tooltip>
            <Tooltip title="พิมพ์ใบเสร็จจากข้อมูลล่าสุดที่โหลด">
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                disabled={!canPrint}
                onClick={() => setBillOpen(true)}
                size="middle"
                shape="round"
              >
                ออกบิล
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Search + Content */}
        <Card className="history-card">
          <Space size="middle" wrap>
            <Input
              allowClear
              placeholder="เลขที่ออเดอร์"
              prefix={<SearchOutlined />}
              type="number"
              value={orderId ?? undefined}
              onChange={(e) => setOrderId(Number(e.target.value || 0) || undefined)}
              onPressEnter={load}
              style={{ width: 260 }}
              size="large"
            />
            <Button type="primary" onClick={load} loading={loading} size="large" shape="round" icon={<ReloadOutlined />}>
              ดึงประวัติ
            </Button>
          </Space>

          <Divider className="soft-divider" />

          {!detail ? (
            <Alert type="info" showIcon message="กรอกเลขที่ออเดอร์ แล้วกด 'ดึงประวัติ' เพื่อดูรายการย้อนหลัง" />
          ) : (
            <>
              {/* Order Header */}
              <Descriptions
                bordered
                column={2}
                size="small"
                style={{ marginBottom: 12, borderRadius: 10, overflow: "hidden" }}
              >
                <Descriptions.Item label="เลขที่ออเดอร์">
                  <Tag color="blue" style={{ fontSize: 12 }}>
                    #{detail.ID}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="วันที่สร้าง">
                  {formatDate(detail.CreatedAt)}
                </Descriptions.Item>
                <Descriptions.Item label="ลูกค้า">{detail.CustomerName}</Descriptions.Item>
                <Descriptions.Item label="เบอร์">{detail.Phone}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่" span={2}>
                  {detail.Address}
                </Descriptions.Item>
                <Descriptions.Item label="บริการ" span={2}>
                  {renderServiceTags(detail)}
                </Descriptions.Item>
                {detail.OrderNote && (
                  <Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>
                    {detail.OrderNote}
                  </Descriptions.Item>
                )}
                {detail.StaffNote && (
                  <Descriptions.Item label="หมายเหตุ (พนักงาน)" span={2}>
                    {detail.StaffNote}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {/* History table */}
              <Title level={5} style={{ marginTop: 10 }}>
                ประวัติ
              </Title>
              <Table<HistoryEntry>
                className="table-elegant"
                rowKey={(r) => String(r.ID)}
                dataSource={history.map((h, idx) => ({ ...h, No: idx + 1 }))}
                columns={[
                  { title: "ลำดับ", dataIndex: "No", width: 80, align: "center" as const },
                  {
                    title: "เวลา",
                    dataIndex: "RecordedAt",
                    width: 220,
                    render: (v) => formatDate(v),
                  },
                  { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
                  { title: "บริการ", dataIndex: "ServiceType", width: 180 },
                  {
                    title: "สถานะ",
                    width: 120,
                    render: (_, r) =>
                      r.Quantity < 0 ? <Tag color="error">ลบ</Tag> : <Tag color="success">เพิ่ม</Tag>,
                  },
                  {
                    title: "จำนวน",
                    dataIndex: "Quantity",
                    width: 120,
                    align: "right" as const,
                    render: (q: number) =>
                      q < 0 ? <span style={{ color: "#dc2626" }}>{q}</span> : <span>{q}</span>,
                  },
                ]}
                size="middle"
                bordered
                pagination={{ pageSize: 10, showSizeChanger: false }}
              />

              {/* Quick link to sorting page */}
              <div className="mt-3">
                <Tooltip title="เปิดหน้า รับผ้า/แยกผ้า ของออเดอร์นี้">
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => navigate("/employee/laundry-check", { state: { orderId: detail.ID } })}
                  >
                    ไปหน้าแยกผ้า (ออเดอร์ #{detail.ID})
                  </Button>
                </Tooltip>
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Modal ใบเสร็จสำหรับพิมพ์ — ไม่แสดงตารางประวัติ, แสดงเฉพาะรายการปัจจุบัน + อัปเดตล่าสุด */}
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
            <Descriptions.Item label="วันที่สร้าง">{formatDate(detail?.CreatedAt)}</Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{detail?.CustomerName}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{detail?.Phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{detail?.Address}</Descriptions.Item>
            <Descriptions.Item label="บริการ" span={2}>
              {renderServiceTags(detail)}
            </Descriptions.Item>
            {latestUpdatedAt ? (
              <Descriptions.Item label="อัปเดตล่าสุด" span={2}>{formatDate(latestUpdatedAt)}</Descriptions.Item>
            ) : null}
            {detail?.OrderNote ? (
              <Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>
                {detail.OrderNote}
              </Descriptions.Item>
            ) : null}
          </Descriptions>

          <Divider style={{ margin: "12px 0" }} />
          {/* เฉพาะรายการปัจจุบัน */}
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
              <Descriptions.Item label="รวมจำนวนรายการ">
                {detail?.TotalItems ?? (detail?.Items?.length || 0)}
              </Descriptions.Item>
              <Descriptions.Item label="รวมจำนวนชิ้น">
                {currentTotal}
              </Descriptions.Item>
            </Descriptions>
          </div>

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
    </EmployeeSidebar>
  );
};

export default LaundryHistoryPage;
