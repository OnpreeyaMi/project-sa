import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Modal, Table as AntTable, Space, Popconfirm, message } from 'antd';
import AdminSidebar from '../../component/layout/admin/AdminSidebar';
import axios from 'axios';

interface Customer {
    ID: number;
    FirstName: string;
    LastName: string;
    PhoneNumber: string;
    Gender: { ID: number; name: string };
    User: { Email: string };
    CreatedAt: string;
}

interface Order {
    ID: number;
    CreatedAt: string;
    OrderNote: string;
    Address?: { AddressDetails: string };
    // เพิ่ม field ตาม backend ที่ส่งมา
}

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [orderHistoryModalVisible, setOrderHistoryModalVisible] = useState(false);
    const [orderHistory, setOrderHistory] = useState<Order[]>([]);
    const [orderHistoryLoading, setOrderHistoryLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [addressModalVisible, setAddressModalVisible] = useState(false);
    const [addressList, setAddressList] = useState<any[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [selectedAddressCustomer, setSelectedAddressCustomer] = useState<Customer | null>(null);

    const API_URL = 'http://localhost:8000/customers'; // backend URL

    // ----------------- FETCH -----------------
    const fetchCustomers = async () => {
        try {
            const response = await axios.get(API_URL);
            setCustomers(response.data); // backend return array directly
        } catch (err) {
            console.error(err);
            message.error('ไม่สามารถดึงข้อมูลลูกค้าได้');
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.FirstName.toLowerCase().includes(searchText.toLowerCase()) ||
        c.LastName.toLowerCase().includes(searchText.toLowerCase()) ||
        c.PhoneNumber.includes(searchText) ||
        c.User.Email.toLowerCase().includes(searchText.toLowerCase())
    );

    // ----------------- CRUD -----------------
    const handleAddCustomer = async () => {
        try {
            const values = await form.validateFields();
            const response = await axios.post(API_URL, {
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                genderId: values.genderId,
                email: values.email,
                password: values.password,
            });
            setCustomers(prev => [...prev, response.data.data]);
            setAddModalVisible(false);
            form.resetFields();
            message.success('เพิ่มลูกค้าสำเร็จ');
        } catch (err: any) {
            message.error(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            firstName: customer.FirstName,
            lastName: customer.LastName,
            phone: customer.PhoneNumber,
            email: customer.User.Email,
            genderId: customer.Gender.ID,
        });
        setEditModalVisible(true);
    };

    const handleEditCustomer = async () => {
        if (!editingCustomer) return;
        try {
            const values = await form.validateFields();
            await axios.put(`${API_URL}/${editingCustomer.ID}`, {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                phone: values.phone,
                genderId: values.genderId,
            });
            message.success('แก้ไขลูกค้าสำเร็จ');
            setEditModalVisible(false);
            setEditingCustomer(null);
            fetchCustomers();
        } catch (err: any) {
            message.error(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        }
    };

    const handleDeleteCustomer = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            message.success('ลบลูกค้าสำเร็จ');
            fetchCustomers();
        } catch (err: any) {
            message.error(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        }
    };

    // ----------------- ORDER HISTORY -----------------
    const handleShowOrderHistory = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setOrderHistory([]);
        setOrderHistoryLoading(true);
        setOrderHistoryModalVisible(true);
        try {
            const res = await axios.get(`http://localhost:8000/orders?customerId=${customer.ID}`);
            setOrderHistory(res.data);
        } catch (err) {
            message.error("ไม่สามารถดึงประวัติออเดอร์ได้");
        }
        setOrderHistoryLoading(false);
    };

    // ดึงที่อยู่ของลูกค้าจาก backend
    const handleShowAddresses = async (customer: Customer) => {
        setSelectedAddressCustomer(customer);
        setAddressList([]);
        setAddressLoading(true);
        setAddressModalVisible(true);
        try {
            const res = await axios.get(`http://localhost:8000/addresses?customerId=${customer.ID}`);
            setAddressList(res.data);
        } catch (err) {
            message.error("ไม่สามารถดึงข้อมูลที่อยู่ได้");
        }
        setAddressLoading(false);
    };

    // ----------------- TABLE -----------------
    const columns = [
        { title: 'ID', dataIndex: 'ID', key: 'ID' },
        { title: 'ชื่อ', dataIndex: 'FirstName', key: 'FirstName',
          render: (text: string, record: Customer) => {
            // สร้างไอคอน avatar จากชื่อ-นามสกุล (ใช้ตัวอักษรแรก)
            const initials = `${record.FirstName?.[0] || ''}${record.LastName?.[0] || ''}`.toUpperCase();
            let bgColor = '#4f8cff'; // default ชาย
            if (record.Gender?.ID === 2 || (record.Gender?.name && record.Gender.name.includes('หญิง'))) {
              bgColor = '#ff69b4'; // หญิงชมพู
            } else if (record.Gender?.name && record.Gender.name.includes('อื่น')) {
              bgColor = '#FFD600'; // อื่นๆ เหลือง
            }
            return (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: bgColor,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 15,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 8,
                }}>{initials}</span>
                {text}
              </span>
            );
          }
        },
        { title: 'สกุล', dataIndex: 'LastName', key: 'LastName' },
        { title: 'อีเมล', key: 'Email', render: (_: any, record: Customer) => record.User?.Email },
        { title: 'เบอร์โทร', dataIndex: 'PhoneNumber', key: 'PhoneNumber' },
        { title: 'เพศ', dataIndex: ['Gender', 'name'], key: 'Gender' },
        {
            title: 'วันที่สมัคร',
            dataIndex: 'CreatedAt',
            key: 'CreatedAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'จัดการ',
            key: 'action',
            render: (_: any, record: Customer) => (
                <Space>
                    <Button onClick={() => handleShowOrderHistory(record)}>ประวัติออเดอร์</Button>
                    <Button onClick={() => handleShowAddresses(record)} style={{ background: '#4f8cff', color: 'white' }}>ที่อยู่</Button>
                    <Button type="primary" style={{ backgroundColor: '#ffb547ff' }} onClick={() => handleEdit(record)}>แก้ไข</Button>
                    <Popconfirm
                        title="คุณแน่ใจว่าจะลบลูกค้าคนนี้?"
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        onConfirm={() => handleDeleteCustomer(record.ID)}
                    >
                        <Button danger>ลบ</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ตารางประวัติออเดอร์
    const orderColumns = [
  { title: "Order ID", dataIndex: "ID", key: "ID" },
  { 
    title: "วันที่สร้าง", 
    dataIndex: "CreatedAt", 
    key: "CreatedAt", 
    render: (d: string) => new Date(d).toLocaleString() 
  },
  { 
    title: "รายละเอียดที่อยู่", 
    dataIndex: ["Address", "AddressDetails"], 
    key: "AddressDetails", 
    render: (_: any, rec: Order) => rec.Address?.AddressDetails || "-" 
  },
  { title: "หมายเหตุ", dataIndex: "OrderNote", key: "OrderNote" },
  { 
    title: "ราคา (บาท)", 
    dataIndex: "TotalPrice", 
    key: "TotalPrice", 
    render: (p: number) => p?.toLocaleString() || "-" 
  },
  { 
    title: "สถานะ", 
    dataIndex: "Status", 
    key: "Status", 
    render: (s: string) => s || "-" 
  },
  { 
    title: "การชำระเงิน", 
    dataIndex: "PaymentStatus", 
    key: "PaymentStatus", 
    render: (p: string) => p || "-" 
  },
];


    return (
        <AdminSidebar>
            <div className="min-h-screen p-8 font-sans bg-gray-50">
                {/* ส่วนหัว */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">จัดการข้อมูลลูกค้า</h1>
                        <p className="text-gray-500">ข้อมูลลูกค้าทั้งหมดในระบบ</p>
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
                        onClick={() => { form.resetFields(); setAddModalVisible(true); }}>
                        + เพิ่มลูกค้า
                    </button>
                </div>

                {/* กล่อง filter/search */}
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input.Search
                            placeholder="ค้นหาชื่อ / เบอร์โทร / อีเมล"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>
                </div>



                {/* ตารางลูกค้า */}
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <AntTable columns={columns} dataSource={filteredCustomers} rowKey="ID" />
                </div>
                {/* Modal เพิ่มลูกค้า */}
                <Modal
                    title="เพิ่มลูกค้าใหม่"
                    open={addModalVisible}
                    onCancel={() => setAddModalVisible(false)}
                    onOk={handleAddCustomer}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="lastName" label="สกุล" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="email" label="อีเมล" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true, min: 6, message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัว' }]}><Input.Password /></Form.Item>
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true, pattern: /^\d{10}$/, message: 'กรุณากรอกเบอร์โทร 10 หลัก' }]}><Input /></Form.Item>
                        <Form.Item name="genderId" label="เพศ" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value={1}>ชาย</Select.Option>
                                <Select.Option value={2}>หญิง</Select.Option>
                                <Select.Option value={3}>อื่นๆ</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal แก้ไขลูกค้า */}
                <Modal
                    title="แก้ไขลูกค้า"
                    open={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onOk={handleEditCustomer}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="lastName" label="สกุล" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="email" label="อีเมล" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true, pattern: /^\d{10}$/, message: 'กรุณากรอกเบอร์โทร 10 หลัก' }]}><Input /></Form.Item>
                        <Form.Item name="genderId" label="เพศ" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value={1}>ชาย</Select.Option>
                                <Select.Option value={2}>หญิง</Select.Option>
                                <Select.Option value={2}>อื่นๆ</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal ประวัติออเดอร์ */}
                <Modal
                    title={`ประวัติออเดอร์: ${selectedCustomer?.FirstName || ""} ${selectedCustomer?.LastName || ""}`}
                    open={orderHistoryModalVisible}
                    onCancel={() => setOrderHistoryModalVisible(false)}
                    footer={null}
                    width={700}
                >
                    <AntTable
                        columns={orderColumns}
                        dataSource={orderHistory}
                        rowKey="ID"
                        loading={orderHistoryLoading}
                        pagination={false}
                        locale={{ emptyText: "ไม่มีประวัติออเดอร์" }}
                    />
                </Modal>

                {/* Modal ที่อยู่ลูกค้า */}
                <Modal
                    title={`ที่อยู่ของ: ${selectedAddressCustomer?.FirstName || ""} ${selectedAddressCustomer?.LastName || ""}`}
                    open={addressModalVisible}
                    onCancel={() => setAddressModalVisible(false)}
                    footer={null}
                    width={600}
                >
                    {addressLoading ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>กำลังโหลดข้อมูล...</div>
                    ) : addressList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32 }}>ไม่มีข้อมูลที่อยู่</div>
                    ) : (
                        <div>
                            {addressList.map(addr => (
                                <div key={addr.id || addr.ID} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, marginBottom: 12, background: addr.isDefault ? '#e6f7ff' : '#fff' }}>
                                    <div><b>รายละเอียด:</b> {addr.detail || addr.AddressDetails}</div>
                                    <div><b>Lat:</b> {addr.latitude || addr.Latitude} <b>Lng:</b> {addr.longitude || addr.Longitude}</div>
                                    <div style={{ marginTop: 8 }}>
                                        {addr.isDefault ? (
                                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>ที่อยู่หลัก</span>
                                        ) : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal>
            </div>

        </AdminSidebar>
    );
};

export default CustomerManagement;
