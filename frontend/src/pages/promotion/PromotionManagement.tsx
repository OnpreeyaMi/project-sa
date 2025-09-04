import React, { useState, useEffect } from "react";
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
  Upload,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";

interface PromotionCondition {
  id?: number;
  ConditionType: string;
  Value: string;
}

interface Promotion {
  ID: number;
  PromotionName: string;
  Description: string;
  DiscountValue: number;
  StartDate: string;
  EndDate: string;
  Status: string;
  PromoImage: string;
  DiscountTypeID: number;
  DiscountType?: { TypeName: string };
  PromotionCondition?: PromotionCondition[];
}

const PromotionManagement: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // ดึงข้อมูลโปรโมชั่น
  const fetchPromotions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/promotions");
      setPromotions(res.data);
    } catch (err) {
      message.error("โหลดข้อมูลโปรโมชั่นล้มเหลว");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // ฟังก์ชันแปลงไฟล์เป็น base64 เพื่อ preview
  const getBase64 = (file: File | Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // handle อัปโหลดรูป
  const handleImageChange = async (info: any) => {
    const file = info.file.originFileObj;
    if (file) {
      const url = await getBase64(file);
      setImageUrl(url);
    }
  };

  // เพิ่มโปรโมชั่น
  const handleAddPromotion = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        promotionName: values.PromotionName,
        description: values.Description,
        discountValue: values.DiscountValue,
        startDate: values.date[0].format("YYYY-MM-DD"),
        endDate: values.date[1].format("YYYY-MM-DD"),
        status: "ใช้งาน",
        promoImage: imageUrl || "",
        discountTypeId: values.DiscountTypeID,
        conditions: (values.conditions || []).map((c: any) => ({
          conditionType: c.ConditionType,
          value: c.Value,
        })),
      };
      await axios.post("http://localhost:8080/promotions", payload);
      message.success("เพิ่มโปรโมชั่นสำเร็จ");
      setAddModalVisible(false);
      setImageUrl(null);
      form.resetFields();
      fetchPromotions();
    } catch (err: any) {
      message.error(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  // แก้ไขโปรโมชั่น
  const handleEdit = (record: Promotion) => {
    setEditingPromotion(record);
    setImageUrl(record.PromoImage || null);
    form.setFieldsValue({
      PromotionName: record.PromotionName,
      Description: record.Description,
      DiscountValue: record.DiscountValue,
      DiscountTypeID: record.DiscountTypeID,
      date: [dayjs(record.StartDate), dayjs(record.EndDate)],
      conditions: record.PromotionCondition?.map((c) => ({
        ConditionType: c.ConditionType,
        Value: c.Value,
      })),
    });
    setEditModalVisible(true);
  };

  const handleEditPromotion = async () => {
    if (!editingPromotion || !editingPromotion.ID) {
      message.error("ไม่พบข้อมูลโปรโมชั่นที่จะแก้ไข");
      return;
    }
    try {
      const values = await form.validateFields();
      const payload = {
        promotionName: values.PromotionName,
        description: values.Description,
        discountValue: values.DiscountValue,
        startDate: values.date[0].format("YYYY-MM-DD"),
        endDate: values.date[1].format("YYYY-MM-DD"),
        status: values.Status,
        promoImage: imageUrl || "",
        discountTypeId: values.DiscountTypeID,
        conditions: (values.conditions || []).map((c: any) => ({
          conditionType: c.ConditionType,
          value: c.Value,
        })),
      };
      await axios.put(`http://localhost:8080/promotions/${editingPromotion.ID}`, payload);
      message.success("แก้ไขโปรโมชั่นสำเร็จ");
      setEditModalVisible(false);
      setEditingPromotion(null);
      setImageUrl(null);
      form.resetFields();
      fetchPromotions();
    } catch (err: any) {
      message.error(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  // ลบโปรโมชั่น
  const handleDeletePromotion = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/promotions/${id}`);
      message.success("ลบโปรโมชั่นสำเร็จ");
      fetchPromotions();
    } catch (err: any) {
      message.error(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  // columns สำหรับ Table
  const columns = [
    { title: "ชื่อโปรโมชั่น", dataIndex: "PromotionName", key: "PromotionName" },
    { title: "รายละเอียด", dataIndex: "Description", key: "Description" },
    {
      title: "ประเภท",
      dataIndex: ["DiscountType", "TypeName"],
      key: "DiscountType",
      render: (_: any, record: Promotion) => record.DiscountType?.TypeName || "-",
    },
    {
      title: "เงื่อนไข",
      dataIndex: "PromotionCondition",
      key: "PromotionCondition",
      render: (conds: PromotionCondition[] | undefined) =>
        conds?.map((c) => `${c.ConditionType}: ${c.Value}`).join(", ") || "-",
    },
    { title: "ส่วนลด", dataIndex: "DiscountValue", key: "DiscountValue" },
    { title: "วันที่เริ่ม", dataIndex: "StartDate", key: "StartDate" },
    { title: "วันที่สิ้นสุด", dataIndex: "EndDate", key: "EndDate" },
    {
      title: "สถานะ",
      dataIndex: "Status",
      key: "Status",
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
            onConfirm={() => handleDeletePromotion(record.ID)}
          >
            <Button danger>ลบ</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ฟิลเตอร์โปรโมชั่นตามข้อความค้นหา
  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.PromotionName?.toLowerCase().includes(searchText.toLowerCase()) ||
      promo.Description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 bg-white font-sans">
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
              setImageUrl(null);
              setAddModalVisible(true);
            }}
          >
            + เพิ่มโปรโมชั่น
          </Button>
        </div>

        {/* ช่องค้นหา */}
        <Input.Search
          placeholder="ค้นหาชื่อ / รายละเอียดโปรโมชั่น"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
          allowClear
        />

        {/* Table */}
        <Table columns={columns} dataSource={filteredPromotions} rowKey="id" />

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
            {/* อัปโหลดรูปภาพ */}
            <Form.Item label="รูปภาพโปรโมชั่น" name="PromoImage">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                accept="image/*"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="promotion" style={{ width: "100%" }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>อัปโหลด</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item
              name="PromotionName"
              label="ชื่อโปรโมชั่น"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Description"
              label="รายละเอียด"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="DiscountTypeID"
              label="ประเภท"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={1}>เปอร์เซ็นต์</Select.Option>
                <Select.Option value={2}>จำนวนเงิน</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="DiscountValue"
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
            {/* ช่องกำหนดสถานะ */}
            <Form.Item
              name="Status"
              label="สถานะ"
              rules={[{ required: true }]}
              initialValue="ใช้งาน"
            >
              <Select>
                <Select.Option value="ใช้งาน">ใช้งาน</Select.Option>
                <Select.Option value="ไม่ใช้งาน">ไม่ใช้งาน</Select.Option>
              </Select>
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
                        name={[name, "ConditionType"]}
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
                        name={[name, "Value"]}
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
            {/* อัปโหลดรูปภาพ */}
            <Form.Item label="รูปภาพโปรโมชั่น" name="PromoImage">
              <Upload
                listType="picture-card"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleImageChange}
                accept="image/*"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="promotion" style={{ width: "100%" }} />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>อัปโหลด</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item
              name="PromotionName"
              label="ชื่อโปรโมชั่น"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="Description"
              label="รายละเอียด"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="DiscountTypeID"
              label="ประเภท"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value={1}>เปอร์เซ็นต์</Select.Option>
                <Select.Option value={2}>จำนวนเงิน</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="DiscountValue"
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
            {/* ช่องกำหนดสถานะ */}
            <Form.Item
              name="Status"
              label="สถานะ"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="ใช้งาน">ใช้งาน</Select.Option>
                <Select.Option value="ไม่ใช้งาน">ไม่ใช้งาน</Select.Option>
              </Select>
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
                        name={[name, "ConditionType"]}
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
                        name={[name, "Value"]}
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
