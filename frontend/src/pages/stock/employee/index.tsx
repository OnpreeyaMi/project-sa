import React, { useState } from "react";
import EmpSidebar from "../../../component/layout/employee/empSidebar";
import { Card, Row, Typography, Button, Table, InputNumber, Space } from "antd";

const { Title, Text } = Typography;

const StockEmpPage: React.FC = () => {
  const [stockData, setStockData] = useState([
    {
      key: 1,
      name: "น้ำยาซักผ้า",
      quantity: 50,
      type: "detergent",
      lastUpdated: "2025-08-06T12:00:00Z",
      editor: "พนักงาน 1",
    },
    {
      key: 2,
      name: "น้ำยาปรับผ้านุ่ม",
      quantity: 30,
      type: "softener",
      lastUpdated: "2025-08-05T10:30:00Z",
      editor: "พนักงาน 2",
    },
    {
      key: 3,
      name: "น้ำยาอบผ้า",
      quantity: 20,
      type: "drying",
      lastUpdated: "2025-08-04T09:15:00Z",
      editor: "พนักงาน 3",
    },
    {
      key: 4,
      name: "น้ำยาปรับผ้านุ่ม",
      quantity: 10,
      type: "softener",
      lastUpdated: "2025-08-03T08:45:00Z",
      editor: "พนักงาน 4",
    },
    {
      key: 5,
      name: "น้ำยาอบผ้า",
      quantity: 5,
      type: "drying",
      lastUpdated: "2025-08-02T07:30:00Z",
      editor: "พนักงาน 5",
    },
  ]);

  const handleQuantityChange = (value: number | null, recordKey: number) => {
    if (value === null) return;
    const updatedData = stockData.map((item) =>
      item.key === recordKey
        ? {
            ...item,
            quantity: value,
            lastUpdated: new Date().toISOString(),
            editor: "พนักงานที่แก้ไข",
          }
        : item
    );
    setStockData(updatedData);
  };

  const columns = [
    {
      title: "ลําดับ",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "ชื่อสินค้า",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const color = type === "detergent" ? "blue" : type === "drying" ? "green" : "orange";
        return <Text style={{ color }}>{type}</Text>;
      },
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: any) => (
        <div>
            <InputNumber
            min={0}
            value={quantity}
            onChange={(value) => handleQuantityChange(value, record.key)}
        />
        {quantity < 10 && quantity > 0 && (
            <Text type="danger" style={{ marginLeft: 8 }}>
                ใกล้หมด
            </Text>
        )}{quantity == 0 && (
            <Text type="danger" style={{ marginLeft: 8 }}>
                หมดแล้ว
            </Text>
        )}
        </div>
      ),
    },
    {
      title: "วันที่แก้ไขล่าสุด",
      dataIndex: "lastUpdated",
      key: "lastUpdated",
      render: (lastUpdated: string) =>
        new Date(lastUpdated).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    {
      title: "ผู้แก้ไข",
      dataIndex: "editor",
      key: "editor",
    },
  ];

  return (
    <EmpSidebar>
      <Title level={4} style={{ textAlign: "center", marginTop: 30, marginBottom: 30 }}>
        สินค้าที่มีอยู่ในสต็อก
      </Title>

      <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 20 }}>
      </Row>

      <Row justify="center" style={{ marginBottom: 20 }}>
        <Space>
          <Button type="primary" style={{ height: 40, fontSize: 16 }}>
            เพิ่มรายการสินค้า
          </Button>
          <Button type="primary" style={{ height: 40, fontSize: 16 }}>
            ลบรายการสินค้า
          </Button>
          <Button type="primary" style={{ height: 40, fontSize: 16 }}>
            ยืนยัน
          </Button>
        </Space>
      </Row>

      <Card
        hoverable
        style={{
          width: "100%",
          height: "auto",
          textAlign: "center",
          borderRadius: 8,
          background: "#F9FBFF",
        }}
      >
        <Table
          columns={columns}
          dataSource={stockData}
          pagination={{ pageSize: 5 }}
          style={{ margin: "0 auto", width: "80%" }}
        />
      </Card>
    </EmpSidebar>
  );
};

export default StockEmpPage;