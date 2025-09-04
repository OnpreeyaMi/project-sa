import React, { useState } from "react";
import EmpSidebar from "../../../component/layout/admin/AdminSidebar";
import {
  Card,
  Row,
  Typography,
  Button,
  Table,
  Space,
  Popconfirm,
  Modal,
  Input,
  InputNumber,
  Form,
  Select,
} from "antd";

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
  const [stockData, setStockData] = useState<StockItem[]>([
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
      quantity: 0,
      type: "softener",
      lastUpdated: "2025-08-03T08:45:00Z",
      editor: "พนักงาน 4",
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (key: number) => {
    setStockData(stockData.filter((item) => item.key !== key));
  };

  const handleAddStock = (values: any) => {
    const newItem: StockItem = {
      key: stockData.length
        ? Math.max(...stockData.map((i) => i.key)) + 1
        : 1,
      name: values.name,
      type: values.type, // ใช้ type จาก Select
      quantity: values.quantity,
      lastUpdated: new Date().toISOString(),
      editor: "currentUserName",
    };
    setStockData([...stockData, newItem]);
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: "ลำดับ", dataIndex: "key", key: "key" },
    { title: "ชื่อสินค้า", dataIndex: "name", key: "name" },
    {
      title: "ประเภท",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const color =
          type === "detergent"
            ? "blue"
            : type === "drying"
            ? "green"
            : "orange";
        return <Text style={{ color }}>{type}</Text>;
      },
    },
    {
      title: "จำนวนคงเหลือ",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number, record: StockItem) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>
            {quantity}{" "}
            {quantity < 10 && quantity > 0 && (
              <Text type="danger">ใกล้หมด</Text>
            )}
            {quantity === 0 && <Text type="danger">หมดแล้ว</Text>}
          </Text>
          <Button
            type="primary"
            danger
            disabled={quantity <= 0}
            onClick={() => {
              const updatedData = stockData.map((item) =>
                item.key === record.key
                  ? {
                      ...item,
                      quantity: item.quantity - 1,
                      lastUpdated: new Date().toISOString(),
                      editor: "currentUserName",
                    }
                  : item
              );
              setStockData(updatedData);
            }}
          >
            -
          </Button>
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
      render: (editor: string, record: StockItem) => (
        <Space>
          <Text>{editor}</Text>
          <Popconfirm
            title="คุณแน่ใจหรือไม่ที่จะลบสินค้า?"
            onConfirm={() => handleDelete(record.key)}
            okText="ใช่"
            cancelText="ยกเลิก"
          >
            <Button type="link" danger>
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <EmpSidebar>
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
          <Button type="primary" style={{ height: 40, fontSize: 16 }}>
            ซื้อสินค้า
          </Button>
        </Space>
      </Row>

      <Card
        hoverable
        style={{
          width: "100%",
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

      <Modal
        title={<span style={{ color: "#20639B", fontWeight: "bold", fontSize: "20px" }}>เพิ่มรายการสินค้า</span>} 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        style={{ top: "15%", textAlign: "center" }}
        
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
              <Option value="drying">น้ำยาอบผ้า</Option>
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
    </EmpSidebar>
  );
};

export default StockAdminPage;
