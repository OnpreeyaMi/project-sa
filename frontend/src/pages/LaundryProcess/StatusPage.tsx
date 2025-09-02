import React from 'react';
import { Card, Steps, Descriptions, Typography, Divider } from 'antd';
import type { DescriptionsProps } from 'antd';
import CustomerSidebar from "../../component/layout/Sidebar/CusSidebar";

const { Step } = Steps;
const { Title, Text } = Typography;

const OrderStatusPage: React.FC = () => {
  const orderStatus = 'กำลังอบ'; // ดึงจาก backend จริงในอนาคต

  const statusSteps = [
    'กำลังไปรับผ้า',
    'รับผ้าเรียบร้อย',
    'รอดำเนินการ',
    'กำลังซัก',
    'กำลังอบ',
    'เสร็จสิ้น',
    'กำลังจัดส่ง',
    'จัดส่งเรียบร้อยแล้ว',
  ];

  const currentStep = statusSteps.indexOf(orderStatus);

  const items: DescriptionsProps['items'] = [
    {
      key: '1',
      label: 'ชื่อลูกค้า',
      children: <Text strong>ใจดี สมใจ</Text>,
    },
    {
      key: '2',
      label: 'หมายเลขออเดอร์',
      children: <Text code>ORD-20250808-001</Text>,
    },
    {
      key: '3',
      label: 'วันที่สั่ง',
      children: '08/08/2025',
    },
    {
      key: '4',
      label: 'ที่อยู่',
      children: '123 หมู่ 4 ต.เมือง จ.เชียงใหม่',
    },
    {
      key: '5',
      label: 'รายการซัก',
      children: 'เสื้อ 5 ตัว, กางเกง 3 ตัว',
    },
  ];

  return (
    <CustomerSidebar>
      <div style={{ padding: '24px' }}>
        <Title level={3} style={{ marginBottom: '16px', color: '#0E4587' }}>
          ติดตามสถานะออเดอร์ของคุณ
        </Title>

        <Card
          bordered={false}
          style={{
            background: '#fafafa',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <Descriptions
            title={<Title level={5}>รายละเอียดออเดอร์</Title>}
            items={items}
            bordered
            column={1}
            style={{ marginBottom: '32px' }}
          />

          <Divider orientation="left">สถานะออเดอร์</Divider>

          <Steps
            current={currentStep}
            progressDot
            responsive
            direction="horizontal"
            style={{ marginTop: '16px' }}
          >
            {statusSteps.map((step, index) => (
              <Step
                key={index}
                title={step}
                status={index < currentStep ? 'finish' : index === currentStep ? 'process' : 'wait'}
              />
            ))}
          </Steps>
        </Card>
      </div>
    </CustomerSidebar>
  );
};

export default OrderStatusPage;
