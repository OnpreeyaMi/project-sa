import React, { useState } from 'react';
import { Form, Input, Select, Button, Modal, Table, Tag, Space, Popconfirm } from 'antd';
import AdminSidebar from '../../component/layout/admin/AdminSidebar';

interface Order {
    id: number;
    customerId: number;
    orderNumber: string;
    item: string;
    quantity: number;
    price: number;
    status: string;
    createdAt: string;
}

const CustomerManagement: React.FC = () => {
    const [customers, setCustomers] = useState([
        { id: 1, firstName: 'สมชาย', lastName: 'ใจดี', phone: '0812345678', gender: 'ชาย', email: 'somchai@example.com', status: 'ใช้งาน', createdAt: '2024-01-15' },
        { id: 2, firstName: 'สมหญิง', lastName: 'รักงาน', phone: '0898765432', gender: 'หญิง', email: 'somying@example.com', status: 'ใช้งาน', createdAt: '2024-02-10' },
        { id: 3, firstName: 'วิชัย', lastName: 'ขยันทำ', phone: '0865432198', gender: 'ชาย', email: 'wichai@example.com', status: 'ไม่ใช้งาน', createdAt: '2024-03-05' },
    ]);

    const [orders] = useState<Order[]>([
        { id: 1, customerId: 1, orderNumber: 'ORD001', item: 'เสื้อ', quantity: 2, price: 200, status: 'รอรับ', createdAt: '2024-08-26' },
        { id: 2, customerId: 1, orderNumber: 'ORD002', item: 'กางเกง', quantity: 1, price: 150, status: 'ซักแล้ว', createdAt: '2024-08-25' },
        { id: 3, customerId: 2, orderNumber: 'ORD003', item: 'ชุดชั้นใน', quantity: 3, price: 300, status: 'รอส่ง', createdAt: '2024-08-24' },
    ]);

    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [selectedCustomerOrders, setSelectedCustomerOrders] = useState<Order[]>([]);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');

    const filteredCustomers = customers.filter(c =>
        c.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        c.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone.includes(searchText) ||
        c.email.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleAddCustomer = () => {
        form.validateFields().then(values => {
            const newCustomer = {
                id: Date.now(),
                ...values,
                status: 'ไม่ใช้งาน',
                createdAt: new Date().toISOString().slice(0, 10),
            };
            setCustomers(prev => [...prev, newCustomer]);
            form.resetFields();
            setAddModalVisible(false);
        });
    };

    const handleEdit = (record: any) => {
        setEditingCustomer(record);
        form.setFieldsValue(record);
        setEditModalVisible(true);
    };

    const handleEditCustomer = () => {
        form.validateFields().then(values => {
            setCustomers(prev =>
                prev.map(c => (c.id === editingCustomer.id ? { ...c, ...values } : c))
            );
            setEditingCustomer(null);
            setEditModalVisible(false);
        });
    };

    const handleViewOrders = (customerId: number) => {
        const customerOrders = orders.filter(o => o.customerId === customerId);
        setSelectedCustomerOrders(customerOrders);
        setOrderModalVisible(true);
    };

    const columns = [
        { title: 'เลขที่ลูกค้า', dataIndex: 'id', key: 'id' },
        { title: 'ชื่อ', dataIndex: 'firstName', key: 'firstName' },
        { title: 'สกุล', dataIndex: 'lastName', key: 'lastName' },
        { title: 'อีเมล', dataIndex: 'email', key: 'email' },
        { title: 'เบอร์โทร', dataIndex: 'phone', key: 'phone' },
        { title: 'เพศ', dataIndex: 'gender', key: 'gender' },
        { title: 'วันที่สมัคร', dataIndex: 'createdAt', key: 'createdAt' },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'ใช้งาน' ? 'green' : 'red'}>{status}</Tag>
            )
        },
        {
            title: 'จัดการ',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Button type="primary" onClick={() => handleEdit(record)} style={{ backgroundColor: '#F6D55C', color: 'white' }}>แก้ไข</Button>
                    <Button onClick={() => handleViewOrders(record.id)} style={{ backgroundColor: '#3CAEA3', color: 'white' }}>ดูออเดอร์</Button>
                    <Popconfirm
                        title="คุณแน่ใจว่าจะลบลูกค้าคนนี้?"
                        okText="ลบ"
                        cancelText="ยกเลิก"
                        onConfirm={() =>
                            setCustomers((prev) => prev.filter((c) => c.id !== record.id))
                        }
                    >
                        <Button danger>ลบ</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const orderColumns = [
        { title: 'เลขที่ออเดอร์', dataIndex: 'orderNumber', key: 'orderNumber' },
        { title: 'สินค้า', dataIndex: 'item', key: 'item' },
        { title: 'จำนวน', dataIndex: 'quantity', key: 'quantity' },
        { title: 'ราคา', dataIndex: 'price', key: 'price' },
        { title: 'สถานะ', dataIndex: 'status', key: 'status' },
        { title: 'วันที่สร้าง', dataIndex: 'createdAt', key: 'createdAt' },
    ];

    return (
        <AdminSidebar>
            <div className="min-h-screen p-8 font-sans bg-gray-50">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-blue-900">จัดการข้อมูลลูกค้า</h1>
                    <Button
                        type="primary"
                        style={{ backgroundColor: "#0E4587" }}
                        onClick={() => { form.resetFields(); setAddModalVisible(true); }}
                    >
                        + เพิ่มผู้ใช้งาน
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <Input.Search
                        placeholder="ค้นหาชื่อ / เบอร์โทร / อีเมล"
                        size="large"
                        style={{ width: 400 }}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />
                </div>

                {/* Customer Table */}
                <Table columns={columns} dataSource={filteredCustomers} rowKey="id" />

                {/* Modal เพิ่มลูกค้า */}
                <Modal
                    title="เพิ่มลูกค้าใหม่"
                    open={addModalVisible}
                    onCancel={() => setAddModalVisible(false)}
                    onOk={handleAddCustomer}
                    okText="เพิ่ม"
                    cancelText="ยกเลิก"
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label="สกุล" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label="อีเมล" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="gender" label="เพศ" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="ชาย">ชาย</Select.Option>
                                <Select.Option value="หญิง">หญิง</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal แก้ไขลูกค้า */}
                <Modal
                    title="แก้ไขข้อมูลลูกค้า"
                    open={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onOk={handleEditCustomer}
                    okText="บันทึก"
                    cancelText="ยกเลิก"
                >
                    <Form form={form} layout="vertical">
                        <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label="สกุล" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="email" label="อีเมล" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="gender" label="เพศ" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="ชาย">ชาย</Select.Option>
                                <Select.Option value="หญิง">หญิง</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal ดูออเดอร์ */}
                <Modal
                    title="ประวัติออเดอร์"
                    open={orderModalVisible}
                    footer={null}
                    onCancel={() => setOrderModalVisible(false)}
                    width={700}
                >
                    <Table
                        columns={orderColumns}
                        dataSource={selectedCustomerOrders}
                        rowKey="id"
                        pagination={false}
                    />
                </Modal>
            </div>
        </AdminSidebar>
    );
};

export default CustomerManagement;
