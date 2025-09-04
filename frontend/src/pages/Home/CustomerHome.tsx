import React from "react";
import { Row, Col, Typography, Button, Card } from "antd";
import CustomerSidebar from "../../component/layout/customer/CusSidebar";
import dashboardImg from "../../assets/dashboard.png";
import washingImg from "../../assets/washing.jpg";

const { Title, Paragraph } = Typography;

const CustomerHome: React.FC = () => {
  return (
    <CustomerSidebar>
      {/* Hero Section */}
      <div style={{ position: "relative", width: "100%", height: "100vh" }}>
        {/* Background Image */}
        <img
          src={dashboardImg}
          alt="Laundry Hero"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(99%)",
          }}
        />

        {/* Overlay ข้อความ + ปุ่ม */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            color: "#fff",
            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
            maxWidth: "80%",
          }}
        >
          <Title level={1} style={{ color: "#072448ff", fontSize: "74px", fontWeight: "bold" }}>
            Laundry Pickup & Delivery
          </Title>
          <Paragraph style={{ color: "#072448ff", fontSize: 20, marginBottom: 12 }}>
            บริการซักอบที่สะดวก รวดเร็ว และน่าเชื่อถือ ถึงบ้านคุณด้วยราคาที่คุ้มค่า
          </Paragraph>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "60px 20px" }}>
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={12}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Title level={3} style={{ marginBottom: 12, fontSize: 42 }}>Laundry Service</Title>
              <Paragraph style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>
                NEATII ให้บริการซักอบที่ครบวงจร ตั้งแต่การรับผ้าถึงบ้านคุณ ไปจนถึงการส่งคืนที่สะดวกสบาย
                ด้วยทีมงานมืออาชีพและเทคโนโลยีที่ทันสมัย เรามุ่งมั่นที่จะทำให้เสื้อผ้าของคุณสะอาด สดใส และพร้อมใช้งานเสมอ
                เปิดประสบการณ์ใหม่ในการดูแลเสื้อผ้าของคุณกับ NEATII วันนี้!
              </Paragraph>
              <Button type="primary" size="middle">
                Learn More
              </Button>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <img
              src={washingImg}
              alt="Service Example"
              style={{
                width: "100%",
                borderRadius: 12,
                objectFit: "cover",
                height: "100%",
              }}
            />
          </Col>
        </Row>
      </div>
    </CustomerSidebar>
  );
};

export default CustomerHome;
