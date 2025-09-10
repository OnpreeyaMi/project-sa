import React, { useState, useEffect } from 'react';
import { Card, Steps, Descriptions, Typography, Row, Col, Tag, Progress, Badge } from 'antd';
import type { DescriptionsProps } from 'antd';
import type { Order, LaundryProcess } from '../../services/orderdetailService';
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
  FaBox
} from 'react-icons/fa';
import CustomerSidebar from "../../component/layout/customer/CusSidebar";

const { Step } = Steps;
const { Title, Text } = Typography;

const OrderStatusPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animatedStep, setAnimatedStep] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // สมมติ customerId เก็บใน localStorage (หรือ session storage)
  let customerId = localStorage.getItem('customerId');
  if (!customerId) {
    customerId = '1'; // mock customer id
  }

  // ดึง order ทั้งหมดของลูกค้า
  // ดึง order ทั้งหมดของ customerId (refresh ทุก 10 วินาที)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fetchOrders = () => {
      setLoading(true);
      fetch(`http://localhost:8000/ordersdetails`)
        .then(res => {
          if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลออเดอร์ได้');
          return res.json();
        })
        .then((data) => {
          const allOrders = Array.isArray(data) ? data : (data.data || []);
          setOrders(allOrders);
          // auto select order ล่าสุด ถ้ายังไม่ได้เลือก
          if (allOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(allOrders[allOrders.length-1].ID);
          }
          setError(null);
        })
        .catch(err => {
          setError(err.message);
          setOrders([]);
        })
        .finally(() => setLoading(false));
    };
    fetchOrders();
    timer = setInterval(fetchOrders, 10000); // refresh ทุก 10 วินาที
    return () => clearInterval(timer);
  }, [customerId, selectedOrderId]);

  const statusSteps = [
    { 
      title: 'กำลังไปรับผ้า', 
      icon: <FaTruck />,
      color: '#F6D55C',
      description: 'พนักงานกำลังเดินทางไปรับผ้า'
    },
    { 
      title: 'รับผ้าเรียบร้อย', 
      icon: <FaCheckCircle />,
      color: '#3CAEA3',
      description: 'รับผ้าจากลูกค้าเรียบร้อยแล้ว'
    },
    { 
      title: 'รอดำเนินการ', 
      icon: <FaClock />,
      color: '#ED553B',
      description: 'ผ้าอยู่ในคิวรอการดำเนินการ'
    },
    { 
      title: 'กำลังซัก', 
      icon: <FaSoap />,
      color: '#20639B',
      description: 'กำลังซักผ้าด้วยความระมัดระวัง'
    },
    { 
      title: 'กำลังอบ', 
      icon: <FaTshirt />,
      color: '#0E4587',
      description: 'อบผ้าด้วยระบบถนอมใยผ้า'
    },
    { 
      title: 'เสร็จสิ้น', 
      icon: <FaFlag />,
      color: '#28a745',
      description: 'ซักอบเสร็จสิ้น พร้อมจัดส่ง'
    },
    { 
      title: 'กำลังจัดส่ง', 
      icon: <FaShippingFast />,
      color: '#FF6B6B',
      description: 'พนักงานกำลังจัดส่งผ้า'
    },
    { 
      title: 'จัดส่งเรียบร้อยแล้ว', 
      icon: <FaHome />,
      color: '#4ECDC4',
      description: 'ส่งผ้าถึงลูกค้าเรียบร้อยแล้ว'
    },
  ];

  // เลือก order ที่ต้องการแสดง (ล่าสุด/แรกสุด/เลือกได้)
  const selectedOrder = orders.find(o => o.ID === selectedOrderId) || (orders.length > 0 ? orders[orders.length-1] : null);
  // หา customer_id ของ order ที่เลือก (หรือใช้ order ล่าสุด)
  const selectedCustomerId = selectedOrder ? selectedOrder.customer_id : null;
  // filter orders ที่ customer_id เดียวกัน
  const sameCustomerOrders = selectedCustomerId
    ? orders.filter(o => o.customer_id === selectedCustomerId)
    : orders;
  // Map สถานะจริงจาก LaundryProcesses และ Queue ของ order
  // 1. รอดำเนินการ (LaundryProcess.status)
  // 2. กำลังไปรับผ้า (Queue.status == pickup_in_progress)
  // 3. รับผ้าเรียบร้อย (Queue.status == done)
  // 4. กำลังซัก (LaundryProcess.status)
  // 5. กำลังอบ (LaundryProcess.status)
  // 6. เสร็จสิ้น (LaundryProcess.status)
  // 7. กำลังจัดส่ง (Queue.status == delivery_in_progress)
  // 8. จัดส่งเรียบร้อย (Queue.status == delivered)

  // Helper: หา Queue ตาม type
  const getQueueByType = (type: string) => {
    if (!selectedOrder || !('Queues' in selectedOrder)) return undefined;
    const queues = (selectedOrder as any).Queues as any[];
    if (!Array.isArray(queues)) return undefined;
    return queues.find(q => q.Queue_type === type);
  };

  // Helper: หา LaundryProcess ล่าสุด
  const getLastLaundryProcess = () => {
    if (!selectedOrder || !selectedOrder.LaundryProcesses || selectedOrder.LaundryProcesses.length === 0) return undefined;
    return selectedOrder.LaundryProcesses[selectedOrder.LaundryProcesses.length - 1];
  };

  // Map สถานะปัจจุบัน
  let currentStep = 0;
  let orderStatus = '';
  const lastProcess = getLastLaundryProcess();
  const pickupQueue = getQueueByType('pickup');
  const deliveryQueue = getQueueByType('delivery');

  // เช็คสถานะจากขั้นสูงสุดไปต่ำสุด
  if (deliveryQueue && deliveryQueue.Status === 'delivered') {
    currentStep = 7; orderStatus = 'จัดส่งเรียบร้อยแล้ว';
  } else if (deliveryQueue && deliveryQueue.Status === 'delivery_in_progress') {
    currentStep = 6; orderStatus = 'กำลังจัดส่ง';
  } else if (lastProcess && lastProcess.Status === 'เสร็จสิ้น') {
    currentStep = 5; orderStatus = 'เสร็จสิ้น';
  } else if (lastProcess && lastProcess.Status === 'กำลังอบ') {
    currentStep = 4; orderStatus = 'กำลังอบ';
  } else if (lastProcess && lastProcess.Status === 'กำลังซัก') {
    currentStep = 3; orderStatus = 'กำลังซัก';
  } else if (pickupQueue && pickupQueue.Status === 'done') {
    currentStep = 2; orderStatus = 'รับผ้าเรียบร้อย';
  } else if (pickupQueue && pickupQueue.Status === 'pickup_in_progress') {
    currentStep = 1; orderStatus = 'กำลังไปรับผ้า';
  } else if (lastProcess && lastProcess.Status === 'รอดำเนินการ') {
    currentStep = 2; orderStatus = 'รอดำเนินการ';
  }

  const progressPercent = Math.round((currentStep >= 0 ? currentStep : 0) / (statusSteps.length - 1) * 100);

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

  const items: DescriptionsProps['items'] = selectedOrder ? [
    {
      key: '1',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666' }}>
          <FaUser color="#0E4587" />
          ชื่อลูกค้า
        </span>
      ),
  children: <Text strong style={{ color: '#0E4587', fontSize: '1.1rem' }}>{selectedOrder.Customer ? `${selectedOrder.Customer.FirstName} ${selectedOrder.Customer.LastName}` : '-'}</Text>,
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
            fontWeight: 'bold'
          }}
        >
          {selectedOrder.ID}
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
            const dateStr = (selectedOrder as any)?.created_at || (selectedOrder as any)?.CreatedAt;
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
          {selectedOrder.Address?.AddressDetails ?? '-'}
          <br />
          <Text type="secondary" style={{ fontSize: '0.9rem' }}>
            📞 {selectedOrder.Customer?.PhoneNumber ?? '-'}
          </Text>
        </div>
      ),
    },
    // รายการซัก: เพิ่มเองถ้ามีข้อมูลใน latestOrder
  ] : [];

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!selectedOrder) return <div style={{ padding: 40, textAlign: 'center' }}>ไม่พบออเดอร์ของคุณ</div>;
  // UI: เลือก order ที่ต้องการแสดง (dropdown)
  const handleSelectOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrderId(Number(e.target.value));
  };


  return (
    <CustomerSidebar>
      <div style={{ 
        padding: '32px', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: '100vh'
      }}>
        {/* Dropdown เลือก order เฉพาะ customer เดียวกัน */}
        {sameCustomerOrders.length > 1 && (
          <div style={{ marginBottom: 24, textAlign: 'right' }}>
            <label style={{ marginRight: 8, fontWeight: 600 }}>เลือกออเดอร์:</label>
            <select value={selectedOrderId ?? ''} onChange={handleSelectOrder} style={{ padding: 6, borderRadius: 8, minWidth: 120 }}>
              {sameCustomerOrders.map((o) => (
                <option key={o.ID} value={o.ID}>
                  #{o.ID} | {o.created_at ? new Date(o.created_at).toLocaleString('th-TH') : o.ID}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Header Section */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
          padding: '32px',
          borderRadius: '20px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated background elements */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 6s ease-in-out infinite'
          }} />
          
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            animation: 'float 4s ease-in-out infinite reverse'
          }} />

          <Title level={2} style={{ 
            color: 'white', 
            marginBottom: '16px',
            fontFamily: 'Fredoka, Arial',
            fontWeight: 800,
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
          }}>
            🔍 ติดตามสถานะออเดอร์ของคุณ
          </Title>
          
          <div style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9,
            marginBottom: '20px'
          }}>
            อัปเดตล่าสุด: {currentTime.toLocaleString('th-TH')}
          </div>

          {/* Progress Overview */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '15px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ marginBottom: '12px', fontSize: '1rem' }}>
              ความคืบหน้า: {progressPercent}%
            </div>
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
                  borderRadius: '50%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaBox color="white" size={20} />
                </div>
                <Title level={4} style={{ 
                  margin: 0,
                  background: 'linear-gradient(135deg, #0E4587, #3CAEA3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Fredoka, Arial'
                }}>
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
                    borderRadius: '8px'
                  }}
                  labelStyle={{
                    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                    fontWeight: 600
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
                marginBottom: '24px'
              }}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Badge.Ribbon 
                  text="สถานะปัจจุบัน" 
                  color="blue"
                  style={{ fontSize: '0.9rem' }}
                >
                  <div style={{
                    background: `linear-gradient(135deg, ${statusSteps[currentStep]?.color || '#ccc'}22, ${statusSteps[currentStep]?.color || '#ccc'}11)`,
                    borderRadius: '15px',
                    padding: '32px',
                    border: `2px solid ${statusSteps[currentStep]?.color || '#ccc'}33`
                  }}>
                    <div style={{
                      fontSize: '4rem',
                      marginBottom: '16px',
                      color: statusSteps[currentStep]?.color || '#ccc',
                      animation: 'pulse 2s infinite'
                    }}>
                      {statusSteps[currentStep]?.icon}
                    </div>
                    
                    <Title level={3} style={{ 
                      color: statusSteps[currentStep]?.color || '#ccc',
                      marginBottom: '8px',
                      fontFamily: 'Fredoka, Arial'
                    }}>
                      {statusSteps[currentStep]?.title}
                    </Title>
                    
                    <Text style={{ 
                      fontSize: '1.1rem', 
                      color: '#666',
                      display: 'block'
                    }}>
                      {statusSteps[currentStep]?.description}
                    </Text>

                    {currentStep < statusSteps.length - 1 && (
                      <div style={{ 
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: '25px',
                        fontSize: '0.95rem',
                        color: '#666'
                      }}>
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
                background: '#fff'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #F6D55C, #ED553B)',
                  borderRadius: '50%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaClock color="white" size={20} />
                </div>
                <Title level={4} style={{ 
                  margin: 0,
                  background: 'linear-gradient(135deg, #F6D55C, #ED553B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Fredoka, Arial'
                }}>
                  ไทม์ไลน์การดำเนินการ
                </Title>
              </div>

              <Steps
                current={currentStep}
                direction="vertical"
                size="small"
                style={{ marginTop: '16px' }}
              >
                {statusSteps.map((step, index) => {
                  const isActive = index <= animatedStep;
                  const status = getStepStatus(index);
                  return (
                    <Step
                      key={index}
                      title={
                        <span style={{ 
                          color: status === 'finish' ? step.color : 
                                status === 'process' ? step.color : '#ccc',
                          fontWeight: status === 'process' ? 'bold' : 'normal',
                          fontSize: '1rem'
                        }}>
                          {step.title}
                        </span>
                      }
                      description={
                        <span style={{ 
                          color: '#666',
                          fontSize: '0.9rem',
                          opacity: isActive ? 1 : 0.5
                        }}>
                          {step.description}
                        </span>
                      }
                      status={status}
                      icon={
                        <div style={{
                          color: status === 'finish' ? step.color : 
                                status === 'process' ? step.color : '#ccc',
                          fontSize: '1.2rem',
                          transform: isActive ? 'scale(1)' : 'scale(0.8)',
                          transition: 'all 0.3s ease',
                          opacity: isActive ? 1 : 0.6
                        }}>
                          {step.icon}
                        </div>
                      }
                    />
                  );
                })}
              </Steps>
              <div style={{ marginTop: 16, fontWeight: 'bold', fontSize: 18, color: '#1890ff' }}>
                สถานะปัจจุบัน: {orderStatus || '-'}
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
            boxShadow: '0 10px 30px rgba(32, 99, 155, 0.3)'
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={4} style={{ color: 'white', margin: 0, fontFamily: 'Fredoka, Arial' }}>
                ⏱️ เวลาโดยประมาณ
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                {currentStep >= statusSteps.length - 1 ? 'เสร็จสิ้นแล้ว! 🎉' : `อีกประมาณ ${Math.max(1, 3 - Math.floor(currentStep / 2))} ชั่วโมง`}
              </Text>
            </Col>
            <Col>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                padding: '16px',
                fontSize: '2rem'
              }}>
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