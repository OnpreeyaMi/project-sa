import React from "react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Row, Col, Card, Typography, Button } from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const HomePage: React.FC = () => {
  return (
    <EmployeeSidebar>
      <div style={{ padding: "20px" }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "30px" }}>
          🏠 Employee Dashboard
        </Title>

        <Row gutter={[24, 24]} justify="center">
          {/* รอดำเนินการ */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              title="รอดำเนินการ"
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <ClockCircleOutlined style={{ fontSize: "40px", color: "#faad14" }} />
              <p style={{ marginTop: "10px", fontSize: "16px" }}>12 Orders</p>
              <Button type="primary" block style={{ marginTop: "10px" }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          {/* กำลังซัก */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              title="กำลังซัก"
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <SyncOutlined spin style={{ fontSize: "40px", color: "#1890ff" }} />
              <p style={{ marginTop: "10px", fontSize: "16px" }}>8 Orders</p>
              <Button type="primary" block style={{ marginTop: "10px" }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          {/* รอจัดส่ง */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              title="รอจัดส่ง"
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <CarOutlined style={{ fontSize: "40px", color: "#722ed1" }} />
              <p style={{ marginTop: "10px", fontSize: "16px" }}>5 Orders</p>
              <Button type="primary" block style={{ marginTop: "10px" }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          {/* เสร็จสิ้น */}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              title="เสร็จสิ้น"
              bordered={false}
              style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            >
              <CheckCircleOutlined style={{ fontSize: "40px", color: "#52c41a" }} />
              <p style={{ marginTop: "10px", fontSize: "16px" }}>20 Orders</p>
              <Button type="primary" block style={{ marginTop: "10px" }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </EmployeeSidebar>
  );
};

export default HomePage;
