import React from "react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Row, Col, Card } from "antd";
const HomePage: React.FC = () => {
  return (
    <EmployeeSidebar>
      <h1 style={ { textAlign: "center", marginTop: "20px"}}>Employee Home Page</h1>

      <Row gutter={[16, 16]} justify="center" >
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card title="Card 1" bordered={false}>
           <p>Card content</p> 
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card title="Card 2" bordered={false}>
            Card content
          </Card>
        </Col>
      </Row>
    </EmployeeSidebar>
  );
};

export default HomePage;