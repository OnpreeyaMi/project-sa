import React, { useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Modal,
  Table,
  Tag,
  Space,
  Popconfirm,
  Select,
} from "antd";
import dayjs from "dayjs";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";

interface PromotionCondition {
  type: string;
  operator: string;
  value: string;
}

interface Promotion {
  id: number;
  code: string;
  description: string;
  discount: number;
  discountType: string; // 'เปอร์เซ็นต์' หรือ 'จำนวนเงิน'
  conditions?: PromotionCondition[];
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null
  );
  const [form] = Form.useForm();

  const handleAddPromotion = () => {
    form.validateFields().then((values) => {
      const newPromotion: Promotion = {
        id: Date.now(),
        code: values.code,
        description: values.description,
        discount: values.discount,
        discountType: values.discountType,
        conditions: values.conditions || [],
        startDate: values.date[0].format("YYYY-MM-DD"),
        endDate: values.date[1].format("YYYY-MM-DD"),
        status: "ใช้งาน",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setPromotions((prev) => [...prev, newPromotion]);
      form.resetFields();
      setAddModalVisible(false);
    });
  };

  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    form.setFieldsValue({
      ...record,
      date: [dayjs(record.startDate), dayjs(record.endDate)],
    });
    setEditModalVisible(true);
  };

  const handleEditPromotion = () => {
    form.validateFields().then((values) => {
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === editingPromotion?.id
            ? {
                ...p,
                code: values.code,
                description: values.description,
                discount: values.discount,
                discountType: values.discountType,
                conditions: values.conditions || [],
                startDate: values.date[0].format("YYYY-MM-DD"),
                endDate: values.date[1].format("YYYY-MM-DD"),
              }
            : p
        )
      );
      setEditingPromotion(null);
      setEditModalVisible(false);
    });
  };

  const columns = [
    { title: "รหัส", dataIndex: "code", key: "code" },
    { title: "รายละเอียด", dataIndex: "description", key: "description" },
    { title: "ประเภท", dataIndex: "discountType", key: "discountType" },
    {
      title: "เงื่อนไข",
      dataIndex: "conditions",
      key: "conditions",
      render: (conds: PromotionCondition[] | undefined) =>
        conds?.map((c) => `${c.type} ${c.operator} ${c.value}`).join(", ") ||
        "-",
    },
    { title: "ส่วนลด", dataIndex: "discount", key: "discount" },
    { title: "วันที่เริ่ม", dataIndex: "startDate", key: "startDate" },
    { title: "วันที่สิ้นสุด", dataIndex: "endDate", key: "endDate" },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "ใช้งาน" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "จัดการ",
      key: "action",
      render: (_: any, record: Promotion) => (
        <Space>
          <Button
            type="primary"
            onClick={() => handleEdit(record)}
            style={{ backgroundColor: "#F6D55C", color: "white" }}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจว่าจะลบโปรโมชั่นนี้?"
            okText="ลบ"
            cancelText="ยกเลิก"
            onConfirm={() =>
              setPromotions((prev) => prev.filter((p) => p.id !== record.id))
            }
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 bg-gray-50 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-900">
            จัดการโปรโมชั่น
          </h1>
          <Button
            type="primary"
            style={{ backgroundColor: "#0E4587" }}
            onClick={() => {
              form.resetFields();
              setAddModalVisible(true);
            }}
          >
            + เพิ่มโปรโมชั่น
          </Button>
        </div>

        {/* Table */}
        <Table columns={columns} dataSource={promotions} rowKey="id" />

        {/* Modal เพิ่มโปรโมชั่น */}
        <Modal
          title="เพิ่มโปรโมชั่นใหม่"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={handleAddPromotion}
          okText="เพิ่ม"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="code"
              label="รหัสโปรโมชั่น"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="รายละเอียด"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="discountType"
              label="ประเภท"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="เปอร์เซ็นต์">เปอร์เซ็นต์</Select.Option>
                <Select.Option value="จำนวนเงิน">จำนวนเงิน</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="discount"
              label="ส่วนลด"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="date"
              label="ช่วงวันที่ใช้งาน"
              rules={[{ required: true }]}
            >
              <DatePicker.RangePicker />
            </Form.Item>
            {/* เงื่อนไข */}
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="ประเภทเงื่อนไข">
                          <Select.Option value="MinOrderAmount">
                            ยอดสั่งซื้อขั้นต่ำ
                          </Select.Option>
                          <Select.Option value="ItemCategory">
                            หมวดสินค้า
                          </Select.Option>
                          <Select.Option value="CustomerGroup">
                            กลุ่มลูกค้า
                          </Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "operator"]}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="Operator">
                          <Select.Option value=">=">{">="}</Select.Option>
                          <Select.Option value="<=">{"<="}</Select.Option>
                          <Select.Option value="=">{"="}</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="ค่า" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มเงื่อนไข
                  </Button>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>

        {/* Modal แก้ไขโปรโมชั่น */}
        <Modal
          title="แก้ไขโปรโมชั่น"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={handleEditPromotion}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="code"
              label="รหัสโปรโมชั่น"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="description"
              label="รายละเอียด"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="discountType"
              label="ประเภท"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="เปอร์เซ็นต์">เปอร์เซ็นต์</Select.Option>
                <Select.Option value="จำนวนเงิน">จำนวนเงิน</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="discount"
              label="ส่วนลด"
              rules={[{ required: true }]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="date"
              label="ช่วงวันที่ใช้งาน"
              rules={[{ required: true }]}
            >
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: "flex", marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="ประเภทเงื่อนไข">
                          <Select.Option value="MinOrderAmount">
                            ยอดสั่งซื้อขั้นต่ำ
                          </Select.Option>
                          <Select.Option value="ItemCategory">
                            หมวดสินค้า
                          </Select.Option>
                          <Select.Option value="CustomerGroup">
                            กลุ่มลูกค้า
                          </Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "operator"]}
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="Operator">
                          <Select.Option value=">=">{">="}</Select.Option>
                          <Select.Option value="<=">{"<="}</Select.Option>
                          <Select.Option value="=">{"="}</Select.Option>
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "value"]}
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="ค่า" />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block>
                    + เพิ่มเงื่อนไข
                  </Button>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>
      </div>
    </AdminSidebar>
  );
};

export default PromotionManagement;
