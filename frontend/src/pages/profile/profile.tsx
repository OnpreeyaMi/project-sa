import React, { useState, useEffect, useRef } from "react";
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
  Tag,
  Divider,
  Skeleton,
  Empty,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const { Option } = Select;
const { Title } = Typography;

const STATUS_DESC = {
  active: "ใช้งานอยู่",
  inactive: "ไม่ได้ใช้งาน",
};
const STATUS_TAG = {
  active: { color: "green", text: "ออนไลน์" },
  inactive: { text: "ออฟไลน์" },
};

const genderLabel = (g: number | undefined) => (g === 1 ? "ชาย" : g === 2 ? "หญิง" : "อื่น ๆ");
const fullName = (c: any) => `${c?.firstName || ""} ${c?.lastName || ""}`.trim();
const initialsOf = (c: any) => [c?.firstName?.[0], c?.lastName?.[0]].filter(Boolean).join("") || "•";

function LocationMarkerModal({ setPosition, setAddress }: any) {
  useMapEvents({
    click: async (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition({ lat, lng });
      // reverse geocoding ภาษาไทย
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=th`
        );
        const data = await res.json();
        setAddress(data.display_name || "");
      } catch {
        setAddress("");
      }
    },
  });
  return null;
}

const Profile: React.FC = () => {
  const { user, refreshCustomer } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModal, setAddressModal] = useState(false);
  const [addressEdit, setAddressEdit] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [modalPosition, setModalPosition] = useState<{ lat: number; lng: number }>({ lat: 14.8757, lng: 102.0153 });
  const [modalAddressDetail, setModalAddressDetail] = useState<string>("");
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (user?.customer) {
      form.setFieldsValue({
        firstName: user.customer.firstName,
        lastName: user.customer.lastName,
        phone: user.customer.phone,
        gender: user.customer.gender.id,
        email: user.email,
      });
      const mappedAddresses = (user.customer.addresses || []).map((addr: any) => ({
        id: addr.ID || addr.id,
        detail: addr.AddressDetails || addr.detail,
        latitude: addr.Latitude || addr.latitude,
        longitude: addr.Longitude || addr.longitude,
        isDefault: addr.IsDefault || addr.isDefault,
      }));
      setAddresses(mappedAddresses);
      console.log('addresses (profile):', mappedAddresses); // debug
    }
    setLoadedOnce(true);
  }, [user, form]);

  useEffect(() => {
    if (addressModal) {
      if (addressEdit) {
        setModalPosition({ lat: addressEdit.latitude, lng: addressEdit.longitude });
        setModalAddressDetail(addressEdit.detail);
      } else {
        setModalPosition({ lat: 14.8757, lng: 102.0153 });
        setModalAddressDetail("");
      }
    }
  }, [addressModal, addressEdit]);

  useEffect(() => {
    if (addressModal && mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300); // รอ modal เปิด animation
    }
  }, [addressModal]);

  // ----- แก้ไขข้อมูลส่วนตัว -----
  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      await axios.put(
        "http://localhost:8000/customer/profile",
        {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          genderId: values.gender,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setEditMode(false);
      await refreshCustomer();
    } catch (err) {
      Modal.error({ title: "บันทึกข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  // ----- เพิ่ม/แก้ไขที่อยู่ -----
  const handleAddressSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (addressEdit) {
        await axios.put(
          `http://localhost:8000/address/${addressEdit.id}`,
          {
            AddressDetails: values.detail,
            Latitude: parseFloat(values.latitude),
            Longitude: parseFloat(values.longitude),
          },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:8000/customer/addresses",
          {
            AddressDetails: values.detail,
            Latitude: parseFloat(values.latitude),
            Longitude: parseFloat(values.longitude),
          },
          {
            headers: { Authorization: `Bearer ${user?.token}` },
          }
        );
      }
      setAddressModal(false);
      setAddressEdit(null);
      await refreshCustomer();
    } catch {
      Modal.error({ title: "เพิ่ม/แก้ไขที่อยู่ไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  // ----- ลบที่อยู่ -----
  const handleDeleteAddress = async (id: number) => {
    console.log('ลบที่อยู่ id:', id); // debug
    try {
      setLoading(true);
      console.log('ส่ง request ลบที่อยู่:', id);
      // เปลี่ยน endpoint ให้ตรงกับ main.go
      const res = await axios.delete(`http://localhost:8000/customer/addresses/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      console.log('ลบที่อยู่ response:', res.status, res.data); // debug response
      await refreshCustomer();
    } catch (err: any) {
      if (err?.response?.status === 404) {
        Modal.error({ title: "ไม่พบที่อยู่ที่ต้องการลบ" });
      } else {
        Modal.error({ title: "ลบที่อยู่ไม่สำเร็จ" });
      }
      console.error('ลบที่อยู่ error:', err?.response?.status, err?.response?.data || err); // debug error
    } finally {
      setLoading(false);
    }
  };

  // ----- ตั้งเป็นที่อยู่หลัก -----
  const handleSetMainAddress = async (id: number) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:8000/customer/addresses/${id}/main`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      await refreshCustomer();
    } catch {
      Modal.error({ title: "ตั้งเป็นที่อยู่หลักไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  // ----- สถานะลูกค้า -----
  const currentStatus = "active";
  const currentTag = STATUS_TAG[currentStatus];
  const currentDesc = STATUS_DESC[currentStatus];

  return (
    <CustomerSidebar>
      <div className="min-h-screen bg-gray-50">
        {/* ---------- Hero / Header ---------- */}
        <div className="relative overflow-hidden">
          <div className="h-40 md:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
          <div className="max-w-6xl mx-auto px-4 -mt-12 md:-mt-16">
            <Card className="rounded-2xl shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-2 md:p-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xl md:text-2xl shadow-sm">
                  {initialsOf(user?.customer)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Title level={3} className="!m-0">{fullName(user?.customer) || "-"}</Title>
                    <Tag color={currentTag.color} className="px-2 py-1 rounded-full">{currentTag.text}</Tag>
                    <span className="text-gray-500">{currentDesc}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MailOutlined /> {user?.email || "-"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PhoneOutlined /> {user?.customer?.phone || "-"}
                    </span>
                  </div>
                </div>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={refreshCustomer}>
                    รีเฟรช
                  </Button>
                </Space>
              </div>
              <Divider className="!my-4" />
            </Card>
           </div>
        </div>

        {/* ---------- Body ---------- */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5} className="!mt-0">ข้อมูลลูกค้า</Title>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : !user?.customer && loadedOnce ? (
                  <Empty description="ไม่พบข้อมูลลูกค้า" />
                ) : (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={form.getFieldsValue()}
                    style={{ marginTop: 32 }}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item label="ชื่อ" name="firstName" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
                          <Input disabled={!editMode} />
                        </Form.Item>
                        <Form.Item label="เบอร์โทร" name="phone" rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}>
                          <Input disabled={!editMode} />
                        </Form.Item>
                        <Form.Item label="เพศ" name="gender" rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}>
                          <Select disabled={!editMode}>
                            <Option value={1}>ชาย</Option>
                            <Option value={2}>หญิง</Option>
                            <Option value={3}>อื่นๆ</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item label="นามสกุล" name="lastName" rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}>
                          <Input disabled={!editMode} />
                        </Form.Item>
                        <Form.Item label="อีเมล" name="email">
                          <Input disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                    {editMode && (
                      <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>บันทึก</Button>
                    )}
                  </Form>
                )}
                {!editMode ? (
                  <Button type="primary" onClick={() => setEditMode(true)} style={{ marginTop: 16 }} >Edit</Button>
                ) : null}
              </Card>
            </Col>
            <Col xs={24} lg={10}>
              {/* พื้นที่สำหรับส่วนขยายในอนาคต */}
              <Card className="rounded-2xl shadow-sm h-full">
                <Title level={5} className="!mt-0">สรุปโดยย่อ</Title>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">อีเมล</span>
                    <span className="font-medium">{user?.email || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">เบอร์โทร</span>
                    <span className="font-medium">{user?.customer?.phone || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">เพศ</span>
                    <span className="font-medium">{genderLabel(user?.customer?.gender?.id)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">รหัสลูกค้า</span>
                    <span className="font-medium">{user?.customer?.id || "-"}</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* ส่วนล่าง: รายการที่อยู่ */}
          <Card title={<span><HomeOutlined /> ที่อยู่ของฉัน  </span>} style={{ borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2", marginTop: 32 }}>
            <List
              itemLayout="horizontal"
              dataSource={addresses}
              locale={{ emptyText: "ยังไม่มีที่อยู่" }}
              renderItem={addr => (
                <List.Item
                  actions={[
                    <Button icon={<EditOutlined />} type="link" onClick={() => { setAddressEdit(addr); setAddressModal(true); }}>Edit</Button>,
                    <Popconfirm
                      title="ต้องการลบที่อยู่นี้ใช่หรือไม่?"
                      onConfirm={() => handleDeleteAddress(addr.id || addr.ID)}
                      okText="ลบ"
                      cancelText="ยกเลิก"
                    >
                      <Button icon={<DeleteOutlined />} type="link" danger>Delete</Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<HomeOutlined />} />}
                    title={<span>{addr.detail} {addr.isDefault && <Tag color="blue">ที่อยู่หลัก</Tag>}</span>}
                    description={
                      <>
                        <span>Lat: {addr.latitude}, Lng: {addr.longitude}</span>
                        <div style={{ marginTop: 8, textAlign: 'left' }}>
                          {!addr.isDefault && (
                            <Button type="link" style={{ paddingLeft: 0 }} onClick={() => handleSetMainAddress(addr.id || addr.ID)}>ตั้งเป็นที่อยู่หลัก</Button>
                          )}
                        </div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
            <Button type="dashed" icon={<PlusOutlined />} style={{ marginTop: 16 }} onClick={() => { setAddressEdit(null); setAddressModal(true); }}>เพิ่มที่อยู่ใหม่</Button>
          </Card>

          {/* Modal สำหรับเพิ่ม/แก้ไขที่อยู่ */}
          <Modal
            title={addressEdit ? "Edit Address" : "Add Address"}
            open={addressModal}
            onCancel={() => { setAddressModal(false); setAddressEdit(null); }}
            footer={null}
          >
            <div style={{ marginBottom: 16 }}>
              <MapContainer
                center={[modalPosition.lat, modalPosition.lng]}
                zoom={15}
                style={{ width: "100%", height: "300px" }}
                ref={mapRef}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarkerModal setPosition={setModalPosition} setAddress={setModalAddressDetail} />
                <Marker position={[modalPosition.lat, modalPosition.lng]} icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] })} />
              </MapContainer>
            </div>
            <Input.TextArea value={modalAddressDetail} readOnly style={{ width: "100%", minHeight: "60px", marginBottom: "12px" }} />
            <Form
              layout="vertical"
              onFinish={() => handleAddressSubmit({
                detail: modalAddressDetail,
                latitude: modalPosition.lat,
                longitude: modalPosition.lng,
              })}
            >
              <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>บันทึก</Button>
            </Form>
          </Modal>
        </div>
      </div>
    </CustomerSidebar>
  );
};

export default Profile;