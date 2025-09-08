import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import React, { useState, useMemo } from "react";
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
} from "antd";
import { SearchOutlined, RollbackOutlined, PrinterOutlined } from "@ant-design/icons";
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

const LaundryHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState<number | undefined>();
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // ใบเสร็จ
  const [billOpen, setBillOpen] = useState(false);

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
          <span className="pill">ตรวจสอบย้อนหลัง • ป้องกันตกหล่น</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              icon={<RollbackOutlined />}
              onClick={() => navigate(-1)}
              size="middle"
              shape="round"
            >
              ย้อนกลับ
            </Button>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              disabled={!detail}
              onClick={() => setBillOpen(true)}
              size="middle"
              shape="round"
            >
              ออกบิล
            </Button>
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
              style={{ width: 260 }}
              size="large"
            />
            <Button type="primary" onClick={load} loading={loading} size="large" shape="round">
              ดึงประวัติ
            </Button>
          </Space>

          <Divider className="soft-divider" />

          {detail ? (
            <>
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
                  {new Date(detail.CreatedAt).toLocaleString()}
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

              {/* Summary chips */}
              <Space size="small" style={{ marginBottom: 8 }}>
                <span className="pill">จำนวนครั้งที่บันทึก: {history.length}</span>
                <span className="pill">รวมชิ้น: {totalQty}</span>
              </Space>

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
                    render: (v) => new Date(v).toLocaleString(),
                  },
                  { title: "ประเภทผ้า", dataIndex: "ClothTypeName" },
                  { title: "บริการ", dataIndex: "ServiceType", width: 180 },
                  { title: "จำนวน", dataIndex: "Quantity", width: 120, align: "right" as const },
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
            <Descriptions.Item label="วันที่สร้าง">
              {detail ? new Date(detail.CreatedAt).toLocaleString() : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="ลูกค้า">{detail?.CustomerName}</Descriptions.Item>
            <Descriptions.Item label="เบอร์">{detail?.Phone}</Descriptions.Item>
            <Descriptions.Item label="ที่อยู่" span={2}>{detail?.Address}</Descriptions.Item>
            <Descriptions.Item label="บริการ" span={2}>
              {renderServiceTags(detail)}
            </Descriptions.Item>
            {detail?.OrderNote && (
              <Descriptions.Item label="หมายเหตุ (ลูกค้า)" span={2}>
                {detail.OrderNote}
              </Descriptions.Item>
            )}
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
    </EmployeeSidebar>
  );
};

export default LaundryHistoryPage;
