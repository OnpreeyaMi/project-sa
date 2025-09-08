// src/pages/Home/EmployeeProfile.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../../component/layout/employee/empSidebar";
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  message,
  Descriptions,
  Space,
  Divider,
  Skeleton,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  ReloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { EmployeeService } from "../../services/Employee";

const { Title, Text } = Typography;

type EmpStatus = "active" | "inactive" | "onleave";
type EmpGender = "male" | "female" | "other";

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

type Employee = {
  ID: number;
  Code?: string;
  FirstName?: string;
  LastName?: string;
  Gender?: EmpGender | string;
  Phone?: string;
  StartDate?: string;
  User?: { ID?: number; Email?: string };
  PositionID?: number;
  Position?: { ID: number; PositionName: string };
  EmployeeStatus?: { ID: number; StatusName: EmpStatus | string; StatusDescription?: string };
};

// -------- Helpers (null-safe) --------
const genderLabel = (g?: string | null) => (g === "male" ? "ชาย" : g === "female" ? "หญิง" : "อื่น ๆ");
const fullName = (e?: Employee | null) => `${e?.FirstName || ""} ${e?.LastName || ""}`.trim();
const initialsOf = (e?: Employee | null) =>
  [e?.FirstName?.trim()?.[0], e?.LastName?.trim()?.[0]].filter(Boolean).join("") || "•";
const positionNameOf = (e?: Employee | null) => e?.Position?.PositionName || "-";
const statusOf = (e?: Employee | null): EmpStatus => {
  const s = (e?.EmployeeStatus?.StatusName || "inactive").toString().toLowerCase();
  return (["active", "inactive", "onleave"].includes(s) ? s : "inactive") as EmpStatus;
};
const statusDescOf = (e?: Employee | null) => e?.EmployeeStatus?.StatusDescription || STATUS_DESC[statusOf(e)];
const joinDateOf = (e?: Employee | null) => (e?.StartDate ? String(e.StartDate).slice(0, 10) : "-");

// -------- normalize response -> Employee --------
const normalize = (raw: any): Employee => {
  const posObj = raw?.Position || raw?.position || {};
  const posName = posObj?.PositionName || posObj?.positionName || raw?.position || undefined;
  const statusName: string =
    raw?.EmployeeStatus?.StatusName || raw?.employeeStatus?.statusName || raw?.Status || raw?.status || "inactive";
  const statusDescFromDB: string | undefined =
    raw?.EmployeeStatus?.StatusDescription || raw?.employeeStatus?.statusDescription || undefined;
  const startDateStr = raw?.StartDate || raw?.startDate || raw?.start_date;
  const userObj = raw?.User || raw?.user || undefined;
  if (userObj) userObj.Email = userObj.Email ?? userObj.email;

  return {
    ID: raw?.ID ?? raw?.id ?? 0,
    Code: raw?.Code ?? raw?.code,
    FirstName: raw?.FirstName ?? raw?.firstName,
    LastName: raw?.LastName ?? raw?.lastName,
    Gender: (raw?.Gender ?? raw?.gender ?? "").toLowerCase(),
    Phone: raw?.Phone ?? raw?.phone,
    StartDate: startDateStr,
    User: userObj,
    PositionID: raw?.PositionID ?? raw?.positionID ?? posObj?.ID ?? posObj?.id,
    Position: posName
      ? { ID: raw?.Position?.ID ?? raw?.Position?.id ?? raw?.PositionID ?? 0, PositionName: posName }
      : undefined,
    EmployeeStatus: {
      ID: raw?.EmployeeStatus?.ID ?? raw?.EmployeeStatus?.id ?? 0,
      StatusName: (statusName || "inactive").toLowerCase(),
      StatusDescription: statusDescFromDB,
    },
  };
};

