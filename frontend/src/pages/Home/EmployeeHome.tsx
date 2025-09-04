import React, { useEffect, useMemo, useState } from "react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Row, Col, Card, Typography, Button, Tag, message } from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import api from "../../lib/Employee/api";

const { Title } = Typography;

type EmpStatus = "active" | "inactive" | "onleave";

const STATUS_DESC: Record<EmpStatus, string> = {
  active: "กำลังปฎิบัติงาน",
  inactive: "ยังไม่ปฎิบัติงาน",
  onleave: "ลาพัก",
};

const STATUS_TAG: Record<EmpStatus, { color: string; text: string }> = {
  active: { color: "green", text: "ออนไลน์" },
  inactive: { color: "default", text: "ออฟไลน์" },
  onleave: { color: "orange", text: "ลาพัก" },
};

interface Employee {
  id: number;
  EmployeeStatus?: {
    StatusName?: string;
    StatusDescription?: string;
  };
}

const HomePage: React.FC = () => {
  // ดึง employeeId ของพนักงานที่ล็อกอินอยู่ (ตัวอย่างใช้ localStorage)
  const employeeId = Number(localStorage.getItem("employeeId") || 0); // TODO: ผูกกับระบบ login จริง
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState<Employee | null>(null);

  // สถานะปัจจุบัน (fallback เป็น inactive ถ้าไม่มีใน DB)
  const currentStatus: EmpStatus = useMemo(() => {
    const name = emp?.EmployeeStatus?.StatusName?.toLowerCase() as EmpStatus | undefined;
    return name || "inactive";
  }, [emp]);

  const currentDesc = useMemo(() => {
    return emp?.EmployeeStatus?.StatusDescription || STATUS_DESC[currentStatus];
  }, [emp, currentStatus]);

  // โหลดข้อมูลพนักงาน
  const fetchMe = async () => {
    if (!employeeId) return; // ป้องกันกรณีไม่มี id
    try {
      setLoading(true);
      const res = await api.get(`/employees/${employeeId}`);
      setEmp(res.data);
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลพนักงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); /* eslint-disable-next-line */}, [employeeId]);

  // เรียก API เปลี่ยนสถานะ
  const changeStatus = async (status: EmpStatus) => {
    if (!employeeId) {
      message.error("ไม่พบรหัสพนักงาน (employeeId)"); 
      return;
    }
    try {
      setLoading(true);
      const res = await api.patch(`/employees/${employeeId}/status`, { status });
      setEmp(res.data);
      if (status === "active") message.success("พนักงานเข้างานแล้ว");
      else if (status === "onleave") message.success("บันทึกลาพักเรียบร้อย");
      else message.success("อัปเดตสถานะออฟไลน์แล้ว");
    } catch (e: any) {
      console.error(e);
      message.error(e?.response?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeSidebar>
      <div style={{ padding: 20 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
          🏠 Employee Dashboard
        </Title>

        {/* แถบสถานะปัจจุบัน + ปุ่มควบคุม */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 24 }}>
          <Col xs={24} md={16} lg={12}>
            <Card
              loading={loading}
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
              title="สถานะการทำงานของคุณ"
              extra={<Tag color={STATUS_TAG[currentStatus].color}>{STATUS_TAG[currentStatus].text}</Tag>}
            >
              <div style={{ fontSize: 16, marginBottom: 16 }}>
                รายละเอียด: <b>{currentDesc}</b>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => changeStatus("active")}
                >
                  เข้างาน
                </Button>
                <Button
                  danger
                  icon={<CoffeeOutlined />}
                  onClick={() => changeStatus("onleave")}
                >
                  ลาพัก
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* การ์ดสรุป (ตัวเลขสมมุติ) */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="รอดำเนินการ" bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <ClockCircleOutlined style={{ fontSize: 40, color: "#faad14" }} />
              <p style={{ marginTop: 10, fontSize: 16 }}>12 Orders</p>
              <Button type="primary" block style={{ marginTop: 10 }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="กำลังซัก" bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <SyncOutlined spin style={{ fontSize: 40, color: "#1890ff" }} />
              <p style={{ marginTop: 10, fontSize: 16 }}>8 Orders</p>
              <Button type="primary" block style={{ marginTop: 10 }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="รอจัดส่ง" bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <CarOutlined style={{ fontSize: 40, color: "#722ed1" }} />
              <p style={{ marginTop: 10, fontSize: 16 }}>5 Orders</p>
              <Button type="primary" block style={{ marginTop: 10 }}>
                ดูรายละเอียด
              </Button>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card title="เสร็จสิ้น" bordered={false} style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              <CheckCircleOutlined style={{ fontSize: 40, color: "#52c41a" }} />
              <p style={{ marginTop: 10, fontSize: 16 }}>20 Orders</p>
              <Button type="primary" block style={{ marginTop: 10 }}>
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
