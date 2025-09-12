import React, { useState, useEffect } from 'react';
import { queueService } from '../../services/queueService';
import type { Queue } from '../../services/queueService';
import {
  Card,
  Steps,
  Descriptions,
  Typography,
  Row,
  Col,
  Tag,
  Progress,
  Badge,
  Select,
  Avatar,
} from 'antd';
import type { DescriptionsProps } from 'antd';
import type { Order } from '../../services/orderdetailService';
import {
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaSoap,
  FaTshirt,
  FaFlag,
  FaShippingFast,
  FaHome,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaHashtag,
  FaUser,
  FaBox,
} from 'react-icons/fa';
import CustomerSidebar from '../../component/layout/customer/CusSidebar';
import { useUser } from '../../context/UserContext';

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

const OrderStatusPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStep, setAnimatedStep] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [pickupQueues, setPickupQueues] = useState<Queue[]>([]);
  const [deliveryQueues, setDeliveryQueues] = useState<Queue[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const getField = (obj: any, ...keys: string[]): any => {
    if (obj == null) return undefined;
    for (const key of keys) {
      // support dotted path "a.b.c"
      if (key.includes('.')) {
        const parts = key.split('.');
        let val = obj;
        for (const p of parts) {
          if (val == null) break;
          val = val[p];
        }
        if (val !== undefined && val !== null) return val;
      } else {
        // direct property
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const v = obj[key];
          if (v !== undefined && v !== null) return v;
        }
        // case-insensitive fallback (search object's keys)
        const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey) {
          const v = obj[foundKey];
          if (v !== undefined && v !== null) return v;
        }
      }
    }
    return undefined;
  };

  // get customer object from user (support both .customer and .Customer)
  const customerObj = getField(user, 'customer', 'Customer') ?? user?.customer ?? user?.customer ?? null;
  const customerId = getField(customerObj, 'ID', 'id');


  // fetch customer + queues (ดึง orders list)
  useEffect(() => {
    let ignore = false;
    setLoading(true);

    Promise.all([
      fetch(`http://localhost:8000/customers/${customerId}`).then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`ไม่สามารถดึงข้อมูลลูกค้าได้: ${res.status} ${text}`);
        }
        return res.json();
      }),
      queueService.getQueues('pickup').catch(() => []),
      queueService.getQueues('delivery').catch(() => []),
    ])
      .then(([customerData, pickupQueuesData, deliveryQueuesData]) => {
        if (ignore) return;
        // Orders field may be "Orders" or "orders"
        const fetchedOrders: Order[] = getField(customerData, 'Orders', 'orders') ?? [];
        setOrders(fetchedOrders);
        setPickupQueues(pickupQueuesData ?? []);
        setDeliveryQueues(deliveryQueuesData ?? []);
        setError(null);

        // auto-select latest order if any (use CreatedAt / created_at fallback)
        if (fetchedOrders && fetchedOrders.length > 0) {
          const sorted = [...fetchedOrders].sort((a: any, b: any) => {
            const aTime = new Date(getField(a, 'CreatedAt', 'created_at') ?? 0).getTime();
            const bTime = new Date(getField(b, 'CreatedAt', 'created_at') ?? 0).getTime();
            return bTime - aTime;
          });
          const pick = sorted[0];
          const pickId = getField(pick, 'ID', 'id');
          setSelectedOrderId(typeof pickId === 'number' ? pickId : Number(pickId) || null);
        }
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message || 'เกิดข้อผิดพลาดขณะดึงข้อมูล');
        setOrders([]);
        setPickupQueues([]);
        setDeliveryQueues([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  // เมื่อ selectedOrderId เปลี่ยน ให้ fetch order ล่าสุดจาก /orders/:id
  useEffect(() => {
    if (!selectedOrderId) {
      setSelectedOrder(null);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:8000/orders/${selectedOrderId}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`ไม่สามารถดึงข้อมูลออเดอร์: ${res.status} ${text}`);
        }
        return res.json();
      })
      .then((orderData) => {
        setSelectedOrder(orderData);
      })
      .catch((err) => {
        setError(err.message || 'เกิดข้อผิดพลาดขณะดึงข้อมูลออเดอร์');
        setSelectedOrder(null);
      })
      .finally(() => setLoading(false));
  }, [selectedOrderId]);

  const statusSteps = [
    {
      title: 'รอดำเนินการ',
      icon: <FaClock />,
      color: '#ED553B',
      description: 'ผ้าอยู่ในคิวรอการดำเนินการ',
    },
    {
      title: 'กำลังไปรับผ้า',
      icon: <FaTruck />,
      color: '#F6D55C',
      description: 'พนักงานกำลังเดินทางไปรับผ้า',
    },
    {
      title: 'รับผ้าเรียบร้อย',
      icon: <FaCheckCircle />,
      color: '#3CAEA3',
      description: 'รับผ้าจากลูกค้าเรียบร้อยแล้ว',
    },
    {
      title: 'กำลังซัก',
      icon: <FaSoap />,
      color: '#20639B',
      description: 'กำลังซักผ้าด้วยความระมัดระวัง',
    },
    {
      title: 'กำลังอบ',
      icon: <FaTshirt />,
      color: '#0E4587',
      description: 'อบผ้าด้วยระบบถนอมใยผ้า',
    },
    {
      title: 'เสร็จสิ้น',
      icon: <FaFlag />,
      color: '#28a745',
      description: 'ซักอบเสร็จสิ้น พร้อมจัดส่ง',
    },
    {
      title: 'กำลังจัดส่ง',
      icon: <FaShippingFast />,
      color: '#FF6B6B',
      description: 'พนักงานกำลังจัดส่งผ้า',
    },
    {
      title: 'จัดส่งเรียบร้อยแล้ว',
      icon: <FaHome />,
      color: '#4ECDC4',
      description: 'ส่งผ้าถึงลูกค้าเรียบร้อยแล้ว',
    },
  ];

  // selectedOrder จะถูกอัปเดตจาก useEffect ข้างบน

  // determine merged status with queue overrides
  const statusToStepIndex: Record<string, number> = {
    waiting: 0,
    รอดำเนินการ: 0,
    pickup_in_progress: 1,
    'กำลังไปรับผ้า': 1,
    รับผ้าเรียบร้อย: 2,
    done: 2,
    washing: 3,
    'กำลังซัก': 3,
    drying: 4,
    'กำลังอบ': 4,
    finished: 5,
    'เสร็จสิ้น': 5,
    delivery_in_progress: 6,
    delivered: 7,
    'จัดส่งเรียบร้อยแล้ว': 7,
  };

  const getOrderStatusRaw = (o: any) => {
    // try various fields
    const s = getField(o, 'status', 'Status');
    if (s) return s;
    // maybe LaundryProcesses exist and hold a status
    if (o?.LaundryProcesses && Array.isArray(o.LaundryProcesses) && o.LaundryProcesses.length > 0) {
      return getField(o.LaundryProcesses[0], 'status', 'Status') ?? '';
    }
    return '';
  };

  // compute merged status
  let mergedStatus = (selectedOrder && getOrderStatusRaw(selectedOrder)) || '';

  if (selectedOrder) {
    const orderId = getField(selectedOrder, 'ID', 'id');
    const pickupQueue = pickupQueues.find((q) => q?.OrderID === orderId || q?.OrderID === selectedOrder.ID || q?.OrderID === selectedOrder.id);
    const deliveryQueue = deliveryQueues.find((q) => q?.OrderID === orderId || q?.OrderID === selectedOrder.ID || q?.OrderID === selectedOrder.id);

    // If order status is empty or waiting, look at pickupQueue
    if (!mergedStatus || ['waiting', 'รอดำเนินการ', ''].includes(String(mergedStatus))) {
      if (pickupQueue && (pickupQueue.Status === 'pickup_in_progress' || pickupQueue.Status === 'pickup_in_progress')) {
        mergedStatus = 'pickup_in_progress';
      } else if (pickupQueue && (pickupQueue.Status === 'done' || pickupQueue.Status === 'รับผ้าเรียบร้อย')) {
        mergedStatus = 'done';
      }
    }

    // If order is finished, check delivery queue
    if (['finished', 'เสร็จสิ้น', 'done', 'รับผ้าเรียบร้อย'].includes(String(mergedStatus))) {
      if (deliveryQueue && deliveryQueue.Status === 'delivery_in_progress') {
        mergedStatus = 'delivery_in_progress';
      } else if (deliveryQueue && (deliveryQueue.Status === 'delivered' || deliveryQueue.Status === 'จัดส่งเรียบร้อยแล้ว')) {
        mergedStatus = 'delivered';
      }
    }
  }

  // map mergedStatus -> step index/title
  let orderStatusLabel = mergedStatus;
  let currentStep = 0;
  if (mergedStatus && mergedStatus in statusToStepIndex) {
    currentStep = statusToStepIndex[mergedStatus];
    orderStatusLabel = statusSteps[currentStep]?.title ?? mergedStatus;
  } else {
    // default when unknown status: if no mergedStatus but selectedOrder exists, choose 0
    currentStep = 0;
    orderStatusLabel = statusSteps[currentStep]?.title ?? mergedStatus;
  }

  const progressPercent = Math.round(((currentStep >= 0 ? currentStep : 0) / (statusSteps.length - 1)) * 100);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Animate steps
    const animateSteps = () => {
      for (let i = 0; i <= currentStep; i++) {
        setTimeout(() => setAnimatedStep(i), i * 200);
      }
    };

    animateSteps();

    return () => clearInterval(timer);
  }, [currentStep]);

  const getStepStatus = (index: number) => {
    if (index < currentStep) return 'finish';
    if (index === currentStep) return 'process';
    return 'wait';
  };

  const items: DescriptionsProps['items'] = selectedOrder
    ? [
      {
        key: '1',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <FaUser color="#0E4587" />
            ชื่อลูกค้า
          </span>
        ),
        children: (
          <Text strong style={{ color: '#0E4587', fontSize: '1.1rem' }}>
            {selectedOrder.Customer
              ? `${getField(selectedOrder.Customer, 'FirstName', 'firstName') ?? ''} ${getField(
                selectedOrder.Customer,
                'LastName',
                'lastName'
              ) ?? ''}`.trim()
              : '-'}
          </Text>
        ),
      },
      {
        key: '2',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <FaHashtag color="#3CAEA3" />
            หมายเลขออเดอร์
          </span>
        ),
        children: (
          <Tag
            color="blue"
            style={{
              fontSize: '1rem',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 'bold',
            }}
          >
            {getField(selectedOrder, 'ID', 'id') ?? '-'}
          </Tag>
        ),
      },
      {
        key: '3',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <FaCalendarAlt color="#F6D55C" />
            วันที่สั่ง
          </span>
        ),
        children: (
          <Text style={{ fontSize: '1rem', color: '#333' }}>
            {(() => {
              const dateStr = getField(selectedOrder, 'created_at', 'CreatedAt', 'createdAt');
              return dateStr ? new Date(dateStr).toLocaleString('th-TH') : '-';
            })()}
          </Text>
        ),
      },
      {
        key: '4',
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
            <FaMapMarkerAlt color="#ED553B" />
            ที่อยู่จัดส่ง
          </span>
        ),
        children: (
          <div style={{ fontSize: '1rem', color: '#333', lineHeight: '1.5' }}>
            {(() => {
              // The API uses "Addresses" or "addresses"
              const addresses: any[] = getField(selectedOrder.Customer, 'Addresses', 'addresses') ?? [];
              const addressList = Array.isArray(addresses)
                ? addresses
                  .map((addr) => getField(addr, 'AddressDetails', 'addressDetails', 'detail') ?? getField(addr, 'address', 'addressDetails'))
                  .filter(Boolean)
                : [];
              const joined = addressList.length > 0 ? addressList.join(', ') : '-';
              return joined;
            })()}
            <br />
            <Text type="secondary" style={{ fontSize: '0.9rem' }}>
              📞 {getField(selectedOrder.Customer, 'PhoneNumber', 'phoneNumber') ?? '-'}
            </Text>
          </div>
        ),
      },
    ]
    : [];

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        Loading...
      </div>
    );
  if (error)
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>
    );

  if (orders.length === 0) {
    return (
      <CustomerSidebar>
        <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 20 }}>
          <div>คุณยังไม่มีออเดอร์ในระบบ</div>
          <div style={{ fontSize: 60, margin: '32px 0' }}>🧺</div>
          <div>เริ่มต้นสั่งซักผ้าได้เลย!</div>
        </div>
      </CustomerSidebar>
    );
  }

  if (!selectedOrder) {
    // If orders exist but selection not found (defensive)
    return (
      <CustomerSidebar>
        <div style={{ padding: 40, textAlign: 'center' }}>ไม่พบออเดอร์ของคุณ</div>
      </CustomerSidebar>
    );
  }

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
  };


  if (!customerId) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>
        กรุณาเข้าสู่ระบบในฐานะลูกค้าเพื่อดูสถานะออเดอร์
      </div>
    );
  }
  return (
    <CustomerSidebar>
      <div
        style={{
          padding: '32px',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          minHeight: '100vh',
        }}
      >
        {/* Dropdown เลือก order เฉพาะ customer เดียวกัน */}
        {orders.length > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 32,
              justifyContent: 'flex-start',
              maxWidth: 520,
              paddingLeft: 8,
            }}
          >
            <label style={{ fontWeight: 600, fontSize: 16, color: '#222', minWidth: 110 }}>เลือกออเดอร์:</label>
            <Select
              value={selectedOrderId ?? undefined}
              placeholder="เลือกออเดอร์"
              onChange={(v) => handleSelectOrder(Number(v))}
              style={{ minWidth: 280, borderRadius: 12, fontSize: 15 }}
              dropdownStyle={{ borderRadius: 16, padding: 8 }}
              size="large"
            >
              {orders.map((o: any) => {
                // derive merged status for label (defensive)
                let mergedStatusForLabel = getField(o, 'status', 'Status') ?? '';
                const orderIdVal = getField(o, 'ID', 'id');
                const pickupQueue = pickupQueues.find((q) => q?.OrderID === orderIdVal || q?.OrderID === o.ID || q?.OrderID === o.id);
                if (pickupQueue && ['pickup_in_progress', 'done'].includes(pickupQueue.Status)) {
                  mergedStatusForLabel = pickupQueue.Status;
                }
                if (mergedStatusForLabel === 'รับผ้าเรียบร้อย' && pickupQueue && pickupQueue.Status === 'done') {
                  mergedStatusForLabel = 'done';
                }
                let statusLabel = mergedStatusForLabel;
                if (mergedStatusForLabel && mergedStatusForLabel in statusToStepIndex) {
                  statusLabel = statusSteps[statusToStepIndex[mergedStatusForLabel]]?.title || mergedStatusForLabel;
                }
                const created = getField(o, 'created_at', 'CreatedAt', 'createdAt');
                const optionKey = typeof orderIdVal !== 'undefined' ? String(orderIdVal) : String(o.ID ?? o.id ?? Math.random());
                const optionValue = typeof orderIdVal !== 'undefined' ? orderIdVal : o.ID ?? o.id;
                return (
                  <Option key={optionKey} value={optionValue}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar size={24} style={{ background: '#3CAEA3', fontWeight: 700 }}>
                        {String(optionKey)}
                      </Avatar>
                      <span style={{ fontWeight: 600, color: '#20639B' }}>#{optionKey}</span>
                      <span style={{ color: '#888', fontSize: 13 }}>
                        {created ? new Date(created).toLocaleString('th-TH') : optionKey}
                      </span>
                      {statusLabel && (
                        <Tag color="blue" style={{ marginLeft: 8, fontSize: 12 }}>
                          {statusLabel}
                        </Tag>
                      )}
                    </span>
                  </Option>
                );
              })}
            </Select>
          </div>
        )}

        {/* Header Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
            padding: '32px 24px 32px 24px',
            borderRadius: '20px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            maxWidth: 900,
            marginLeft: 'auto',
            marginRight: 'auto',
            boxShadow: '0 4px 24px 0 rgba(44,62,80,0.10)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              animation: 'float 6s ease-in-out infinite',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              animation: 'float 4s ease-in-out infinite reverse',
            }}
          />

          <Title
            level={2}
            style={{
              color: 'white',
              marginBottom: '16px',
              fontFamily: 'Fredoka, Arial',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            }}
          >
            🔍 ติดตามสถานะออเดอร์ของคุณ
          </Title>

          <div
            style={{
              fontSize: '1.1rem',
              opacity: 0.9,
              marginBottom: '20px',
            }}
          >
            อัปเดตล่าสุด: {currentTime.toLocaleString('th-TH')}
          </div>

          {/* Progress Overview */}
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '15px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
              maxWidth: '400px',
              margin: '0 auto',
            }}
          >
            <div style={{ marginBottom: '12px', fontSize: '1rem' }}>ความคืบหน้า: {progressPercent}%</div>
            <Progress
              percent={progressPercent}
              strokeColor={{
                '0%': '#F6D55C',
                '50%': '#3CAEA3',
                '100%': '#20639B',
              }}
              strokeWidth={8}
              trailColor="rgba(255,255,255,0.3)"
            />
          </div>
        </div>

        {/* Main Content */}
        <Row gutter={[32, 32]}>
          {/* Order Details */}
          <Col xs={24} lg={10}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
                    borderRadius: '50%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaBox color="white" size={20} />
                </div>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'Fredoka, Arial',
                  }}
                >
                  รายละเอียดออเดอร์
                </Title>
              </div>

              <div className="responsive-descriptions-wrapper">
                <Descriptions
                  items={items}
                  bordered
                  column={1}
                  size="small"
                  contentStyle={{
                    background: '#fff',
                    borderRadius: '8px',
                  }}
                  labelStyle={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    fontWeight: 600,
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* Current Status Card */}
          <Col xs={24} lg={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                background: '#fff',
                marginBottom: '24px',
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Badge.Ribbon text="สถานะปัจจุบัน" color="blue" style={{ fontSize: '0.9rem' }}>
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${statusSteps[currentStep]?.color || '#ccc'}22, ${statusSteps[currentStep]?.color || '#ccc'
                        }11)`,
                      borderRadius: '15px',
                      padding: '32px',
                      border: `2px solid ${statusSteps[currentStep]?.color || '#ccc'}33`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '4rem',
                        marginBottom: '16px',
                        color: statusSteps[currentStep]?.color || '#ccc',
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      {statusSteps[currentStep]?.icon}
                    </div>

                    <Title
                      level={3}
                      style={{
                        color: statusSteps[currentStep]?.color || '#ccc',
                        marginBottom: '8px',
                        fontFamily: 'Fredoka, Arial',
                      }}
                    >
                      {statusSteps[currentStep]?.title}
                    </Title>

                    <Text
                      style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        display: 'block',
                      }}
                    >
                      {statusSteps[currentStep]?.description}
                    </Text>

                    {currentStep < statusSteps.length - 1 && (
                      <div
                        style={{
                          marginTop: '20px',
                          padding: '12px 24px',
                          background: 'rgba(255,255,255,0.8)',
                          borderRadius: '25px',
                          fontSize: '0.95rem',
                          color: '#666',
                        }}
                      >
                        ⏰ ขั้นตอนถัดไป: {statusSteps[currentStep + 1]?.title}
                      </div>
                    )}
                  </div>
                </Badge.Ribbon>
              </div>
            </Card>

            {/* Timeline */}
            <Card
              bordered={false}
              style={{
                borderRadius: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                background: '#fff',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #F6D55C, #ED553B)',
                    borderRadius: '50%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaClock color="white" size={20} />
                </div>
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    background: 'linear-gradient(135deg, #F6D55C, #ED553B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'Fredoka, Arial',
                  }}
                >
                  ไทม์ไลน์การดำเนินการ
                </Title>
              </div>

              <Steps current={currentStep} direction="vertical" size="small" style={{ marginTop: '16px' }}>
                {statusSteps.map((step, index) => {
                  const isActive = index <= animatedStep;
                  const status = getStepStatus(index);
                  return (
                    <Step
                      key={index}
                      title={
                        <span
                          style={{
                            color:
                              status === 'finish'
                                ? step.color
                                : status === 'process'
                                  ? step.color
                                  : '#ccc',
                            fontWeight: status === 'process' ? 'bold' : 'normal',
                            fontSize: '1rem',
                          }}
                        >
                          {step.title}
                        </span>
                      }
                      description={
                        <span
                          style={{
                            color: '#666',
                            fontSize: '0.9rem',
                            opacity: isActive ? 1 : 0.5,
                          }}
                        >
                          {step.description}
                        </span>
                      }
                      status={status}
                      icon={
                        <div
                          style={{
                            color:
                              status === 'finish'
                                ? step.color
                                : status === 'process'
                                  ? step.color
                                  : '#ccc',
                            fontSize: '1.2rem',
                            transform: isActive ? 'scale(1)' : 'scale(0.8)',
                            transition: 'all 0.3s ease',
                            opacity: isActive ? 1 : 0.6,
                          }}
                        >
                          {step.icon}
                        </div>
                      }
                    />
                  );
                })}
              </Steps>
              <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 18, color: '#1890ff' }}>
                สถานะปัจจุบัน: {orderStatusLabel || '-'}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Estimated Time Card */}
        <Card
          style={{
            marginTop: '32px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #20639B, #3CAEA3)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 30px rgba(32, 99, 155, 0.3)',
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ color: 'white', margin: 0, fontFamily: 'Fredoka, Arial' }}>
                ⏱️ เวลาโดยประมาณ
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                {currentStep >= statusSteps.length - 1
                  ? 'เสร็จสิ้นแล้ว! 🎉'
                  : (() => {
                    if (currentStep <= 1) return 'อีกประมาณ 1 ชั่วโมง 30 นาที';
                    if (currentStep <= 3) return 'อีกประมาณ 1 ชั่วโมง';
                    return 'อีกประมาณ 30 นาที';
                  })()}
              </Text>
            </Col>
            <Col>
              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  padding: '16px',
                  fontSize: '2rem',
                }}
              >
                🕐
              </div>
            </Col>
          </Row>
        </Card>
      </div>

      <style>{`
        .responsive-descriptions-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .responsive-descriptions-wrapper .ant-descriptions {
          min-width: 340px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: transparent !important;
          border-color: transparent !important;
        }
        
        .ant-steps-item-process .ant-steps-item-icon {
          background-color: transparent !important;
          border-color: transparent !important;
        }
        
        .ant-steps-item-wait .ant-steps-item-icon {
          background-color: transparent !important;
          border-color: #d9d9d9 !important;
        }
      `}</style>
    </CustomerSidebar>
  );
};

export default OrderStatusPage;
