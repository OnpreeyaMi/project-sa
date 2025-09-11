// src/pages/Home/EmployeeHome.tsx
import React, { useEffect, useMemo, useState } from "react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Row, Col, Card, Typography, Button, Tag, message, Space } from "antd";
import {
  ClockCircleOutlined,
  SyncOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CoffeeOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { EmployeeService } from "../../services/Employee";

const { Title, Text } = Typography;

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
  FirstName?: string;
  LastName?: string;
  Gender?: string;
  Phone?: string;
  PositionID?: number;
  Position?: { ID: number; PositionName: string };
  User?: { ID?: number; Email?: string };
  EmployeeStatus?: {
    StatusName?: string;
    StatusDescription?: string;
  };
}

const EmployeeHome: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState<Employee | null>(null);

  const token = localStorage.getItem("token") || "";
  const employeeId = Number(localStorage.getItem("employeeId") || 0);

  // ---- helpers ----
  const normalize = (raw: any): Employee => ({
    id: raw?.ID ?? raw?.id ?? 0,
    FirstName: raw?.FirstName ?? raw?.firstName,
    LastName: raw?.LastName ?? raw?.lastName,
    Gender: raw?.Gender ?? raw?.gender,
    Phone: raw?.Phone ?? raw?.phone,
    PositionID: raw?.PositionID ?? raw?.positionID,
    Position: raw?.Position
      ? { ID: raw.Position.ID ?? raw.Position.id, PositionName: raw.Position.PositionName ?? raw.Position.positionName }
      : undefined,
    User: raw?.User ? { ID: raw.User.ID ?? raw.User.id, Email: raw.User.Email ?? raw.User.email } : undefined,
    EmployeeStatus: raw?.EmployeeStatus ?? raw?.employeeStatus,
  });

  const fullName = useMemo(
    () => `${emp?.FirstName || ""} ${emp?.LastName || ""}`.trim(),
    [emp?.FirstName, emp?.LastName]
  );

  const currentStatus: EmpStatus = useMemo(() => {
    const name = emp?.EmployeeStatus?.StatusName?.toLowerCase() as EmpStatus | undefined;
    return (name && ["active", "inactive", "onleave"].includes(name)) ? name : "inactive";
  }, [emp]);

  const currentDesc = useMemo(
    () => emp?.EmployeeStatus?.StatusDescription || STATUS_DESC[currentStatus],
    [emp, currentStatus]
  );

  const currentTag = STATUS_TAG[currentStatus];

  // ---- load profile ----
  const fetchMe = async () => {
    try {
      setLoading(true);

      // มี employeeId ก็โหลด /employees/:id
      if (employeeId) {
        const res = await EmployeeService.get(employeeId);
        setEmp(normalize(res));
        return;
      }

      // fallback: ลอง /employee/me (ต้องมี token)
      if (token) {
        const r = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/employee/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const me = await r.json();
          setEmp(normalize(me));
          // เก็บ employeeId ไว้ใช้ครั้งถัดไป
          if (me?.ID) localStorage.setItem("employeeId", String(me.ID));
          return;
        }
      }

      message.warning("ไม่พบรหัสพนักงาน (employeeId)");
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลพนักงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, token]);

  // ---- change status ----
  const changeStatus = async (status: EmpStatus) => {
    if (!emp?.id) return message.error("ยังไม่มีข้อมูลพนักงาน");

    try {
      setLoading(true);
      const payload = {
        // คงค่าเดิมเพื่อไม่ให้ฟิลด์อื่นหายเวลา PUT
        FirstName: emp.FirstName,
        LastName: emp.LastName,
        Gender: emp.Gender,
        Phone: emp.Phone,
        PositionID: emp.PositionID,
        // เปลี่ยนเฉพาะสถานะ
        Status: status,
        StatusDescription: STATUS_DESC[status],
      };
      const updated = await EmployeeService.update(emp.id, payload);
      setEmp(normalize(updated));

      if (status === "active") message.success("พนักงานเข้างานแล้ว");
      else if (status === "onleave") message.success("บันทึกลาพักเรียบร้อย");
      else message.success("ออกงานเรียบร้อย");
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
        <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
          🏠 Employee Dashboard
        </Title>

        {/* Header: ชื่อ/อีเมล/สถานะ */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: 16 }}>
          <Col xs={24} md={18} lg={14}>
            <Card
              loading={loading}
              style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
            >
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Space align="center" size="middle" style={{ justifyContent: "space-between", width: "100%" }}>
                  <Space size="large" align="center">
                    <UserOutlined />
                    <Text strong>{fullName || "-"}</Text>
                  </Space>
                  <Tag color={currentTag.color}>{currentTag.text}</Tag>
                </Space>
                <Space size="large" align="center">
                  <MailOutlined />
                  <Text type="secondary">{emp?.User?.Email || "-"}</Text>
                </Space>
                <Text>รายละเอียดสถานะ: <b>{currentDesc}</b></Text>
                <Space wrap style={{ marginTop: 8 }}>
                  <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => changeStatus("active")}>
                    เข้างาน
                  </Button>
                  <Button danger icon={<CoffeeOutlined />} onClick={() => changeStatus("onleave")}>
                    ลาพัก
                  </Button>
                  <Button icon={<PoweroffOutlined />} onClick={() => changeStatus("inactive")}>
                    ออกงาน
                  </Button>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* การ์ดสรุป (ตัวอย่าง) */}
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

export default EmployeeHome;
