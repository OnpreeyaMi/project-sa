import React from "react";
import {///เผื่อทำไม่ได้
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

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#FFFFFF" }}>
      {/* Sidebar */}
      <div
        style={{
          width: 180,
          background: "#0E4587",
          paddingTop: 30,
          color: "#fff",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img src="/logo.png" alt="Logo" width={50} />
        </div>
        <ul style={{ listStyle: "none", padding: 0, fontSize: 16 }}>
          <li style={{ padding: "12px 20px" }}>หน้าหลัก</li>
          <li style={{ padding: "12px 20px", background: "#FFFFFF",color: "#6DA3D3"}}>
            ซัก-อบ 
          </li>
          <li style={{ padding: "12px 20px" }}>ชำระเงิน</li>
          <li style={{ padding: "12px 20px" }}>สถานะ</li>
          <li style={{ padding: "12px 20px" }}>ประวัติ</li>
          <li style={{ padding: "12px 20px" }}>แจ้งข้อร้องเรียน</li>
          <li style={{ padding: "12px 20px" }}>โปรไฟล์</li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            height: "100%",
          }}
        >
          {/* ฝั่งซ้าย - เลือกเครื่อง/น้ำยา */}
          <Card style={{ borderRadius: 10, height: "100%" }}>
            <Title level={4}>เลือกถังซักที่ต้องการ</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
              {[10, 14, 18, 28].map((kg) => (
                <Col key={kg}>
                  <Card
                    hoverable
                    style={{
                      width: 90,
                      textAlign: "center",
                      borderRadius: 8,
                      background: "#F9FBFF",
                    }}
                  >
                    <Image preview={false} src="/wash.png" height={50} />
                    <Text>{kg} KG</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <Title level={4}>เลือกถังอบที่ต้องการ</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }}>
              <Col>
                <Card
                  hoverable
                  style={{
                    width: 90,
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#FFF5F5",
                  }}
                >
                  <Text type="danger">NO</Text>
                </Card>
              </Col>
              {[14, 25].map((kg) => (
                <Col key={kg}>
                  <Card
                    hoverable
                    style={{
                      width: 90,
                      textAlign: "center",
                      borderRadius: 8,
                      background: "#F9FBFF",
                    }}
                  >
                    <Image preview={false} src="/dry.png" height={50} />
                    <Text>{kg} KG</Text>
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
                    width: 90,
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#F9FBFF",
                  }}
                >
                  <Image preview={false} src="/detergent1.png" height={50} />
                  <Text>น้ำเปล่า</Text>
                </Card>
              </Col>
              <Col>
                <Card
                  hoverable
                  style={{
                    width: 90,
                    textAlign: "center",
                    borderRadius: 8,
                    background: "#F9FBFF",
                  }}
                >
                  <Image preview={false} src="/detergent2.png" height={50} />
                  <Text>ทางร้าน</Text>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* ฝั่งขวา - ฟอร์มสร้างออเดอร์ */}
          <Card style={{ borderRadius: 10 }}>
            <Title level={4}>สร้างออเดอร์</Title>
            <Divider />
            <Title level={5}>ที่อยู่</Title>
            <Radio.Group style={{ display: "block", marginBottom: 15 }}>
              <Radio value={1}>ที่อยู่เดิม บ้านในเมือง</Radio>
              <Radio value={2}>เลือกที่อยู่ใหม่ บ้านใหม่</Radio>
            </Radio.Group>

            <Title level={5}>รูปภาพ</Title>
            <Upload listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>อัปโหลด</div>
              </div>
            </Upload>

            <Title level={5}>หมายเหตุ</Title>
            <Input.TextArea
              placeholder="หมายเหตุ"
              rows={2}
              style={{ marginBottom: 20 }}
            />

            <Button type="primary" block style={{ height: 40, fontSize: 16 }}>
              ยืนยัน
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
