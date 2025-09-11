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
      const res = await axios.get("http://localhost:8000/promotions");
      setPromotions(res.data);
    } catch (err) {
      message.error("โหลดข้อมูลโปรโมชั่นล้มเหลว");
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // handle อัปโหลดรูป (แบบ orderpage)
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
  };

  // เพิ่มโปรโมชั่น
  const handleAddPromotion = async () => {
    try {
      const values = await form.validateFields();
      const promoImage = imageUrl || '';
      const payload = {
        promotionName: values.PromotionName,
        description: values.Description,
        discountValue: values.DiscountValue,
        startDate: values.date[0].format("YYYY-MM-DD"),
        endDate: values.date[1].format("YYYY-MM-DD"),
        status: values.Status || "ใช้งาน",
        promoImage,
        discountTypeId: values.DiscountTypeID,
        conditions: (values.conditions || []).map((c: any) => ({
          conditionType: c.ConditionType,
          value: c.Value,
        })),
      };
      console.log("Promotion POST payload:", payload);
      await axios.post("http://localhost:8000/promotions", payload);
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
      const promoImage = imageUrl || editingPromotion.PromoImage || "";
      const payload = {
        promotionName: values.PromotionName,
        description: values.Description,
        discountValue: values.DiscountValue,
        startDate: values.date[0].format("YYYY-MM-DD"),
        endDate: values.date[1].format("YYYY-MM-DD"),
        status: values.Status,
        promoImage,
        discountTypeId: values.DiscountTypeID,
        conditions: (values.conditions || []).map((c: any) => ({
          conditionType: c.ConditionType,
          value: c.Value,
        })),
      };
      console.log("Promotion PUT payload:", payload); // debug log
      await axios.put(`http://localhost:8000/promotions/${editingPromotion.ID}`, payload);
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
      await axios.delete(`http://localhost:8000/promotions/${id}`);
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
      <div className="min-h-screen p-8 font-sans bg-gray-50">
        {/* ส่วนหัว */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการโปรโมชั่น</h1>
            <p className="text-gray-500">ข้อมูลโปรโมชั่นทั้งหมดในระบบ</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
            onClick={() => { form.resetFields(); setImageUrl(null); setAddModalVisible(true); }}>
            + เพิ่มโปรโมชั่น
          </button>
        </div>

        {/* กล่อง filter/search */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input.Search
              placeholder="ค้นหาชื่อ / รายละเอียดโปรโมชั่น"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              allowClear
            />
          </div>
        </div>

        {/* ตารางโปรโมชั่น */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <Table columns={columns} dataSource={filteredPromotions} rowKey="ID" />
        </div>

        {/* Modal เพิ่มโปรโมชั่น */}
        <Modal
          title="เพิ่มโปรโมชั่นใหม่"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={handleAddPromotion}
          okText="เพิ่ม"
          cancelText="ยกเลิก"
          width={1000}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'flex', gap: 32 }}>
              {/* ฝั่งซ้าย: ข้อมูลฟอร์ม */}
              <div style={{ flex: 0.9 }}>
                <Form.Item name="PromotionName" label="ชื่อโปรโมชั่น" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="Description" label="รายละเอียด" rules={[{ required: true }]}>
                  <Input.TextArea />
                </Form.Item>
                <Form.Item name="DiscountTypeID" label="ประเภท" rules={[{ required: true }]}>
                  <Select>
                    <Select.Option value={1}>เปอร์เซ็นต์</Select.Option>
                    <Select.Option value={2}>จำนวนเงิน</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item name="DiscountValue" label="ส่วนลด" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.List name="conditions">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                          <Form.Item {...restField} name={[name, "ConditionType"]} rules={[{ required: true }]}>
                            <Select placeholder="ประเภทเงื่อนไข">
                              <Select.Option value="MinOrderAmount">ยอดสั่งซื้อขั้นต่ำ</Select.Option>
                              <Select.Option value="MinQuantity">จำนวนชิ้นขั้นต่ำ</Select.Option>
                              <Select.Option value="FirstOrderOnly">เฉพาะออเดอร์แรก</Select.Option>
                              <Select.Option value="UsageLimit">จำนวนครั้งที่ใช้ได้</Select.Option>
                            </Select>
                          </Form.Item>
                          <Form.Item {...restField} name={[name, "Value"]} rules={[{ required: true }]}>
                            <Input placeholder="ค่า" />
                          </Form.Item>
                          <Button danger onClick={() => remove(name)}>ลบ</Button>
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block>
                        + เพิ่มเงื่อนไข
                      </Button>
                    </>
                  )}
                </Form.List>
              </div>
              {/* ฝั่งขวา: อัปโหลดรูปภาพ + ช่วงวัน + สถานะ */}
              <div style={{ width: 400, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Form.Item
                  label="รูปภาพโปรโมชั่น"
                  style={{ width: '100%' }}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={file => {
                      handleImageUpload(file);
                      return false;
                    }}
                    onRemove={() => setImageUrl(null)}
                    accept="image/*"
                    style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {!imageUrl ? (
                      <div style={{ fontSize: 16 }}>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>อัปโหลด</div>
                      </div>
                    ) : (
                      <img src={imageUrl} alt="promotion" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item name="date" label="ช่วงวันที่ใช้งาน" rules={[{ required: true }]} style={{ width: '100%', marginTop: 24 }} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="Status" label="สถานะ" rules={[{ required: true }]} style={{ width: '100%' }} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <Select>
                    <Select.Option value="ใช้งาน">ใช้งาน</Select.Option>
                    <Select.Option value="ไม่ใช้งาน">ไม่ใช้งาน</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
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
          width={1000}
        >
          <Form form={form} layout="vertical">
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ flex: 0.9 }}>
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
                <Form.List name="conditions">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...restField }) => (
                        <Space
                          key={key}
                          align="baseline"
                          style={{ display: "flex", marginBottom: 8 }}
                        >
                          {/* เลือกประเภทเงื่อนไข */}
                          <Form.Item
                            {...restField}
                            name={[name, "ConditionType"]}
                            rules={[{ required: true, message: "กรุณาเลือกประเภทเงื่อนไข" }]}
                          >
                            <Select placeholder="ประเภทเงื่อนไข" style={{ width: 200 }}>
                              <Select.Option value="MinOrderAmount">ยอดสั่งซื้อขั้นต่ำ</Select.Option>
                              <Select.Option value="MinQuantity">จำนวนขั้นต่ำ</Select.Option>
                              <Select.Option value="FirstOrderOnly">เฉพาะออเดอร์แรก</Select.Option>
                              <Select.Option value="UsageLimit">จำนวนครั้งที่ใช้ได้</Select.Option>
                            </Select>
                          </Form.Item>

                          {/* Input ของค่า Value จะเปลี่ยนตาม ConditionType */}
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const type = getFieldValue(["conditions", name, "ConditionType"]);

                              if (type === "MinOrderAmount" || type === "MinQuantity" || type === "UsageLimit") {
                                return (
                                  <Form.Item
                                    {...restField}
                                    name={[name, "Value"]}
                                    rules={[{ required: true, message: "กรุณากรอกค่า" }]}
                                  >
                                    <InputNumber placeholder="ตัวเลข" style={{ width: 150 }} />
                                  </Form.Item>
                                );
                              }

                              if (type === "FirstOrderOnly") {
                                return null; // ไม่ต้องกรอกค่า
                              }

                              return null;
                            }}
                          </Form.Item>

                          <Button danger onClick={() => remove(name)}>ลบ</Button>
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} block>
                        + เพิ่มเงื่อนไข
                      </Button>
                    </>
                  )}
                </Form.List>

              </div>
              <div style={{ width: 400, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Form.Item
                  label="รูปภาพโปรโมชั่น"
                  style={{ width: '100%' }}
                  labelCol={{ span: 24 }}   // label กินเต็มบรรทัด
                  wrapperCol={{ span: 24 }} // field อยู่บรรทัดใหม่
                  getValueFromEvent={e => {
                    if (e && e.file && e.file.originFileObj) {
                      const reader = new FileReader();
                      reader.readAsDataURL(e.file.originFileObj);
                      reader.onload = () => {
                        setImageUrl(reader.result as string);
                        form.setFieldsValue({ PromoImage: reader.result });
                      };
                      return '';
                    }
                    return imageUrl || '';
                  }}
                >
                  <Upload
                    listType="picture-card"
                    showUploadList={false}
                    beforeUpload={file => {
                      handleImageUpload(file);
                      return false;
                    }}
                    onRemove={() => setImageUrl(null)}
                    accept="image/*"
                    style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    {!imageUrl ? (
                      <div style={{ fontSize: 16 }}>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>อัปโหลด</div>
                      </div>
                    ) : (
                      <img src={imageUrl} alt="promotion" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    )}
                  </Upload>
                </Form.Item>
                <Form.Item name="date" label="ช่วงวันที่ใช้งาน" rules={[{ required: true }]} style={{ width: '100%', marginTop: 24 }} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="Status" label="สถานะ" rules={[{ required: true }]} style={{ width: '100%' }} labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}>
                  <Select>
                    <Select.Option value="ใช้งาน">ใช้งาน</Select.Option>
                    <Select.Option value="ไม่ใช้งาน">ไม่ใช้งาน</Select.Option>
                  </Select>
                </Form.Item>
              </div>
            </div>
          </Form>
        </Modal>
      </div>
    </AdminSidebar>
  );
};

export default PromotionManagement;
