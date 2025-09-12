// src/pages/Home/EmployeeHome.tsx
import React, { useEffect, useMemo, useState } from "react";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import { Card, Typography, Button, Tag, message, ConfigProvider, Space } from "antd";
import {
  PlayCircleOutlined,
  PoweroffOutlined,
  CoffeeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
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
  EmployeeStatus?: { StatusName?: string; StatusDescription?: string };
}

const EmployeeHome: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState<Employee | null>(null);

  const token = localStorage.getItem("token") || "";
  const employeeId = Number(localStorage.getItem("employeeId") || 0);

  // แปลง response ให้เป็นรูปที่หน้าใช้
  const normalize = (raw: any): Employee => ({
    id: raw?.ID ?? raw?.id ?? 0,
    FirstName: raw?.FirstName ?? raw?.firstName,
    LastName: raw?.LastName ?? raw?.lastName,
    Gender: raw?.Gender ?? raw?.gender,
    Phone: raw?.Phone ?? raw?.phone,
    PositionID: raw?.PositionID ?? raw?.positionID,
    Position: raw?.Position
      ? {
          ID: raw.Position.ID ?? raw.Position.id ?? 0,
          PositionName: raw.Position.PositionName ?? raw.Position.positionName ?? "",
        }
      : undefined,
    User: raw?.User
      ? { ID: raw.User.ID ?? raw.User.id, Email: raw.User.Email ?? raw.User.email }
      : undefined,
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

  // โหลดโปรไฟล์พนักงาน
  const fetchMe = async () => {
    try {
      setLoading(true);
      if (employeeId) {
        const res = await EmployeeService.get(employeeId);
        setEmp(normalize(res));
        return;
      }
      if (token) {
        const r = await fetch(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000") + "/employee/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const me = await r.json();
          setEmp(normalize(me));
          if (me?.ID) localStorage.setItem("employeeId", String(me.ID));
          return;
        }
      }
      message.warning("ไม่พบรหัสพนักงาน");
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลพนักงานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMe(); /* eslint-disable-next-line */ }, [employeeId, token]);

  // เปลี่ยนสถานะ (ส่งค่าหลักติดไปด้วยกันเพื่อไม่ให้ค่าหาย)
  const changeStatus = async (status: EmpStatus) => {
    if (!emp?.id) return message.error("ยังไม่มีข้อมูลพนักงาน");
    try {
      setLoading(true);

      const payload = {
        FirstName: emp.FirstName,
        LastName: emp.LastName,
        Gender: emp.Gender,
        Phone: emp.Phone,
        PositionID: emp.PositionID,
        Status: status,
        StatusDescription: STATUS_DESC[status],
      };

      const updated = await EmployeeService.update(emp.id, payload);
      const next = normalize(updated);

      // ถ้า response ไม่ preload User/Position ให้เก็บของเดิมไว้
      setEmp((prev) => ({
        ...next,
        User: next.User ?? prev?.User,
        Position: next.Position ?? prev?.Position,
        Phone: next.Phone ?? prev?.Phone,
        Gender: next.Gender ?? prev?.Gender,
        FirstName: next.FirstName ?? prev?.FirstName,
        LastName: next.LastName ?? prev?.LastName,
      }));

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

  const theme = {
    token: { colorPrimary: "#2563EB", borderRadius: 20, fontSize: 18 },
  } as const;

  return (
    <ConfigProvider theme={theme}>
      <EmployeeSidebar>
        <Card loading={loading} style={{ width: "100%" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <UserOutlined style={{ fontSize: 64, color: "#2563EB" }} />
            <Title level={2} style={{ marginTop: 12, marginBottom: 8 }}>
              {fullName || "-"}
            </Title>
            <Tag color={currentTag.color} style={{ fontSize: 16, padding: "6px 16px" }}>
              {currentTag.text}
            </Tag>
            <div style={{ marginTop: 8, fontSize: 16, color: "#475569" }}>
              รายละเอียดสถานะ: <b>{currentDesc}</b>
            </div>
            {/* Email / Phone / Position */}
            <Space size="large" wrap style={{ marginTop: 16, justifyContent: "center" }}>
              <span><MailOutlined /> <Text type="secondary">{emp?.User?.Email || "-"}</Text></span>
              <span><PhoneOutlined /> <Text type="secondary">{emp?.Phone || "-"}</Text></span>
              <span><IdcardOutlined /> <Text type="secondary">{emp?.Position?.PositionName || "-"}</Text></span>
            </Space>
          </div>
          {/* Buttons */}
          <div style={{ display: "flex", gap: 16 }}>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => changeStatus("active")}
              block
              style={{ height: 60, fontSize: 18, fontWeight: 600 }}
            >
              เข้างาน
            </Button>
            <Button
              onClick={() => changeStatus("onleave")}
              block
              style={{
                height: 60,
                fontSize: 18,
                fontWeight: 600,
                background: "#FEF3C7",
                borderColor: "#F59E0B",
                color: "#92400E",
              }}
              icon={<CoffeeOutlined />}
            >
              ลาพัก
            </Button>
            <Button
              danger
              icon={<PoweroffOutlined />}
              onClick={() => changeStatus("inactive")}
              block
              style={{ height: 60, fontSize: 18, fontWeight: 600 }}
            >
              ออกงาน
            </Button>
          </div>
        </Card>
      </EmployeeSidebar>
    </ConfigProvider>
  );
};

export default EmployeeHome;
