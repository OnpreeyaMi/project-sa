import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "../../hooks/UserContext";
import axios from "axios";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  List,
  Modal,
  Row,
  Col,
  Avatar,
  Typography,
  Space,
  message,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";

const { Option } = Select;
const { Title, Text } = Typography;

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

type AddressVM = {
  id: number;
  detail: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

const Profile: React.FC = () => {
  const { user, refreshCustomer } = useUser();
  const token = useMemo(() => user?.token ?? "", [user?.token]);

  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState<AddressVM[]>([]);
  const [addressModal, setAddressModal] = useState(false);
  const [addressEdit, setAddressEdit] = useState<AddressVM | null>(null);
  const [loading, setLoading] = useState(false);

  // -------- Helpers --------
  const asAddrVM = (raw: any): AddressVM => ({
    id: raw.ID ?? raw.id,
    detail: raw.AddressDetails ?? raw.detail ?? "",
    latitude: Number(raw.Latitude ?? raw.latitude ?? 0),
    longitude: Number(raw.Longitude ?? raw.longitude ?? 0),
    isDefault: Boolean(raw.IsDefault ?? raw.isDefault ?? false),
  });

  const loadMyProfile = async () => {
    if (!token) return;
    try {
      setLoading(true);
      await refreshCustomer(); // อัปเดต context จาก /customer/profile
      const cust = (user?.customer ||
        JSON.parse(localStorage.getItem("user") || "{}")?.customer) as any;

      if (cust) {
        form.setFieldsValue({
          firstName: cust.firstName,
          lastName: cust.lastName,
          phone: cust.phone,
          gender: cust.gender?.id,
          email: user?.email ?? "",
        });
        setAddresses((cust.addresses || []).map(asAddrVM));
      }
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ----- บันทึกข้อมูลส่วนตัว -----
  const handleSave = async (values: any) => {
    if (!token) return;
    try {
      setLoading(true);
      // Backend Go มัก bind PascalCase
      await axios.put(
        `${API_BASE}/customer/profile`,
        {
          FirstName: values.firstName,
          LastName: values.lastName,
          PhoneNumber: values.phone,
          GenderID: values.gender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditMode(false);
      await loadMyProfile();
      message.success("บันทึกข้อมูลส่วนตัวแล้ว");
    } catch (err: any) {
      console.error(err);
      Modal.error({ title: "บันทึกข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  // ----- เพิ่ม/แก้ไขที่อยู่ -----
  const handleAddressSubmit = async (values: any) => {
    if (!token) return;
    try {
      setLoading(true);
      const payload = {
        AddressDetails: values.detail,
        Latitude: parseFloat(values.latitude),
        Longitude: parseFloat(values.longitude),
      };

      if (addressEdit) {
        // PUT /customer/addresses/:id
        await axios.put(`${API_BASE}/customer/addresses/${addressEdit.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // POST /customer/addresses
        await axios.post(`${API_BASE}/customer/addresses`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setAddressModal(false);
      setAddressEdit(null);
      await loadMyProfile();
      message.success(addressEdit ? "แก้ไขที่อยู่แล้ว" : "เพิ่มที่อยู่แล้ว");
    } catch (err) {
      console.error(err);
      Modal.error({ title: "เพิ่ม/แก้ไขที่อยู่ไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  // ----- ลบที่อยู่ -----
  const handleDeleteAddress = async (id: number) => {
    if (!token) return;
    Modal.confirm({
      title: "ต้องการลบที่อยู่นี้ใช่หรือไม่?",
      onOk: async () => {
        try {
          setLoading(true);
          // DELETE /customer/addresses/:id
          await axios.delete(`${API_BASE}/customer/addresses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          await loadMyProfile();
          message.success("ลบที่อยู่แล้ว");
        } catch (err) {
          console.error(err);
          Modal.error({ title: "ลบที่อยู่ไม่สำเร็จ" });
        } finally {
          setLoading(false);
        }
      },
    });
    setEditPosition(addr.latlng);
    setEditModalVisible(true);
  };

  // ----- ตั้งค่าเป็นที่อยู่หลัก -----
  const handleSetMain = async (id: number) => {
    if (!token) return;
    try {
      setLoading(true);
      // PUT /customer/addresses/:id/main
      await axios.put(
        `${API_BASE}/customer/addresses/${id}/main`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadMyProfile();
      message.success("ตั้งเป็นที่อยู่หลักแล้ว");
    } catch (err) {
      console.error(err);
      message.error("ตั้งที่อยู่หลักไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerSidebar>
      <Row justify="center" style={{ marginTop: 32 }} gutter={32}>
        <Col xs={24} sm={20} md={16} lg={12}>
          {/* ส่วนบน: ข้อมูลส่วนตัว */}
          <Card
            loading={loading}
            style={{ marginBottom: 32, borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2" }}
          >
            <Space direction="horizontal" align="center" style={{ width: "100%" }}>
              <div style={{ flex: 1 }}>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {user?.customer?.firstName} {user?.customer?.lastName}
                </Title>
                <Text type="secondary">{user?.email}</Text>
              </div>
              {!editMode ? (
                <Button type="primary" onClick={() => setEditMode(true)} style={{ marginLeft: "auto" }}>
                  แก้ไข
                </Button>
              ) : null}
            </Space>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={form.getFieldsValue()}
              style={{ marginTop: 32 }}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="ชื่อ"
                    name="firstName"
                    rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    label="เบอร์โทร"
                    name="phone"
                    rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item
                    label="เพศ"
                    name="gender"
                    rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
                  >
                    <Select disabled={!editMode}>
                      <Option value={1}>ชาย</Option>
                      <Option value={2}>หญิง</Option>
                      <Option value={3}>อื่นๆ</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="นามสกุล"
                    name="lastName"
                    rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                  >
                    <Input disabled={!editMode} />
                  </Form.Item>
                  <Form.Item label="อีเมล" name="email">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              {editMode && (
                <Space>
                  <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>
                    บันทึก
                  </Button>
                  <Button
                    style={{ marginTop: 8 }}
                    onClick={() => {
                      setEditMode(false);
                      form.resetFields();
                      loadMyProfile();
                    }}
                  >
                    ยกเลิก
                  </Button>
                </Space>
              )}
            </Form>
          </Card>

          {/* ส่วนล่าง: รายการที่อยู่ */}
          <Card
            title={
              <span>
                <HomeOutlined /> ที่อยู่ของฉัน
              </span>
            }
            style={{ borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2" }}
          >
            <List
              itemLayout="horizontal"
              dataSource={addresses}
              locale={{ emptyText: "ยังไม่มีที่อยู่" }}
              renderItem={(addr) => (
                <List.Item
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      type="link"
                      onClick={() => {
                        setAddressEdit(addr);
                        setAddressModal(true);
                      }}
                    >
                      แก้ไข
                    </Button>,
                    <Button
                      key="delete"
                      icon={<DeleteOutlined />}
                      type="link"
                      danger
                      onClick={() => handleDeleteAddress(addr.id)}
                    >
                      ลบ
                    </Button>,
                    addr.isDefault ? (
                      <Tag key="main" color="blue">
                        ที่อยู่หลัก
                      </Tag>
                    ) : (
                      <Button key="set-main" type="link" onClick={() => handleSetMain(addr.id)}>
                        ตั้งเป็นที่อยู่หลัก
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<HomeOutlined />} />}
                    title={<span>{addr.detail}</span>}
                    description={
                      <span>
                        Lat: {addr.latitude}, Lng: {addr.longitude}{" "}
                        {addr.isDefault ? <Tag color="blue" style={{ marginLeft: 8 }}>หลัก</Tag> : null}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              style={{ marginTop: 16 }}
              onClick={() => {
                setAddressEdit(null);
                setAddressModal(true);
              }}
            >
              เพิ่มที่อยู่ใหม่
            </Button>
          </Card>

          {/* Modal สำหรับเพิ่ม/แก้ไขที่อยู่ */}
          <Modal
            title={addressEdit ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่"}
            open={addressModal}
            onCancel={() => {
              setAddressModal(false);
              setAddressEdit(null);
            }}
            footer={null}
            destroyOnClose
          >
            <Form
              layout="vertical"
              initialValues={
                addressEdit
                  ? {
                      detail: addressEdit.detail,
                      latitude: addressEdit.latitude,
                      longitude: addressEdit.longitude,
                    }
                  : { detail: "", latitude: "", longitude: "" }
              }
              onFinish={handleAddressSubmit}
            >
              <Form.Item
                label="รายละเอียดที่อยู่"
                name="detail"
                rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Latitude"
                name="latitude"
                rules={[{ required: true, message: "กรุณากรอก Latitude" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Longitude"
                name="longitude"
                rules={[{ required: true, message: "กรุณากรอก Longitude" }]}
              >
                <Input />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>
                  บันทึก
                </Button>
                <Button
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setAddressModal(false);
                    setAddressEdit(null);
                  }}
                >
                  ยกเลิก
                </Button>
              </Space>
            </Form>
          </Modal>
        </Col>
      </Row>
    </CustomerSidebar>
  );
};

export default Profile;
