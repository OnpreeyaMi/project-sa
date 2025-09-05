import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import { Modal, Form, Input } from "antd";
import LeafletMap from "../../component/LeafletMap";

const initialAddresses = [
  {
    id: 1,
    name: "พิชญ์สินี ดีเมืองชาย",
    phone: "(+66) 99 203 8066",
    detail:
      "เลขที่ 423 หมู่ที่ 5 มหาส ประตู 4 ต.สุภารี, อำเภอเมืองนครราชสีมา, จังหวัดนครราชสีมา, 30000",
    main: true,
    latlng: { lat: 15.0, lng: 102.0 },
  },
  {
    id: 2,
    name: "พิชญ์สินี ดีเมืองชาย",
    phone: "(+66) 99 203 8066",
    detail:
      "246 หมู่ 12 ตำบลท่าสองคอน, อำเภอเมืองมหาสารคาม, จังหวัดมหาสารคาม, 44000",
    main: false,
    latlng: { lat: 16.0, lng: 103.0 },
  },
];

const Profile: React.FC = () => {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [position, setPosition] = useState({ lat: 15.0, lng: 102.0 });
  const [editPosition, setEditPosition] = useState({ lat: 15.0, lng: 102.0 });

  // ข้อมูลส่วนตัว
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // ดึงข้อมูลลูกค้าจาก backend
    axios.get("http://localhost:8080/customer/profile", {
      // ถ้าใช้ JWT ให้ส่ง header Authorization ด้วย
      // headers: { Authorization: `Bearer ${token}` }
      withCredentials: true // ถ้าใช้ cookie session
    })
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null));
  }, []);

  // เพิ่มที่อยู่ใหม่
  const handleAddAddress = async () => {
    try {
      const values = await form.validateFields();
      const newAddress = {
        id: Date.now(),
        name: values.name,
        phone: values.phone,
        detail: values.detail,
        main: false,
        latlng: position,
      };
      setAddresses([...addresses, newAddress]);
      setAddModalVisible(false);
      form.resetFields();
    } catch (err) {}
  };

  // เปิด modal แก้ไข
  const handleEditClick = (addr: any) => {
    setEditingAddress(addr);
    editForm.setFieldsValue({
      name: addr.name,
      phone: addr.phone,
      detail: addr.detail,
    });
    setEditPosition(addr.latlng);
    setEditModalVisible(true);
  };

  // บันทึกการแก้ไข
  const handleEditAddress = async () => {
    try {
      const values = await editForm.validateFields();
      setAddresses(addresses.map(addr =>
        addr.id === editingAddress.id
          ? { ...addr, ...values, latlng: editPosition }
          : addr
      ));
      setEditModalVisible(false);
      setEditingAddress(null);
    } catch (err) {}
  };

  // ตั้งเป็นค่าหลัก
  const handleSetMain = (id: number) => {
    setAddresses(
      addresses.map((addr) =>
        addr.id === id ? { ...addr, main: true } : { ...addr, main: false }
      )
    );
  };

  // ลบที่อยู่
  const handleDelete = (id: number) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
  };

  return (
    <CustomerSidebar>
      <div className="profile-container">
        <div className="profile-flex">
          {/* ฝั่งซ้าย */}
          <div className="profile-left">
            <h1 className="profile-title">โปร์ไฟล์ของฉัน</h1>
            <div className="profile-card">
              <div className="section-header">
                <h2>ข้อมูลส่วนตัว</h2>
                <button className="edit-btn">✎ แก้ไข</button>
              </div>
              <div className="profile-grid">
                <div className="profile-item">
                  <label>ชื่อ</label>
                  <p>{profile?.FirstName || "-"}</p>
                </div>
                <div className="profile-item">
                  <label>นามสกุล</label>
                  <p>{profile?.LastName || "-"}</p>
                </div>
                <div className="profile-item">
                  <label>เบอร์โทร</label>
                  <p>{profile?.PhoneNumber || "-"}</p>
                </div>
                <div className="profile-item">
                  <label>เพศ</label>
                  <p>{profile?.Gender?.Name || "-"}</p>
                </div>
                <div className="profile-item">
                  <label>อีเมล</label>
                  <p>{profile?.User?.Email || "-"}</p>
                </div>
                <div className="profile-item">
                  <label>รหัสผ่าน</label>
                  <p>********</p>
                </div>
              </div>
            </div>
          </div>

          {/* ฝั่งขวา */}
          <div className="profile-right">
            <div className="address-section">
              <div className="section-header">
                <h2>ที่อยู่ของฉัน</h2>
                <button
                  className="add-address-btn"
                  onClick={() => setAddModalVisible(true)}
                >
                  + เพิ่มที่อยู่
                </button>
              </div>
              <div className="address-list">
                {addresses.map(addr => (
                  <div
                    className={`address-card ${addr.main ? "main-card" : ""}`}
                    key={addr.id}
                  >
                    <div className="address-info">
                      <div className="address-detail">{addr.detail}</div>
                      <div className="address-detail">
                        ละติจูด : {addr.latlng.lat} , ลองจิจูด : {addr.latlng.lng}
                      </div>
                      {addr.main && <span className="address-default-tag">ค่าหลัก</span>}
                    </div>
                    <div className="address-actions">
                      {/* ปุ่มแก้ไข */}
                      <button className="edit-btn" onClick={() => handleEditClick(addr)}>แก้ไข</button>
                      {/* ถ้าไม่ใช่ค่าหลักถึงจะมี ลบ + ตั้งเป็นค่าหลัก */}
                      {!addr.main && (
                        <>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(addr.id)}
                          >
                            ลบ
                          </button>
                          <button
                            className="set-main-btn"
                            onClick={() => handleSetMain(addr.id)}
                          >
                            ตั้งเป็นค่าหลัก
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal เพิ่มที่อยู่ */}
        <Modal
          title="เพิ่มที่อยู่ใหม่"
          open={addModalVisible}
          onCancel={() => setAddModalVisible(false)}
          onOk={handleAddAddress}
          okText="เพิ่ม"
          cancelText="ยกเลิก"
        >
          <Form form={form} layout="vertical">
            <Form.Item name="detail" label="รายละเอียดที่อยู่" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <div style={{ marginBottom: 12 }}>
              <label>ปักหมุดที่อยู่</label>
              <LeafletMap position={position} setPosition={setPosition} />
            </div>
          </Form>
        </Modal>

        {/* Modal แก้ไขที่อยู่ */}
        <Modal
          title="แก้ไขที่อยู่"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={handleEditAddress}
          okText="บันทึก"
          cancelText="ยกเลิก"
        >
          <Form form={editForm} layout="vertical">
            <Form.Item name="detail" label="รายละเอียดที่อยู่" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <div style={{ marginBottom: 12 }}>
              <label>ปักหมุดที่อยู่</label>
              <LeafletMap position={editPosition} setPosition={setEditPosition} />
            </div>
          </Form>
        </Modal>
      </div>
    </CustomerSidebar>
  );
};

export default Profile;