const EmployeeProfile: React.FC = () => {
  // ใช้จาก route param (/:id) หรือ localStorage("employeeId")
  const params = useParams();
  const employeeId = useMemo(() => {
    const fromRoute = Number(params.id || 0);
    const fromStorage = Number(localStorage.getItem("employeeId") || 0);
    return fromRoute || fromStorage || 0;
  }, [params.id]);

  const [loading, setLoading] = useState(false);
  const [emp, setEmp] = useState<Employee | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const currentStatus = statusOf(emp);
  const currentTag = STATUS_TAG[currentStatus];
  const currentDesc = statusDescOf(emp);

  const loadProfile = async () => {
    if (!employeeId) {
      message.warning("ไม่พบรหัสพนักงาน (employeeId)");
      setLoadedOnce(true);
      return;
    }
    try {
      setLoading(true);
      const data = await EmployeeService.get(employeeId);
      setEmp(normalize(data));
    } catch (e) {
      console.error(e);
      message.error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
    } finally {
      setLoading(false);
      setLoadedOnce(true);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [employeeId]);

  return (
    <EmployeeSidebar>
      <div className="min-h-screen bg-gray-50">
        {/* ---------- Hero / Header ---------- */}
        <div className="relative overflow-hidden">
          <div className="h-40 md:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%)]" />
          <div className="max-w-6xl mx-auto px-4 -mt-12 md:-mt-16">
            <Card className="rounded-2xl shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-2 md:p-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-xl md:text-2xl shadow-sm">
                  {initialsOf(emp)}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Title level={3} className="!m-0">{fullName(emp) || "-"}</Title>
                    <Tag color={currentTag.color} className="px-2 py-1 rounded-full">{currentTag.text}</Tag>
                    <span className="text-gray-500">{currentDesc}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <MailOutlined /> {emp?.User?.Email || "-"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <PhoneOutlined /> {emp?.Phone || "-"}
                    </span>
                  </div>
                </div>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={loadProfile}>
                    รีเฟรช
                  </Button>
                </Space>
              </div>

              <Divider className="!my-4" />

              {/* Quick chips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">รหัสพนักงาน</div>
                  <div className="font-semibold">
                    {emp?.Code || (emp ? `EMP${String(emp.ID).padStart(3, "0")}` : "-")}
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">ตำแหน่ง</div>
                  <div className="font-semibold">{positionNameOf(emp)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">เพศ</div>
                  <div className="font-semibold">{genderLabel(emp?.Gender || null)}</div>
                </div>
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="text-xs text-gray-500">วันที่เข้าร่วม</div>
                  <div className="font-semibold inline-flex items-center gap-2">
                    <CalendarOutlined /> {joinDateOf(emp)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ---------- Body ---------- */}
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="rounded-2xl shadow-sm">
                <Title level={5} className="!mt-0">ข้อมูลพนักงาน</Title>
                {loading ? (
                  <Skeleton active paragraph={{ rows: 6 }} />
                ) : !emp && loadedOnce ? (
                  <Empty description="ไม่พบข้อมูลพนักงาน" />
                ) : (
                  <Descriptions
                    className="mt-2"
                    column={1}
                    size="middle"
                    labelStyle={{ width: 160 }}
                  >
                    <Descriptions.Item label={<span className="inline-flex items-center gap-2"><UserOutlined /> ชื่อ-นามสกุล</span>}>
                      {fullName(emp) || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="inline-flex items-center gap-2"><MailOutlined /> อีเมล</span>}>
                      {emp?.User?.Email || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="inline-flex items-center gap-2"><PhoneOutlined /> เบอร์โทร</span>}>
                      {emp?.Phone || "-"}
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="inline-flex items-center gap-2"><IdcardOutlined /> เพศ</span>}>
                      {genderLabel(emp?.Gender || null)}
                    </Descriptions.Item>
                    <Descriptions.Item label="ตำแหน่ง">
                      {positionNameOf(emp)}
                    </Descriptions.Item>
                    <Descriptions.Item label="รหัสพนักงาน">
                      {emp?.Code || (emp ? `EMP${String(emp.ID).padStart(3, "0")}` : "-")}
                    </Descriptions.Item>
                    <Descriptions.Item label={<span className="inline-flex items-center gap-2"><CalendarOutlined /> วันที่เข้าร่วม</span>}>
                      {joinDateOf(emp)}
                    </Descriptions.Item>
                    <Descriptions.Item label="สถานะ (รายละเอียด)">
                      <span className="inline-flex items-center gap-2">
                        <Tag color={currentTag.color} className="px-2 py-1 rounded-full">{currentTag.text}</Tag>
                        <span className="text-gray-600">{currentDesc}</span>
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              {/* การ์ดว่างไว้สำหรับส่วนขยายภายหลัง (เช่น ประวัติการทำงาน) */}
              <Card className="rounded-2xl shadow-sm h-full">
                <Title level={5} className="!mt-0">สรุปโดยย่อ</Title>
                <div className="grid grid-cols-1 gap-3 mt-2">
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">อีเมล</span>
                    <span className="font-medium">{emp?.User?.Email || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">เบอร์โทร</span>
                    <span className="font-medium">{emp?.Phone || "-"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">ตำแหน่ง</span>
                    <span className="font-medium">{positionNameOf(emp)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-gray-500">สถานะ</span>
                    <span className="font-medium">{STATUS_DESC[statusOf(emp)]}</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </EmployeeSidebar>
  );
};

export default EmployeeProfile;
