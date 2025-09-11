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
import { EmployeeService } from "../../services/Employee"; // ✅ ใช้ service (named export)

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
  id: number; // ⚠️ จาก backend จริงเป็น ID (PascalCase) แต่เราจะแปลงจาก res ให้เข้ารูปนี้
  FirstName?: string;
  LastName?: string;
  Gender?: string;
  Phone?: string;
  PositionID?: number;
  EmployeeStatus?: {
    StatusName?: string;
    StatusDescription?: string;
  };
}

const HomePage: React.FC = () => {
  const employeeId = Number(localStorage.getItem("employeeId") || 0);
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState<Employee | null>(null);

  // helper: แปลงจาก response backend -> shape ที่หน้านี้ใช้
  const normalize = (raw: any): Employee => ({
    id: raw.ID ?? raw.id ?? 0,
    FirstName: raw.FirstName ?? raw.firstName,
    LastName: raw.LastName ?? raw.lastName,
    Gender: raw.Gender ?? raw.gender,
    Phone: raw.Phone ?? raw.phone,
    PositionID: raw.PositionID ?? raw.positionID,
    EmployeeStatus: raw.EmployeeStatus ?? raw.employeeStatus,
  });

  const currentStatus: EmpStatus = useMemo(() => {
    const name = emp?.EmployeeStatus?.StatusName?.toLowerCase() as EmpStatus | undefined;
    return name || "inactive";
  }, [emp]);

  const currentDesc = useMemo(() => {
    return emp?.EmployeeStatus?.StatusDescription || STATUS_DESC[currentStatus];
  }, [emp, currentStatus]);

  // โหลดข้อมูลพนักงาน
  const fetchMe = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await EmployeeService.get(employeeId);
      setEmp(normalize(res));
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลพนักงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [employeeId]);

  // เปลี่ยนสถานะ (ใช้ PUT /employees/:id โดยคงค่า field เดิมไว้เพื่อไม่ให้โดนล้าง)
  const changeStatus = async (status: EmpStatus) => {
    if (!employeeId) {
      message.error("ไม่พบรหัสพนักงาน (employeeId)");
      return;
    }
    if (!emp) {
      message.error("ยังไม่มีข้อมูลพนักงาน");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        // คงค่าหลักไว้ (เพราะ backend จะ set ทับค่าใน PUT)
        FirstName: emp.FirstName,
        LastName: emp.LastName,
        Gender: emp.Gender,
        Phone: emp.Phone,
        PositionID: emp.PositionID,

        // เปลี่ยนเฉพาะสถานะ
        Status: status,
        StatusDescription: STATUS_DESC[status],
      };

      const updated = await EmployeeService.update(employeeId, payload);
      setEmp(normalize(updated));

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

        {/* สถานะปัจจุบัน */}
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
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => changeStatus("active")}>
                  เข้างาน
                </Button>
                <Button danger icon={<CoffeeOutlined />} onClick={() => changeStatus("onleave")}>
                  ลาพัก
                </Button>
              </div>
            </Card>
          </Col>
        </Row>

        {/* การ์ดสรุป (dummy) */}
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
