import React, { useState } from "react";
import { Card, Button, Form, Input, Select, Avatar, Row, Col } from "antd";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;

const CustomerProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "Alexa",
    nickName: "Rawles",
    email: "alexarawles@gmail.com",
    password: "123456",
    phone: "0812345678",
    gender: "Female"
  });

  const [form] = Form.useForm();

  const handleEdit = () => {
    form.setFieldsValue(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      setProfile(values);
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <CustomerSidebar>
      <h2 style={{ margin: 10 }}>โปร์ไฟล์</h2>

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
        </Col>

        {/* Card 2 */}
        <Col xs={24} md={16}>
          <Card>
            {isEditing ? (
              // -------------------- Editing --------------------
              <Form form={form} layout="vertical" initialValues={profile}>
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <Form.Item name="fullName" label={<strong style={{ fontSize: 16 }}>ชื่อ</strong>} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="nickName" label={<strong style={{ fontSize: 16 }}>นามสกุล</strong>}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="email" label={<strong style={{ fontSize: 16 }}>อีเมล</strong>}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="password" label={<strong style={{ fontSize: 16 }}>รหัสผ่าน</strong>} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="phone" label={<strong style={{ fontSize: 16 }}>เบอร์โทร</strong>}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="gender" label={<strong style={{ fontSize: 16 }}>เพศ</strong>}>
                      <Select>
                        <Option value="Male">ชาย</Option>
                        <Option value="Female">หญิง</Option>
                        <Option value="Other">อื่น</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              </Form>
            ) : (
              // -------------------- View Mode --------------------
              <Form layout="vertical">
                <Row gutter={[16, 12]}>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>ชื่อ</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>{profile.fullName}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>นามสกุล</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>{profile.nickName}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>อีเมล</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>{profile.email}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>รหัสผ่าน</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>********</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>เบอร์โทร</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>{profile.phone}</span>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={<span style={{ fontWeight: "bold", fontSize: 16 }}>เพศ</span>}>
                      <span style={{ color: "#000", fontSize: 14 }}>{profile.gender}</span>
                    </Form.Item>
                  </Col>
                </Row>

                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
                  <Button type="primary" onClick={handleEdit}>
                    Edit
                  </Button>
                </div>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </CustomerSidebar>
  );
};

export default CustomerProfile;
