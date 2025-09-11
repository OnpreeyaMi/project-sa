import React, { useState, useEffect } from "react";
import { useUser } from "../../hooks/UserContext";
import axios from "axios";
import { Form, Input, Button, Card, Select, List, Modal, Row, Col, Avatar, Typography, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";

const { Option } = Select;
const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const { user, refreshCustomer } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModal, setAddressModal] = useState(false);
  const [addressEdit, setAddressEdit] = useState<any | null>(null);

  useEffect(() => {
    if (user?.customer) {
      form.setFieldsValue({
        firstName: user.customer.firstName,
        lastName: user.customer.lastName,
        phone: user.customer.phone,
        gender: user.customer.gender.id,
        email: user.email,
      });
      setAddresses(
        (user.customer.addresses || []).map((addr: any) => ({
          id: addr.ID || addr.id,
          detail: addr.AddressDetails || addr.detail,
          latitude: addr.Latitude || addr.latitude,
          longitude: addr.Longitude || addr.longitude,
          isDefault: addr.IsDefault || addr.isDefault,
        }))
      );
    }
  }, [user, form]);

  // ----- แก้ไขข้อมูลส่วนตัว -----
  const handleSave = async (values: any) => {
    try {
      await axios.put("http://localhost:8000/customer/profile", {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        genderId: values.gender,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setEditMode(false);
      await refreshCustomer();
    } catch (err) {
      Modal.error({ title: "บันทึกข้อมูลไม่สำเร็จ" });
    }
  };

  // ----- เพิ่ม/แก้ไขที่อยู่ -----
  const handleAddressSubmit = async (values: any) => {
    try {
      if (addressEdit) {
        await axios.put(`http://localhost:8000/address/${addressEdit.id}`, {
          AddressDetails: values.detail,
          Latitude: parseFloat(values.latitude),
          Longitude: parseFloat(values.longitude),
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
      } else {
        await axios.post("http://localhost:8000/address", {
          AddressDetails: values.detail,
          Latitude: parseFloat(values.latitude),
          Longitude: parseFloat(values.longitude),
        }, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
      }
      setAddressModal(false);
      setAddressEdit(null);
      await refreshCustomer();
    } catch {
      Modal.error({ title: "เพิ่ม/แก้ไขที่อยู่ไม่สำเร็จ" });
    }
  };

  // ----- ลบที่อยู่ -----
  const handleDeleteAddress = async (id: number) => {
    Modal.confirm({
      title: "ต้องการลบที่อยู่นี้ใช่หรือไม่?",
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:8000/address/${id}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
          });
          await refreshCustomer();
        } catch {
          Modal.error({ title: "ลบที่อยู่ไม่สำเร็จ" });
        }
      }
    });
  };


  return (
    <CustomerSidebar>
      <h2 style={{ marginTop: 10 , marginBottom:10 }}>โปร์ไฟล์</h2>

      <Row gutter={24}>
        {/* Card 1 */}
        <Col xs={24} md={8}>
          <Card>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar size={140} icon={<UserOutlined />} />
              <h2 style={{ marginTop: 12, marginBottom: 0 }}>{profile.fullName} {profile.nickName}</h2>
              <p style={{ marginTop: 4, color: "gray" }}>{profile.email}</p>
            </div>
          </Card>

          {/* ส่วนล่าง: รายการที่อยู่ */}
          <Card title={<span><HomeOutlined /> ที่อยู่ของฉัน  </span>} style={{ borderRadius: 16, boxShadow: "0 2px 8px #f0f1f2" }}>
            <List
              itemLayout="horizontal"
              dataSource={addresses}
              locale={{ emptyText: "ยังไม่มีที่อยู่" }}
              renderItem={addr => (
                <List.Item
                  actions={[
                    <Button icon={<EditOutlined />} type="link" onClick={() => { setAddressEdit(addr); setAddressModal(true); }}>Edit</Button>,
                    <Button icon={<DeleteOutlined />} type="link" danger onClick={() => handleDeleteAddress(addr.id)}>Delete</Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<HomeOutlined />} />}
                    title={<span>{addr.detail}</span>}
                    description={<span>Lat: {addr.latitude}, Lng: {addr.longitude}</span>}
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
            <Form
              layout="vertical"
              initialValues={addressEdit ? {
                detail: addressEdit.detail,
                latitude: addressEdit.latitude,
                longitude: addressEdit.longitude,
              } : { detail: "", latitude: "", longitude: "" }}
              onFinish={handleAddressSubmit}
            >
              <Form.Item label="รายละเอียดที่อยู่" name="detail" rules={[{ required: true, message: "กรุณากรอกรายละเอียด" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Latitude" name="latitude" rules={[{ required: true, message: "กรุณากรอก Latitude" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Longitude" name="longitude" rules={[{ required: true, message: "กรุณากรอก Longitude" }]}>
                <Input />
              </Form.Item>
              <Button type="primary" htmlType="submit" style={{ marginTop: 8 }}>บันทึก</Button>
            </Form>
          </Modal>
        </Col>
      </Row>
    </CustomerSidebar>
  );
};

export default Profile;