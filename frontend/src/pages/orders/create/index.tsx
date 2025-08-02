import React from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Upload,
  Input,
  Radio,
  Typography,
  Divider,
  Image,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import "./OrderPage.css"; // ดึง CSS ออกมาแยกไฟล์

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/logo.png" alt="Logo" width={50} />
        </div>
        <ul className="menu">
          <li>หน้าหลัก</li>
          <li className="active">ซัก-อบ</li>
          <li>ชำระเงิน</li>
          <li>สถานะ</li>
          <li>ประวัติ</li>
          <li>แจ้งข้อร้องเรียน</li>
          <li>โปรไฟล์</li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="grid-container">
          {/* ฝั่งซ้าย */}
          <Card style={{ borderRadius: 10, height: "100%" }}>
            <Title level={4}>เลือกถังซักที่ต้องการ</Title>
            <Row gutter={[20, 20]} justify={"center"} style={{ marginBottom: 30 }}>
              {[10, 14, 18, 28].map((kg,index) => (
                <Col key={index} xs={12} sm={12} md={6} lg={6}>
                  <Card
                    hoverable
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderRadius: 8,
                      background: "#F9FBFF",
                      position: "relative",
                    }}
                  >
                    <Image preview={false} src="/wash.png" height={100} />
                    
                    <Text style={{ display: "block", marginTop: 30 }}>{kg} KG</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <Title level={4}>เลือกถังอบที่ต้องการ</Title>
            <Row gutter={[20, 20]} justify={"center"} style={{ marginBottom: 30 }}>
              <Col>
                <Card
                  hoverable
                  style={{
                    width: 150,
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#FFF5F5",
                    position: "relative",
                    height : 200,
                    display: "flex",          // เปิด Flexbox
                    alignItems: "center",     // จัดแนวตั้งตรงกลาง
                    justifyContent: "center", // จัดแนวนอนตรงกลาง
                  }}
                >
                  <Text type="danger" >NO</Text>
                </Card>
              </Col>
              {[14, 25].map((kg,index) => (
                <Col key={index} xs={12} sm={12} md={6} lg={6}>
                  <Card
                    hoverable
                    style={{
                      width: "100%",
                      textAlign: "center",
                      borderRadius: 8,
                      background: "#F9FBFF",
                    }}
                  >
                    <Image preview={false} src="/dry.png" height={100} />
                    <Text style={{ display: "block", marginTop: 30 }}>{kg} KG</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <Title level={4}>เลือกน้ำยาซักผ้าที่ต้องการ</Title>
            <Row gutter={[16, 16]}>
              <Col>
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#F9FBFF",
                    position: "relative",
                  }}
                >
                  <Image preview={false} src="/detergent1.png" height={100} />
                  <Text>ของลูกค้า</Text>
                </Card>
              </Col>
              <Col>
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#F9FBFF",
                  }}
                >
                  <Image preview={false} src="/detergent2.png" height={100} />
                  <Text>ทางร้าน</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* ฝั่งขวา */}
          <Card style={{ borderRadius: 10 }}>
            <Title level={4} style={{ textAlign: "center" }}>สร้างออเดอร์</Title>
            <Divider />
            <Title level={5} style={{marginBlock: 15}}>ที่อยู่</Title>
            <Radio.Group style={{ display: "block", marginBottom: 20 }}>
              <li><Radio value={1} style={{marginBlock: 5}}>ที่อยู่เดิม บ้านในเมือง</Radio></li>
              <li><Radio value={2}>เลือกที่อยู่ใหม่ บ้านใหม่</Radio></li>
            </Radio.Group>

            <Title level={5} style={{marginBottom: 15}}>รูปภาพ</Title>
            <Upload listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 10 }}>อัปโหลด</div>
              </div>
            </Upload>

            <Title level={5} style={{marginBottom: 15}}>หมายเหตุ</Title>
            <Input.TextArea
              placeholder="หมายเหตุ"
              rows={2}
              style={{ marginBottom: 50 }}
            />

            <Button type="primary" block style={{ height: 40, fontSize: 16 }}>
              ยืนยัน
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default OrderPage;
