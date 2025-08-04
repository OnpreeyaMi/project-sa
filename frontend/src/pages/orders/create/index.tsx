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
import CustomerSidebar from "../../../component/layout/customer/CusSidebar";

const { Title, Text } = Typography;

const OrderPage: React.FC = () => {
  return (
    <CustomerSidebar>
      <Row gutter={[16, 16]} justify="center">
        {/* ซ้าย: รายการออเดอร์ */}
        <Col xs={24} lg={14}>
          {/*<Card
            style={{
              borderRadius: 10,
              height: "100%",
              
            }}
          >*/}
            <Title level={4}>เลือกถังอบที่ต้องการ</Title>

            {/* น้ำหนักผ้า */}
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }} justify="center">
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
                    <Image preview={false} src="/iconWashing.png" height={50} />
                    <Text >{kg} KG</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* ถังอบ */}
            <Title level={4}>เลือกถังอบที่ต้องการ</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 30 }} justify="center">
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

            {/* น้ำยาซักผ้า */}
            <Title level={4}>เลือกน้ำยาซักผ้าที่ต้องการ</Title>
            <Row gutter={[16, 16]} justify="center">
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
          {/*</Card>*/}
        </Col>

        {/* ขวา: ฟอร์มสร้างออเดอร์ */}
        <Col xs={24} lg={10}>
          <Card style={{ borderRadius: 10 }}>
            <Title level={4}>สร้างออเดอร์</Title>
            <Divider />

            {/* ที่อยู่ */}
            <Title level={5}>ที่อยู่</Title>
            <Radio.Group style={{ display: "block", marginBottom: 15 }}>
              <Radio value={1}>ที่อยู่เดิม บ้านในเมือง</Radio>
              <Radio value={2}>เลือกที่อยู่ใหม่ บ้านใหม่</Radio>
            </Radio.Group>

            {/* รูปภาพ */}
            <Title level={5}>รูปภาพ</Title>
            <Upload listType="picture-card" maxCount={1}>
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>อัปโหลด</div>
              </div>
            </Upload>

            {/* หมายเหตุ */}
            <Title level={5}>หมายเหตุ</Title>
            <Input.TextArea
              placeholder="หมายเหตุ"
              rows={2}
              style={{ marginBottom: 20 }}
            />

            {/* ปุ่มยืนยัน */}
            <Button type="primary" block style={{ height: 40, fontSize: 16 }}>
              ยืนยัน
            </Button>
          </Card>
        </Col>
      </Row>
    </CustomerSidebar>
  );
};

export default OrderPage;
