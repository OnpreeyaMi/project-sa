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

    const API_URL = 'http://localhost:8080/customers'; // backend URL

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
            const res = await axios.get(`http://localhost:8080/orders?customerId=${customer.ID}`);
            setOrderHistory(res.data);
        } catch (err) {
            message.error("ไม่สามารถดึงประวัติออเดอร์ได้");
        }
        setOrderHistoryLoading(false);
    };

    // ----------------- TABLE -----------------
    const columns = [
        { title: 'ID', dataIndex: 'ID', key: 'ID' },
        { title: 'ชื่อ', dataIndex: 'FirstName', key: 'FirstName' },
        { title: 'สกุล', dataIndex: 'LastName', key: 'LastName' },
        { title: 'อีเมล', dataIndex: ['User', 'Email'], key: 'Email' },
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
                    <Button type="primary" onClick={() => handleEdit(record)}>แก้ไข</Button>
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
        { title: "วันที่สร้าง", dataIndex: "CreatedAt", key: "CreatedAt", render: (d: string) => new Date(d).toLocaleString() },
        { title: "รายละเอียดที่อยู่", dataIndex: ["Address", "AddressDetails"], key: "AddressDetails", render: (_: any, rec: Order) => rec.Address?.AddressDetails || "-" },
        { title: "หมายเหตุ", dataIndex: "OrderNote", key: "OrderNote" },
    ];

    return (
        <AdminSidebar>
            <div className="p-8">
                <div className="flex justify-between mb-6">
                    <h1 className="text-2xl font-bold">จัดการข้อมูลลูกค้า</h1>
                    <Button type="primary" onClick={() => { form.resetFields(); setAddModalVisible(true); }}>+ เพิ่มลูกค้า</Button>
                </div>

                <Input.Search
                    placeholder="ค้นหาชื่อ / เบอร์โทร / อีเมล"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, width: 400 }}
                />

                <AntTable columns={columns} dataSource={filteredCustomers} rowKey="ID" />

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
                        <Form.Item name="password" label="รหัสผ่าน" rules={[{ required: true }]}><Input.Password /></Form.Item>
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}><Input /></Form.Item>
                        <Form.Item name="genderId" label="เพศ" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value={1}>ชาย</Select.Option>
                                <Select.Option value={2}>หญิง</Select.Option>
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
                        <Form.Item name="phone" label="เบอร์โทร" rules={[{ required: true }]}><Input /></Form.Item>
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
            </div>
        </AdminSidebar>
    );
};

export default CustomerManagement;
