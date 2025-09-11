import React, { useState, useEffect } from "react";
import { SearchOutlined, HistoryOutlined, UserOutlined, IdcardOutlined } from '@ant-design/icons';
import type { QueueHistory } from "../../services/queueService";
import { 
  Layout, 
  Table, 
  Button, 
  Modal, 
  Descriptions, 
  message, 
  Popconfirm, 
  Card, 
  Row, 
  Col, 
  Input, 
  Badge, 
  Tag, 
  Space,
  Avatar,
  Statistic,
  Typography
} from "antd";
import { 
  FaTruck, 
  FaBox, 
  FaClock, 
  FaCheckCircle, 
  FaUser, 
  FaMapMarkerAlt,
  FaPhone,
  FaIdCard,
  FaHistory,
} from 'react-icons/fa';
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { queueService } from "../../services/queueService";
import type { Queue } from "../../services/queueService";
import type { TimeSlot } from '../../services/queueService';
import "./TransportQueuePage.css";

const { Content } = Layout;
const { Title, Text } = Typography;

const EMPLOYEE_ID = 1; // สมมติพนักงานคนนี้คือ id=1
const EMPLOYEE_NAME = "สมชาย ใจดี";

const TransportQueuePage: React.FC = () => {
  const [pickupQueues, setPickupQueues] = useState<Queue[]>([]);
  const [deliveryQueues, setDeliveryQueues] = useState<Queue[]>([]);
  const [searchText, setSearchText] = useState("");
  const [historyVisible, setHistoryVisible] = useState(false);
  const [queueHistories, setQueueHistories] = useState<QueueHistory[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
  const [isPickup, setIsPickup] = useState(true);
  const [showConfirmDelivery, setShowConfirmDelivery] = useState(false);
  const [showConfirmPickup, setShowConfirmPickup] = useState(false);
  const [showAssignTimeSlot, setShowAssignTimeSlot] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]); // สำหรับ lookup time slot id -> time

  // ลบคิว
  const handleDeleteQueue = async (queue: Queue) => {
    try {
      await queueService.deleteQueue(queue.ID);
      message.success("ลบคิวสำเร็จ");
      loadQueues();
    } catch {
      message.error("ไม่สามารถลบคิวได้");
    }
  };

  const deliveryEmployee = {
    name: EMPLOYEE_NAME,
    phone: "081-234-5678",
    gender: "ชาย",
    position: "พนักงานขนส่ง",
  };

  // โหลดคิวจาก backend
  const loadQueues = async () => {
    try {
      const pickup = await queueService.getQueues("pickup");
      const delivery = await queueService.getQueues("delivery");
      setPickupQueues(pickup);
      setDeliveryQueues(delivery);
    } catch (err) {
      message.error("โหลดข้อมูลคิวไม่สำเร็จ");
    }
  };

  // โหลดประวัติคิวที่เสร็จแล้ว (เรียกผ่าน queueService)
  const loadQueueHistories = async () => {
    try {
      const data = await queueService.getQueueHistories();
      setQueueHistories(data);
    } catch {
      message.error("โหลดประวัติคิวไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadQueues();
    // โหลด time slots ทั้งหมดมาเก็บไว้สำหรับ lookup
    (async () => {
      try {
        const pickup = await queueService.getTimeSlots("pickup");
        const delivery = await queueService.getTimeSlots("delivery");
        setAllTimeSlots([...pickup, ...delivery]);
      } catch {
        // ไม่ต้องแจ้ง error
      }
    })();
  }, []);

  // ฟิลเตอร์คิวตาม searchText
  const filterQueues = (queues: Queue[]) => {
    if (!searchText.trim()) return queues;
    const lower = searchText.toLowerCase();
    return queues.filter(q => {
      const customer = q.Order?.Customer;
      const name = customer ? `${customer.FirstName ?? ""} ${customer.LastName ?? ""}`.toLowerCase() : "";
      const address = q.Order?.Address?.AddressDetails?.toLowerCase() || "";
      return name.includes(lower) || address.includes(lower) || String(q.Order?.ID).includes(lower);
    });
  };

  const handleAcceptQueue = async (queue: Queue, type: "pickup" | "delivery") => {
    // ถ้ายังไม่มี timeslot ให้เลือกก่อน
    if (!queue.TimeSlotID) {
      setShowConfirmDelivery(false);
      setShowConfirmPickup(false);
      setSelectedQueue(queue);
      setIsPickup(type === "pickup");
      setSelectedTimeSlot(null);
      try {
        const slots = await queueService.getTimeSlots(type);
        console.log('TimeSlots from backend:', slots);
        const availableSlots = slots.filter(s => s.Status === "available");
        setTimeSlots(availableSlots);
        console.log('Available TimeSlots:', availableSlots);
        setShowAssignTimeSlot(true);
      } catch (err) {
        console.error('Error loading TimeSlots:', err);
        message.error("โหลด TimeSlot ไม่สำเร็จ");
      }
    } else {
      setShowAssignTimeSlot(false);
      setSelectedQueue(queue);
      setIsPickup(type === "pickup");
    }
  };

  // ฟังก์ชัน assign timeslot ให้คิว
  const handleAssignTimeSlot = async () => {
    if (!selectedQueue || !selectedTimeSlot) return;
    try {
      await queueService.assignTimeSlot(selectedQueue.ID, selectedTimeSlot);
      message.success("เลือก TimeSlot สำเร็จ");
      setShowAssignTimeSlot(false);
      setSelectedTimeSlot(null);
      setSelectedQueue(null);
      loadQueues();
    } catch (e: any) {
      message.error(e?.message || "เลือก TimeSlot ไม่สำเร็จ");
    }
  };

  // ฟังก์ชันยืนยันส่งผ้า
  const handleConfirmDeliveryDone = async (queue: Queue) => {
    try {
      await queueService.confirmDeliveryDone(queue.ID, EMPLOYEE_ID);
      message.success("ยืนยันส่งผ้าแล้ว");
      setShowConfirmDelivery(false);
      setSelectedQueue(null);
      loadQueues();
    } catch {
      message.error("ไม่สามารถยืนยันการส่งผ้าได้");
    }
  };

  // ฟังก์ชันยืนยันรับผ้า
  const handleConfirmPickupDone = async (queue: Queue) => {
    try {
      await queueService.confirmPickupDone(queue.ID, EMPLOYEE_ID);
      message.success("ยืนยันรับผ้าแล้ว");
      setShowConfirmPickup(false);
      setSelectedQueue(null);
      loadQueues();
    } catch {
      message.error("ไม่สามารถยืนยันการรับผ้าได้");
    }
  };

  // ฟังก์ชันแปลงสถานะเป็นข้อความ
  const getStatusText = (q: Queue) => {
    const type = q.Queue_type?.toLowerCase().trim();
    const status = q.Status?.toLowerCase().trim();
    if (type === "delivery") {
      if (status === "waiting") return "รอรับคิวส่งผ้า";
      if (status === "delivery_in_progress") return `${EMPLOYEE_NAME} กำลังไปส่งผ้า`;
      if (status === "delivered") return "ส่งผ้าเรียบร้อยแล้ว";
      return "สถานะไม่ระบุ";
    } else if (type === "pickup") {
      if (status === "waiting") return "รอรับคิวรับผ้า";
      if (status === "pickup_in_progress") return `${EMPLOYEE_NAME} กำลังไปรับผ้า`;
      if (status === "done") return "รอรับคิวส่งผ้า";
      return "สถานะไม่ระบุ";
    }
    return "สถานะไม่ระบุ";
  };

  const getStatusColor = (q: Queue) => {
    const type = q.Queue_type?.toLowerCase().trim();
    const status = q.Status?.toLowerCase().trim();
    if (status === "waiting") return "#f39c12";
    if (status === "pickup_in_progress" || status === "delivery_in_progress") return "#3498db";
    if (status === "done" || status === "delivered") return "#27ae60";
    return "#95a5a6";
  };

  const pickupColumns = [
    { 
      title: "Order ID", 
      dataIndex: ["Order", "ID"],
      width: 100,
      render: (text: any) => (
        <Tag color="blue" style={{ fontWeight: 'bold' }}>
          #{text}
        </Tag>
      )
    },
    {
      title: "ชื่อลูกค้า",
      width: 200,
      render: (_: any, record: Queue) => {
        const customer = record.Order?.Customer;
        const name = customer ? `${customer.FirstName ?? ""} ${customer.LastName ?? ""}` : "-";
        return (
          <Space>
            <Avatar 
              size="small" 
              style={{ backgroundColor: '#1890ff' }}
              icon={<UserOutlined />}
            />
            <Text strong>{name}</Text>
          </Space>
        );
      },
    },
    {
      title: "ที่อยู่",
      width: 300,
      render: (_: any, record: Queue) => {
        const address = record.Order?.Address;
        return (
          <Space>
            <FaMapMarkerAlt color="#e74c3c" />
            <Text>{address?.AddressDetails ?? "-"}</Text>
          </Space>
        );
      },
    },
    { 
      title: "สถานะ", 
      width: 200,
      render: (_: any, record: Queue) => (
        <Tag color={getStatusColor(record)} style={{ borderRadius: '12px', fontWeight: 'bold' }}>
          {getStatusText(record)}
        </Tag>
      )
    },
    {
      title: "จัดการ",
      width: 300,
      render: (_: any, record: Queue) => {
        const type = record.Queue_type?.toLowerCase().trim();
        const status = record.Status?.toLowerCase().trim();
        return (
          <Space wrap>
            {type === "pickup" && status === "waiting" && !record.TimeSlotID && (
              <Button 
                type="primary" 
                icon={<FaClock />}
                style={{ borderRadius: '8px' }}
                onClick={() => handleAcceptQueue(record, "pickup")}
              >
                เลือก TimeSlot
              </Button>
            )}
            {type === "pickup" && status === "waiting" && record.TimeSlotID && (
              <Button 
                type="primary" 
                icon={<FaTruck />}
                style={{ borderRadius: '8px' }}
                onClick={async () => {
                  await queueService.updateQueue(record.ID, { status: "pickup_in_progress", employee_id: EMPLOYEE_ID });
                  message.success("รับคิวรับผ้าแล้ว (pickup_in_progress)");
                  loadQueues();
                }}
              >
                กดรับคิวรับผ้า
              </Button>
            )}
            {type === "pickup" && status === "pickup_in_progress" && (
              <Button 
                type="primary" 
                danger 
                icon={<FaCheckCircle />}
                style={{ borderRadius: '8px' }}
                onClick={() => { setSelectedQueue(record); setShowConfirmPickup(true); }}
              >
                ยืนยันรับผ้าแล้ว
              </Button>
            )}
            <Popconfirm title="ยืนยันลบคิวนี้?" onConfirm={() => handleDeleteQueue(record)} okText="ลบ" cancelText="ยกเลิก">
              <Button danger style={{ borderRadius: '8px' }}>ลบ</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const deliveryColumns = [
    { 
      title: "Order ID", 
      dataIndex: ["Order", "ID"],
      width: 100,
      render: (text: any) => (
        <Tag color="green" style={{ fontWeight: 'bold' }}>
          #{text}
        </Tag>
      )
    },
    {
      title: "ชื่อลูกค้า",
      width: 200,
      render: (_: any, record: Queue) => {
        const customer = record.Order?.Customer;
        const name = customer ? `${customer.FirstName ?? ""} ${customer.LastName ?? ""}` : "-";
        return (
          <Space>
            <Avatar 
              size="small" 
              style={{ backgroundColor: '#52c41a' }}
              icon={<UserOutlined />}
            />
            <Text strong>{name}</Text>
          </Space>
        );
      },
    },
    {
      title: "ที่อยู่",
      width: 300,
      render: (_: any, record: Queue) => {
        const address = record.Order?.Address;
        return (
          <Space>
            <FaMapMarkerAlt color="#e74c3c" />
            <Text>{address?.AddressDetails ?? "-"}</Text>
          </Space>
        );
      },
    },
    { 
      title: "สถานะ", 
      width: 200,
      render: (_: any, record: Queue) => (
        <Tag color={getStatusColor(record)} style={{ borderRadius: '12px', fontWeight: 'bold' }}>
          {getStatusText(record)}
        </Tag>
      )
    },
    {
      title: "จัดการ",
      width: 300,
      render: (_: any, record: Queue) => {
        const type = record.Queue_type?.toLowerCase().trim();
        const status = record.Status?.toLowerCase().trim();
        return (
          <Space wrap>
            {type === "delivery" && status === "waiting" && !record.TimeSlotID && (
              <Button 
                type="primary" 
                icon={<FaClock />}
                style={{ borderRadius: '8px' }}
                onClick={() => handleAcceptQueue(record, "delivery")}
              >
                เลือก TimeSlot
              </Button>
            )}
            {type === "delivery" && status === "waiting" && record.TimeSlotID && (
              <Button 
                type="primary" 
                icon={<FaBox />}
                style={{ borderRadius: '8px' }}
                onClick={async () => {
                  await queueService.acceptQueue(record.ID, EMPLOYEE_ID);
                  message.success("รับคิวส่งผ้าแล้ว");
                  loadQueues();
                }}
              >
                กดรับคิวส่งผ้า
              </Button>
            )}
            {type === "delivery" && status === "delivery_in_progress" && (
              <Button 
                type="primary" 
                danger 
                icon={<FaCheckCircle />}
                style={{ borderRadius: '8px' }}
                onClick={() => { setSelectedQueue(record); setShowConfirmDelivery(true); }}
              >
                ยืนยันส่งผ้าแล้ว
              </Button>
            )}
            <Popconfirm title="ยืนยันลบคิวนี้?" onConfirm={() => handleDeleteQueue(record)} okText="ลบ" cancelText="ยกเลิก">
              <Button danger style={{ borderRadius: '8px' }}>ลบ</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <EmployeeSidebar>
      <Layout style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        <Content style={{ padding: '24px', margin: 0 }}>
          {/* Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            borderRadius: '16px', 
            padding: '24px', 
            marginBottom: '24px',
            color: 'white'
          }}>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: '8px' }}>
              🚚 ระบบจัดการคิวขนส่ง
            </Title>
            <Text style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
              จัดการคิวรับและส่งผ้าของลูกค้า
            </Text>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center' , background: '#3BAEA3'}}>
                <Statistic 
                  title={<span style={{ color: '#ffff' }}>คิวรับผ้า</span>}
                  value={pickupQueues.length}
                  prefix={<FaTruck style={{ color: '#ffff' }} />}
                  valueStyle={{ color: '#ffff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center', background: '#F7D55C' }}>
                <Statistic
                  title={<span style={{ color: '#ffff' }}>คิวส่งผ้า</span>}
                  value={deliveryQueues.length}
                  prefix={<FaBox style={{ color: '#ffff' }} />}
                  valueStyle={{ color: '#ffff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ borderRadius: '12px', textAlign: 'center', background: '#FE6F91' }}>
                <Statistic
                  title={<span style={{ color: '#ffff' }}>รวมทั้งหมด</span>}
                  value={pickupQueues.length + deliveryQueues.length}
                  prefix={<FaCheckCircle style={{ color: '#ffff' }} />}
                  valueStyle={{ color: '#ffff' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Search and Actions */}
          <Card style={{ borderRadius: '12px', marginBottom: '24px' }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={16}>
                <Input
                  placeholder="ค้นหาคิว (ชื่อ, ที่อยู่, Order ID)"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ borderRadius: '8px' }}
                  size="large"
                />
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  icon={<HistoryOutlined />} 
                  onClick={() => { setHistoryVisible(true); loadQueueHistories(); }}
                  style={{ borderRadius: '8px', width: '100%' }}
                  size="large"
                >
                  ดูประวัติคิวที่เสร็จแล้ว
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Employee Info */}
          <Card 
            title={
              <Space>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span>ข้อมูลพนักงานขนส่ง</span>
              </Space>
            } 
            style={{ borderRadius: '12px', marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={6}>
                <Space>
                  <FaUser style={{ color: '#1890ff' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>ชื่อ-สกุล</Text>
                    <Text strong>{deliveryEmployee.name}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6}>
                <Space>
                  <FaPhone style={{ color: '#52c41a' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>เบอร์ติดต่อ</Text>
                    <Text strong>{deliveryEmployee.phone}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6}>
                <Space>
                  <FaIdCard style={{ color: '#f39c12' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>เพศ</Text>
                    <Text strong>{deliveryEmployee.gender}</Text>
                  </div>
                </Space>
              </Col>
              <Col xs={24} sm={6}>
                <Space>
                  <IdcardOutlined style={{ color: '#e74c3c' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>ตำแหน่ง</Text>
                    <Text strong>{deliveryEmployee.position}</Text>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Pickup Queue */}
          <Card 
            title={
              <Space align="center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge count={pickupQueues.length} showZero offset={[10, 10]}>
                  <FaTruck style={{ fontSize: '20px', color: '#1890ff', verticalAlign: 'middle' }} />
                </Badge>
                <span style={{ fontSize: '18px', fontWeight: 'bold', verticalAlign: 'middle', marginLeft: 14 }}>คิวรับผ้า</span>
              </Space>
            }
            style={{ borderRadius: '12px', marginBottom: '24px' }}
          >
            <Table 
              columns={pickupColumns} 
              dataSource={filterQueues(pickupQueues)} 
              rowKey={record => record.ID} 
              pagination={{ pageSize: 5, showSizeChanger: false }}
              style={{ borderRadius: '8px' }}
              scroll={{ x: 1200 }}
            />
          </Card>

          {/* Delivery Queue */}
          <Card 
            title={
              <Space align="center" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge count={deliveryQueues.length} showZero offset={[10, 10]}>
                  <FaBox style={{ fontSize: '20px', color: '#52c41a', verticalAlign: 'middle' }} />
                </Badge>
                <span style={{ fontSize: '18px', fontWeight: 'bold', verticalAlign: 'middle', marginLeft: 14 }}>คิวส่งผ้า</span>
              </Space>
            }
            style={{ borderRadius: '12px' }}
          >
            <Table 
              columns={deliveryColumns} 
              dataSource={filterQueues(deliveryQueues)} 
              rowKey={record => record.ID} 
              pagination={{ pageSize: 5, showSizeChanger: false }}
              style={{ borderRadius: '8px' }}
              scroll={{ x: 1200 }}
            />
          </Card>

          {/* Modals - Keep all existing modals unchanged */}
          <Modal
            open={historyVisible}
            title={
              <Space>
                <FaHistory style={{ color: '#1890ff' }} />
                <span>ประวัติคิวที่เสร็จแล้ว</span>
              </Space>
            }
            onCancel={() => setHistoryVisible(false)}
            footer={null}
            width={900}
            style={{ borderRadius: '12px' }}
          >
            <Table
              dataSource={queueHistories}
              rowKey={record => record.ID}
              columns={[
                { title: "Queue ID", dataIndex: "QueueID" },
                { title: "วันที่เสร็จ", dataIndex: "CreatedAt", render: (v: string) => new Date(v).toLocaleString() },
                {
                  title: "ชื่อลูกค้า",
                  render: (_: any, record: any) => {
                    const customer = record.Queues?.Order?.Customer;
                    return customer ? `${customer.FirstName ?? ''} ${customer.LastName ?? ''}` : '-';
                  }
                },
                {
                  title: "ที่อยู่",
                  render: (_: any, record: any) => record.Queues?.Order?.Address?.AddressDetails ?? '-'
                },
                {
                  title: "เบอร์โทร",
                  render: (_: any, record: any) => record.Queues?.Order?.Customer?.PhoneNumber ?? '-'
                },
                {
                  title: "TimeSlot",
                  render: (_: any, record: any) => {
                    // หา time_slot_id จาก Queues
                    const timeSlotId = record.Queues?.time_slot_id || record.Queues?.TimeSlotID || record.Queues?.TimeSlotId;
                    if (timeSlotId && allTimeSlots.length > 0) {
                      const slot = allTimeSlots.find(ts => ts.ID === timeSlotId);
                      if (slot && slot.Start_time && slot.End_time) {
                        const start = new Date(slot.Start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(slot.End_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `${start} - ${end}`;
                      }
                    }
                    return '-';
                  }
                },
              ]}
              pagination={{ pageSize: 8 }}
            />
          </Modal>

          <Modal
            open={showAssignTimeSlot}
            title="เลือกช่วงเวลา (TimeSlot) สำหรับคิว"
            onOk={handleAssignTimeSlot}
            onCancel={() => { setShowAssignTimeSlot(false); setSelectedTimeSlot(null); setSelectedQueue(null); }}
            okText="ยืนยันเลือก TimeSlot"
            cancelText="ยกเลิก"
            destroyOnClose
            okButtonProps={{ disabled: !selectedTimeSlot }}
            style={{ borderRadius: '12px' }}
          >
            {selectedQueue && (
              <Descriptions column={1} bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label="Order ID">{typeof selectedQueue.Order?.ID === 'number' && selectedQueue.Order.ID !== 0 ? selectedQueue.Order.ID : "-"}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {selectedQueue.Order?.Customer ? `${selectedQueue.Order.Customer.FirstName ?? ""} ${selectedQueue.Order.Customer.LastName ?? ""}` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="TimeSlot">
                  {selectedQueue.TimeSlot ? `${new Date(selectedQueue.TimeSlot.Start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedQueue.TimeSlot.End_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "-"}
                </Descriptions.Item>
              </Descriptions>
            )}
            <div>
              {timeSlots.length === 0 ? (
                <div style={{ color: 'red' }}>ไม่พบ TimeSlot ที่ว่าง</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {timeSlots.map(slot => (
                    <li key={slot.ID} style={{ marginBottom: 8 }}>
                      <label>
                        <input
                          type="radio"
                          name="timeslot"
                          value={slot.ID}
                          checked={selectedTimeSlot === slot.ID}
                          onChange={() => setSelectedTimeSlot(slot.ID)}
                        />
                        {` ${new Date(slot.Start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.End_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (${slot.Status})`}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Modal>


          <Modal
            open={showConfirmDelivery}
            title="ยืนยันการส่งผ้า"
            onOk={() => selectedQueue && handleConfirmDeliveryDone(selectedQueue)}
            onCancel={() => { setSelectedQueue(null); setShowConfirmDelivery(false); }}
            okText="ยืนยันส่งผ้าแล้ว"
            cancelText="ยกเลิก"
            style={{ borderRadius: '12px' }}
          >
            {selectedQueue && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{typeof selectedQueue.Order?.ID === 'number' && selectedQueue.Order.ID !== 0 ? selectedQueue.Order.ID : "-"}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {selectedQueue.Order?.Customer ? `${selectedQueue.Order.Customer.FirstName ?? ""} ${selectedQueue.Order.Customer.LastName ?? ""}` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="TimeSlot">
                  {(() => {
                    const timeSlotId = selectedQueue.TimeSlotID;
                    if (timeSlotId && allTimeSlots.length > 0) {
                      const slot = allTimeSlots.find(ts => ts.ID === timeSlotId);
                      if (slot && slot.Start_time && slot.End_time) {
                        const start = new Date(slot.Start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(slot.End_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `${start} - ${end}`;
                      }
                    }
                    return '-';
                  })()}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>

          <Modal
            open={showConfirmPickup}
            title="ยืนยันการรับผ้า"
            onOk={() => selectedQueue && handleConfirmPickupDone(selectedQueue)}
            onCancel={() => { setSelectedQueue(null); setShowConfirmPickup(false); }}
            okText="ยืนยันรับผ้าแล้ว"
            cancelText="ยกเลิก"
            style={{ borderRadius: '12px' }}
          >
            {selectedQueue && (
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Order ID">{typeof selectedQueue.Order?.ID === 'number' && selectedQueue.Order.ID !== 0 ? selectedQueue.Order.ID : "-"}</Descriptions.Item>
                <Descriptions.Item label="ชื่อลูกค้า">
                  {selectedQueue.Order?.Customer ? `${selectedQueue.Order.Customer.FirstName ?? ""} ${selectedQueue.Order.Customer.LastName ?? ""}` : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="ที่อยู่">{selectedQueue.Order?.Address?.AddressDetails ?? "-"}</Descriptions.Item>
                <Descriptions.Item label="TimeSlot">
                  {(() => {
                    const timeSlotId = selectedQueue.TimeSlotID || selectedQueue.TimeSlotID || selectedQueue.TimeSlotID;
                    if (timeSlotId && allTimeSlots.length > 0) {
                      const slot = allTimeSlots.find(ts => ts.ID === timeSlotId);
                      if (slot && slot.Start_time && slot.End_time) {
                        const start = new Date(slot.Start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const end = new Date(slot.End_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        return `${start} - ${end}`;
                      }
                    }
                    return '-';
                  })()}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Modal>
        </Content>
      </Layout>
    </EmployeeSidebar>
  );
};

export default TransportQueuePage;