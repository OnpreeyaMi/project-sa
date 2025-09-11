import React, { useState, useMemo } from "react";
import { Button, Input, Table, Tag, Row, Col, Card, Statistic, Select } from "antd";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Link } from "react-router-dom";
import { SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import "./StatusUpdate.css";
import { useEffect } from "react";

const StatusUpdate: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("http://localhost:8000/ordersdetails")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  // Summary statistics (mocked for now, can be calculated from orders)
  const safeOrders = Array.isArray(orders) ? orders : [];
  const pending = safeOrders.filter(o => o.status === "รอดำเนินการ").length;
  const washing = safeOrders.filter(o => o.status === "กำลังซัก").length;
  const drying = safeOrders.filter(o => o.status === "กำลังอบ").length;
  const completed = safeOrders.filter(o => o.status === "เสร็จสิ้น").length;

  // Filtered data
  const filteredOrders = useMemo(() => {
    return safeOrders.filter(order => {
      const customerName = order.Customer ? `${order.Customer.FirstName} ${order.Customer.LastName}` : "";
      const matchSearch =
        order.ID?.toString().includes(searchText) ||
        customerName.toLowerCase().includes(searchText.toLowerCase());
      const matchStatus = statusFilter ? order.status === statusFilter : true;
      return matchSearch && matchStatus;
    });
  }, [orders, searchText, statusFilter]);

useEffect(() => {
  fetch("http://localhost:8000/ordersdetails")
    .then(res => res.json())
    .then(data => {
      setOrders(data);  // จะได้ array ของ order + status
      setLoading(false);
    })
    .catch(err => {
      console.error("Error fetching orders:", err);
      setLoading(false);
    });
}, []);

  
  // mock data (แทน DB จริง)
  const columns = [
    {
      title: "รหัสออเดอร์",
      dataIndex: "ID",
      key: "ID",
      render: (id: any) => <b>#{id}</b>,
    },
    {
      title: "ชื่อลูกค้า",
      key: "customerName",
      render: (_: any, record: any) =>
        record.Customer
          ? `${record.Customer.FirstName} ${record.Customer.LastName}`
          : "-",
    },
    {
      title: "ขนาดถังซัก (กก.)",
      dataIndex: "washer_capacity",
      key: "washer_capacity",
      align: "center" as const,
      render: (val: any) => (val && val > 0 ? val : "-"),
    },
    {
      title: "ขนาดถังอบ (กก.)",
      dataIndex: "dryer_capacity",
      key: "dryer_capacity",
      align: "center" as const,
      render: (val: any) => (val && val > 0 ? val : "-"),
    },
    {
      title: "จำนวนชิ้น",
      key: "totalItems",
      align: "center" as const,
      render: (_: any, record: any) =>
        record.SortedClothes?.sorted_count || record.SortedClothes?.sortedCount || record.totalItems || "-",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (status: string) => {
        // สีและพื้นหลังแต่ละสถานะ
        let color = '#bdbdbd';
        let bg = '#f5f5f5';
        if (status === "รอดำเนินการ") { color = '#fba92dff'; bg = '#fffde7'; }
        if (status === "กำลังซัก") { color = '#191cd2ff'; bg = '#e3eefdff'; }
        if (status === "กำลังอบ") { color = '#00bcd4'; bg = '#e1f5fe'; }
        if (status === "เสร็จสิ้น") { color = '#388e3c'; bg = '#e8f5e9'; }
        if (status === "รับผ้าเรียบร้อย") { color = '#9c22d9ff'; bg = '#f7e0ffff'; }
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: bg,
            color: color,
            borderRadius: 16,
            padding: '2px 14px 2px 8px',
            fontWeight: 500,
            fontSize: 15,
            border: 'none',
            minWidth: 90,
            justifyContent: 'center',
          }}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              marginRight: 8,
            }} />
            {status}
          </span>
        );
      },
    },
    {
      title: "การจัดการ",
      key: "action",
      align: "center" as const,
      render: (_: any, record: any) => (
        <Link to={`/employee/orders/${record.ID}`}>
          <Button
            type="primary"
            size="small"
            style={{
              borderRadius: 12,
              background: '#166bc0ff',
              color: '#fff',
              fontWeight: 200,
              fontSize: 14,
              border: 'none',
              boxShadow: '0 1px 4px #e3f2fd',
              padding: '0 22px',
              height: 38,
            }}
          >
            ดูรายละเอียด
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <EmployeeSidebar>
      <div style={{ padding: 24, background: "#f5f7fa", minHeight: "100vh" }}>
        {/* Summary Cards */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 16, background: '#fffde7', boxShadow: "0 2px 8px #f0f1f2", minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 120 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#fbc02d', marginBottom: 8 }}>รอดำเนินการ</span>
                <span style={{ color: '#fbc02d', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{pending}</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 16, background: '#e3f2fd', boxShadow: "0 2px 8px #f0f1f2", minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 120 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#1565c0', marginBottom: 8 }}>กำลังซัก</span>
                <span style={{ color: '#1976d2', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{washing}</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 16, background: '#e1f5fe', boxShadow: "0 2px 8px #f0f1f2", minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 120 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#0097a7', marginBottom: 8 }}>กำลังอบ</span>
                <span style={{ color: '#00bcd4', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{drying}</span>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 16, background: '#e8f5e9', boxShadow: "0 2px 8px #f0f1f2", minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
              <div style={{ width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 120 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32', marginBottom: 8 }}>เสร็จสิ้น</span>
                <span style={{ color: '#388e3c', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{completed}</span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Search & Filter Bar */}
        <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
          <Col flex="240px">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="ค้นหารหัสออเดอร์หรือชื่อลูกค้า..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col flex="180px">
            <Select
              allowClear
              style={{ width: "100%", borderRadius: 8 }}
              placeholder={<span><FilterOutlined /> สถานะ</span>}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "รอดำเนินการ", label: "รอดำเนินการ" },
                { value: "กำลังซัก", label: "กำลังซัก" },
                { value: "กำลังอบ", label: "กำลังอบ" },
                { value: "เสร็จสิ้น", label: "เสร็จสิ้น" },
              ]}
            />
          </Col>
          <Col flex="none">
            <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(""); setStatusFilter(undefined); }}>
              รีเซ็ต
            </Button>
          </Col>
          <Col flex="auto" />
        </Row>

        {/* Order Table */}
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: "0 2px 8px #f0f1f2" }}>
          <Table
            loading={loading}
            dataSource={filteredOrders}
            columns={columns}
            rowKey="ID"
            pagination={{ pageSize: 20, showSizeChanger: false }}
            bordered
            style={{ background: "white", borderRadius: 12 }}
            title={() => <span style={{ fontWeight: 600, fontSize: 18 }}>📋 รายการออเดอร์</span>}
          />
        </Card>
      </div>
    </EmployeeSidebar>
  );
};

export default StatusUpdate;