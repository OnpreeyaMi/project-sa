import React, { useState } from 'react';
import { Layout, Table, Button, Modal, Descriptions, message, Divider } from 'antd';
import EmployeeSidebar from '../../component/layout/employee/empSidebar';
import './TransportQueuePage.css';

const { Content } = Layout;

interface Order {
  key: string;
  orderId: string;
  customerName: string;
  address: string;
  createdTime: string;
  status: string;
  assignedEmp?: string;
}

const EMPLOYEE_NAME = 'สมชาย ใจดี';

const TransportQueuePage: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isPickup, setIsPickup] = useState(true);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);
  const [showConfirmPickup, setShowConfirmPickup] = useState(false);

  const deliveryEmployee = {
  name: 'สมชาย ใจดี',
  phone: '081-234-5678',
  gender: 'ชาย',
  position: 'พนักงานขนส่ง',
};


  const [orderData, setOrderData] = useState<Order[]>([
    {
      key: '1',
      orderId: 'ORD001',
      customerName: 'สมชาย',
      address: '123 ถ.สุขุมวิท',
      createdTime: '08:30',
      status: 'waiting',
    },
    {
      key: '2',
      orderId: 'ORD002',
      customerName: 'อมร',
      address: '77 ซ.ลาดพร้าว',
      createdTime: '09:00',
      status: 'done',
    },
    {
      key: '3',
      orderId: 'ORD003',
      customerName: 'กานต์',
      address: '88 ซ.เพชรบุรี',
      createdTime: '09:30',
      status: 'delivery_in_progress',
      assignedEmp: 'สมชาย ใจดี',
    },
  ]);

  const handleAcceptQueue = (order: Order, type: 'pickup' | 'delivery') => {
    setSelectedOrder(order);
    setIsPickup(type === 'pickup');
  };

  const handleConfirmAccept = () => {
    if (!selectedOrder) return;

    const updatedOrders = orderData.map(order =>
      order.key === selectedOrder.key
        ? {
            ...order,
            status: isPickup ? 'pickup_in_progress' : 'delivery_in_progress',
            assignedEmp: EMPLOYEE_NAME,
          }
        : order
    );

    setOrderData(updatedOrders);
    setSelectedOrder(null);
    message.success(isPickup ? 'รับคิวรับผ้าเรียบร้อยแล้ว' : 'รับคิวส่งผ้าเรียบร้อยแล้ว');
  };

  const handleConfirmDeliveryDone = (order: Order) => {
    const updatedOrders = orderData.map(o =>
      o.key === order.key ? { ...o, status: 'delivered' } : o
    );
    setOrderData(updatedOrders);
    setShowConfirmDelivery(false);
    setSelectedOrder(null);
    message.success('ยืนยันส่งผ้าแล้ว');
  };

  const handleConfirmPickupDone = (order: Order) => {
    const updatedOrders = orderData.map(o =>
      o.key === order.key ? { ...o, status: 'done' } : o
    );
    setOrderData(updatedOrders);
    setShowConfirmPickup(false);
    setSelectedOrder(null);
    message.success('ยืนยันรับผ้าแล้ว');
  };

  const getStatusText = (order: Order) => {
    switch (order.status) {
      case 'pickup_in_progress':
        return `${order.assignedEmp} กำลังไปรับผ้า`;
      case 'delivery_in_progress':
        return `${order.assignedEmp} กำลังไปส่งผ้า`;
      case 'delivered':
        return 'ส่งผ้าเรียบร้อยแล้ว';
      case 'waiting':
      case 'done':
        return 'รอรับคิว';
      default:
        return 'สถานะไม่ระบุ';
    }
  };

  const pickupColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
    },
    {
      title: 'ชื่อลูกค้า',
      dataIndex: 'customerName',
    },
    {
      title: 'ที่อยู่',
      dataIndex: 'address',
    },
    {
      title: 'สถานะ',
      render: (_: any, record: Order) => getStatusText(record),
    },
    {
      title: 'จัดการ',
      render: (_: any, record: Order) => {
        if (record.status === 'waiting') {
          return (
            <Button type="primary" onClick={() => handleAcceptQueue(record, 'pickup')}>
              กดรับคิวรับผ้า
            </Button>
          );
        } else if (
          record.status === 'pickup_in_progress' &&
          record.assignedEmp === EMPLOYEE_NAME
        ) {
          return (
            <Button danger onClick={() => {
              setSelectedOrder(record);
              setShowConfirmPickup(true);
            }}>
              ยืนยันรับผ้าแล้ว
            </Button>
          );
        } else {
          return null;
        }
      },
    },
  ];

  const deliveryColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
    },
    {
      title: 'ชื่อลูกค้า',
      dataIndex: 'customerName',
    },
    {
      title: 'ที่อยู่',
      dataIndex: 'address',
    },
    {
      title: 'สถานะ',
      render: (_: any, record: Order) => getStatusText(record),
    },
    {
      title: 'จัดการ',
      render: (_: any, record: Order) => {
        if (record.status === 'done') {
          return (
            <Button type="primary" onClick={() => handleAcceptQueue(record, 'delivery')}>
              กดรับคิวส่งผ้า
            </Button>
          );
        } else if (
          record.status === 'delivery_in_progress' &&
          record.assignedEmp === EMPLOYEE_NAME
        ) {
          return (
            <Button danger onClick={() => {
              setSelectedOrder(record);
              setShowConfirmDelivery(true);
            }}>
              ยืนยันส่งผ้าแล้ว
            </Button>
          );
        } else {
          return null;
        }
      },
    },
  ];

  return (
    <EmployeeSidebar>
      <Layout className="transport-layout">
        <Content className="transport-content">
          <Descriptions
            title="👤 ข้อมูลพนักงานขนส่ง"
            bordered
            column={2}
            className="transport-employee"
          >
          <Descriptions.Item label="ชื่อ-สกุล">{deliveryEmployee.name}</Descriptions.Item>
          <Descriptions.Item label="เบอร์ติดต่อ">{deliveryEmployee.phone}</Descriptions.Item>
          <Descriptions.Item label="เพศ">{deliveryEmployee.gender}</Descriptions.Item>
          <Descriptions.Item label="ตำแหน่ง">{deliveryEmployee.position}</Descriptions.Item>
          </Descriptions>

          <h1 className="transport-heading">🚚 คิวรับผ้า</h1>
          <Table
            columns={pickupColumns}
            dataSource={orderData.filter(order =>
              ['waiting', 'pickup_in_progress'].includes(order.status)
            )}
            pagination={false}
          />
 
          <Divider />

          <h1 className="transport-heading">📦 คิวส่งผ้า</h1>
          <Table
            columns={deliveryColumns}
            dataSource={orderData.filter(order =>
              ['done', 'delivery_in_progress'].includes(order.status)
            )}
            pagination={false}
          />

          <Modal
            open={!!selectedOrder && !showConfirmDelivery && !showConfirmPickup}
            title={isPickup ? 'รายละเอียดคิวรับผ้า' : 'รายละเอียดคิวส่งผ้า'}
            onCancel={() => setSelectedOrder(null)}
            onOk={handleConfirmAccept}
            okText="ยืนยันรับคิว"
            cancelText="ยกเลิก"
          >
            {selectedOrder && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedOrder.orderId}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedOrder.address}</Descriptions.Item>
                <Descriptions.Item label="เวลาสั่ง">{selectedOrder.createdTime}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          <Modal
            open={showConfirmDelivery}
            title="ยืนยันการส่งผ้า"
            onOk={() => selectedOrder && handleConfirmDeliveryDone(selectedOrder)}
            onCancel={() => {
              setSelectedOrder(null);
              setShowConfirmDelivery(false);
            }}
            okText="ยืนยันส่งผ้าแล้ว"
            cancelText="ยกเลิก"
          >
            {selectedOrder && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedOrder.orderId}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedOrder.address}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          <Modal
            open={showConfirmPickup}
            title="ยืนยันการรับผ้า"
            onOk={() => selectedOrder && handleConfirmPickupDone(selectedOrder)}
            onCancel={() => {
              setSelectedOrder(null);
              setShowConfirmPickup(false);
            }}
            okText="ยืนยันรับผ้าแล้ว"
            cancelText="ยกเลิก"
          >
            {selectedOrder && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{selectedOrder.orderId}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedOrder.address}</Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Content>
      </Layout>
    </EmployeeSidebar>
  );
};

export default TransportQueuePage;
