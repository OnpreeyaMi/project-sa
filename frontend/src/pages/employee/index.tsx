import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Form, Input, Select, Button, Popconfirm, message, Divider, DatePicker, Spin, Empty } from "antd";
import dayjs from "dayjs";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";
import { EmployeeService, type EmployeeUpsert } from "../../services/Employee";

type EmpStatus = "active" | "inactive" | "onleave";
type EmpGender = "male" | "female" | "other";

type Employee = {
  ID: number;
  Code?: string;
  FirstName?: string;
  LastName?: string;
  Gender?: EmpGender | string;
  Phone?: string;
  StartDate?: string; // ISO หรือ "YYYY-MM-DD"
  User?: { ID?: number; Email?: string };
  PositionID?: number;
  Position?: { ID: number; PositionName: string };
  EmployeeStatus?: { ID: number; StatusName: EmpStatus | string; StatusDescription?: string };
};

const initialEmployees: Employee[] = [];

// ✅ ตัวเลือกตำแหน่ง (ไม่บังคับใช้ ถ้า backend ส่งชื่ออื่นมาก็ยังแสดงได้)
const POSITION_CHOICES = [
  { value: "พนักงานขนส่งผ้า", label: "พนักงานขนส่งผ้า" },
  { value: "พนักงานซักผ้า", label: "พนักงานซักผ้า" },
];

const statusMeta: Record<EmpStatus, { label: string; badge: string; dot: string }> = {
  active: { label: "ออนไลน์", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  inactive: { label: "ออฟไลน์", badge: "bg-gray-200 text-gray-600", dot: "bg-gray-400" },
  onleave: { label: "ลาพัก", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
};

const STATUS_DESC: Record<EmpStatus, string> = {
  active: "กำลังปฎิบัติงาน",
  inactive: "ยังไม่ปฎิบัติงาน",
  onleave: "ลาพัก",
};

// ===================== Utilities =====================
const genderLabel = (g?: EmpGender | string) => (g === "male" ? "ชาย" : g === "female" ? "หญิง" : "อื่น ๆ");
const fullName = (e: Employee) => `${e.FirstName || ""} ${e.LastName || ""}`.trim();
const initialsOf = (e: Employee) => [e.FirstName?.trim()?.[0], e.LastName?.trim()?.[0]].filter(Boolean).join("") || "•";
const positionNameOf = (e: Employee) => e.Position?.PositionName || "";
const statusOf = (e: Employee): EmpStatus => {
  const s = (e.EmployeeStatus?.StatusName || "inactive").toString().toLowerCase();
  return (["active", "inactive", "onleave"].includes(s) ? s : "inactive") as EmpStatus;
};
const statusDescOf = (e: Employee) => e.EmployeeStatus?.StatusDescription || STATUS_DESC[statusOf(e)];
const joinDateOf = (e: Employee) => (e.StartDate ? dayjs(e.StartDate).format("YYYY-MM-DD") : "");
const codeOf = (e: Employee) => (e.Code?.trim() || `EMP${String(e.ID).padStart(3, "0")}`);

// ป้องกัน future date (เข้าร่วมงานไม่ควรเกินวันนี้)
const disableFuture = (current: dayjs.Dayjs) => current && current.isAfter(dayjs().endOf("day"));

const normalizeString = (s?: string) => (s || "").toLowerCase().trim();
const stripSpacesHyphen = (s: string) => s.replace(/\s|-/g, "");
const onlyDigits = (s: string) => s.replace(/\D/g, "");

// ===================== Component =====================
const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  type StatusFilter = EmpStatus | "all";
  type GenderFilter = EmpGender | "all";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [positionFilter, setPositionFilter] = useState<string | "all">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [loading, setLoading] = useState<boolean>(false); // ✅ เพิ่มสถานะโหลด
  const [submitting, setSubmitting] = useState<boolean>(false); // ✅ ป้องกันกดซ้ำ

  // ---- transform raw -> Employee (ทนทานกับ key casing ต่าง ๆ)
  const transformRaw = useCallback((raw: any): Employee => {
    const posObj = raw.Position || raw.position || {};
    const posName = posObj.PositionName || posObj.positionName || raw.position || "";
    const statusName: string =
      raw.EmployeeStatus?.StatusName || raw.employeeStatus?.statusName || raw.Status || raw.status || "inactive";
    const statusDescFromDB: string | undefined =
      raw.EmployeeStatus?.StatusDescription || raw.employeeStatus?.statusDescription || undefined;
    const startDateStr = raw.StartDate || raw.startDate || raw.start_date;
    const userObj = raw.User || raw.user || undefined;
    if (userObj) userObj.Email = userObj.Email ?? userObj.email;

    const emp: Employee = {
      ID: raw.ID ?? raw.id ?? 0,
      Code: raw.Code ?? raw.code,
      FirstName: raw.FirstName ?? raw.firstName,
      LastName: raw.LastName ?? raw.lastName,
      Gender: (raw.Gender ?? raw.gender ?? "").toLowerCase(),
      Phone: raw.Phone ?? raw.phone,
      StartDate: startDateStr,
      User: userObj,
      PositionID: raw.PositionID ?? raw.positionID ?? posObj.ID ?? posObj.id,
      Position: raw.Position
        ? { ID: raw.Position.ID ?? raw.Position.id, PositionName: posName }
        : posName
        ? { ID: raw.PositionID ?? 0, PositionName: posName }
        : undefined,
      EmployeeStatus: raw.EmployeeStatus
        ? {
            ID: raw.EmployeeStatus.ID ?? raw.EmployeeStatus.id,
            StatusName: (statusName || "inactive").toLowerCase(),
            StatusDescription: statusDescFromDB,
          }
        : {
            ID: 0,
            StatusName: (statusName || "inactive").toLowerCase(),
            StatusDescription: statusDescFromDB,
          },
    };
    return emp;
  }, []);

  // ---- API calls
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const list = await EmployeeService.list();
      setEmployees(Array.isArray(list) ? list.map(transformRaw) : []);
    } catch (err) {
      console.error("fetch employees:", err);
      message.error("ไม่สามารถดึงข้อมูลพนักงานได้");
    } finally {
      setLoading(false);
    }
  }, [transformRaw]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployeeAPI = useCallback(
    async (payload: EmployeeUpsert) => {
      const created = await EmployeeService.create(payload);
      await fetchEmployees();
      message.success("เพิ่มพนักงานเรียบร้อย");
      return transformRaw(created);
    },
    [fetchEmployees, transformRaw]
  );

  const updateEmployeeAPI = useCallback(
    async (id: number, payload: EmployeeUpsert) => {
      const updated = await EmployeeService.update(id, payload);
      await fetchEmployees();
      message.success("อัปเดตข้อมูลเรียบร้อย");
      return transformRaw(updated);
    },
    [fetchEmployees, transformRaw]
  );

  const deleteEmployeeAPI = useCallback(
    async (id: number) => {
      await EmployeeService.remove(id);
      await fetchEmployees();
      message.success("ลบข้อมูลพนักงานเรียบร้อย");
    },
    [fetchEmployees]
  );

  // ---- ค้นหา + ฟิลเตอร์ (รองรับ Code/EMP###/เลขล้วน/ID)
  const filteredEmployees = useMemo(() => {
    const termRaw = normalizeString(search);
    const termNoSpace = stripSpacesHyphen(termRaw);
    const termDigits = onlyDigits(termRaw);

    return employees.filter((emp) => {
      const code = codeOf(emp);
      const codeLower = normalizeString(code);
      const codeCompact = stripSpacesHyphen(codeLower);
      const codeDigits = onlyDigits(codeLower);
      const idStr = String(emp.ID);

      const possibleStrings = [
        fullName(emp),
        positionNameOf(emp),
        emp.Phone,
        emp.User?.Email,
        statusDescOf(emp),
        code,
        idStr,
      ].filter((f): f is string => typeof f === "string" && f.length > 0);

      const hitText = termRaw ? possibleStrings.some((f) => normalizeString(f).includes(termRaw)) : true;
      const hitCode =
        (!!termRaw && codeLower.includes(termRaw)) ||
        (!!termNoSpace && codeCompact.includes(termNoSpace)) ||
        (!!termDigits && (codeDigits.includes(termDigits) || idStr.includes(termDigits)));

      const s = statusOf(emp);
      const statusOk = statusFilter === "all" || s === statusFilter;
      const genderOk = genderFilter === "all" || (emp.Gender || "").toLowerCase() === genderFilter;
      const positionOk = positionFilter === "all" || positionNameOf(emp) === positionFilter;

      return (hitText || hitCode) && statusOk && genderOk && positionOk;
    });
  }, [employees, search, statusFilter, genderFilter, positionFilter]);

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    form.setFieldsValue({
      FirstName: emp.FirstName,
      LastName: emp.LastName,
      Gender: (emp.Gender || "") as EmpGender,
      Position: positionNameOf(emp),
      Email: emp.User?.Email,
      Phone: emp.Phone,
      JoinDate: emp.StartDate ? dayjs(emp.StartDate) : undefined, // DatePicker ต้องเป็น dayjs
      Status: statusOf(emp),
      StatusDescription: statusDescOf(emp),
    });
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await deleteEmployeeAPI(id);
    } catch (err: any) {
      console.error("delete employee:", err);
      message.error(err?.response?.data?.error || "ลบพนักงานไม่สำเร็จ");
    }
  };

  const handleDeleteInModal = async () => {
    if (!editingEmployee) return;
    await handleConfirmDelete(editingEmployee.ID);
    setIsModalOpen(false);
    setEditingEmployee(null);
    form.resetFields();
  };

  const handleSaveEmployee = async (values: any) => {
    const statusVal = values.Status as EmpStatus;

    const payload: EmployeeUpsert = {
      Code: values.Code,
      FirstName: values.FirstName,
      LastName: values.LastName,
      Gender: values.Gender,
      Position: values.Position, // ส่งชื่อ Position
      Email: values.Email,
      Password: values.Password ?? "",
      Phone: values.Phone,
      JoinDate: values.JoinDate ? values.JoinDate.format("YYYY-MM-DD") : undefined,
      Status: statusVal,
      StatusDescription: values.StatusDescription || STATUS_DESC[statusVal],
    };

    setSubmitting(true);
    try {
      if (editingEmployee) {
        // อัปเดต: ถ้าไม่เปลี่ยนรหัสผ่าน ให้ลบ field ทิ้ง
        if (!payload.Password) delete payload.Password;
        await updateEmployeeAPI(editingEmployee.ID, payload);
      } else {
        // สร้างใหม่: บังคับ Email/Password
        if (!payload.Password || String(payload.Password).trim() === "") {
          message.error("กรุณากรอกรหัสผ่าน");
          return;
        }
        if (!payload.Email || String(payload.Email).trim() === "") {
          message.error("กรุณากรอกอีเมล");
          return;
        }
        await createEmployeeAPI(payload);
      }

      setIsModalOpen(false);
      form.resetFields();
      setEditingEmployee(null);
    } catch (err: any) {
      console.error("save employee:", err);
      message.error(err?.response?.data?.error || "บันทึกไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  const positionCounts = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, cur) => {
      const p = positionNameOf(cur) || "ไม่ระบุ";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  const positionOptions = useMemo(
    () => [
      { value: "all", label: "ทุกตำแหน่ง" },
      ...Array.from(new Set(employees.map((e) => positionNameOf(e)).filter(Boolean))).map((p) => ({
        value: p as string,
        label: p as string,
      })),
    ],
    [employees]
  );

  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 font-sans bg-sky-100">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">จัดการพนักงาน</h1>
            <p className="text-gray-500">ข้อมูลพนักงาน</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
            onClick={() => {
              setEditingEmployee(null);
              form.resetFields();
              form.setFieldsValue({
                Status: "inactive",
                StatusDescription: STATUS_DESC["inactive"],
              });
              setIsModalOpen(true);
            }}
          >
            + เพิ่มพนักงาน
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="ค้นหา (รหัส, ชื่อ, ตำแหน่ง, อีเมล, เบอร์โทร, คำอธิบายสถานะ)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              className="w-full"
              options={[
                { value: "all", label: "สถานะทั้งหมด" },
                { value: "active", label: "active" },
                { value: "inactive", label: "inactive" },
                { value: "onleave", label: "onleave" },
              ]}
            />
            <Select
              value={genderFilter}
              onChange={(v) => setGenderFilter(v as any)}
              className="w-full"
              options={[
                { value: "all", label: "เพศทั้งหมด" },
                { value: "male", label: "ชาย" },
                { value: "female", label: "หญิง" },
                { value: "other", label: "อื่น ๆ" },
              ]}
            />
            <Select
              value={positionFilter}
              onChange={(v) => setPositionFilter(v as any)}
              className="w-full"
              options={positionOptions}
              placeholder="เลือกแผนก/ตำแหน่ง"
            />
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <Button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setGenderFilter("all");
                setPositionFilter("all");
              }}
            >
              ล้างตัวกรอง
            </Button>
          </div>
        </div>

        {/* Grid */}
        <Spin spinning={loading}>
          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10">
              <Empty description="ไม่มีข้อมูลที่ตรงกับการค้นหา/ตัวกรอง" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEmployees.map((emp) => {
                const s = statusOf(emp);
                const meta = statusMeta[s];
                const badgeText = statusDescOf(emp);
                return (
                  <div
                    key={emp.ID}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
                    <div className="p-5">
                      <div
                        className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 select-none ${meta.badge}`}
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {badgeText}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                          {initialsOf(emp)}
                        </div>
                        <div>
                          <h2 className="font-semibold leading-tight">{fullName(emp) || "-"}</h2>
                          <p className="text-gray-500 text-sm">
                            {positionNameOf(emp) || "ไม่ระบุตำแหน่ง"} • {genderLabel(emp.Gender)}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm space-y-1.5 text-gray-700">
                        <p className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-gray-400" /> รหัส: {codeOf(emp)}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaPhone className="text-gray-400" /> {emp.Phone || "-"}
                        </p>
                        <p className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-400" /> {emp.User?.Email || "-"}
                        </p>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">เข้าร่วม: {joinDateOf(emp) || "-"}</p>

                      <div className="flex justify-end mt-4 pt-3 border-t">
                        <button
                          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600"
                          onClick={() => handleEditClick(emp)}
                          aria-label={`แก้ไข ${fullName(emp)}`}
                        >
                          <FaEdit /> แก้ไข
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Spin>

        {/* Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-700">
              <div>
                <p className="text-blue-600 text-xl font-bold">{employees.length}</p>ทั้งหมด
              </div>
              <div>
                <p className="text-green-600 text-xl font-bold">
                  {employees.filter((e) => statusOf(e) === "active").length}
                </p>
                ออนไลน์
              </div>
              <div>
                <p className="text-gray-600 text-xl font-bold">
                  {employees.filter((e) => statusOf(e) === "inactive").length}
                </p>
                ออฟไลน์
              </div>
              <div>
                <p className="text-yellow-600 text-xl font-bold">
                  {employees.filter((e) => statusOf(e) === "onleave").length}
                </p>
                ลาพัก
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold mb-2">จำนวนพนักงานตามแผนก/ตำแหน่ง</h3>
            {Object.keys(positionCounts).length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีข้อมูล</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(positionCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([position, count]) => (
                    <li key={position} className="py-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{position}</span>
                        <span className="font-semibold">{count} คน</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(Number(count) / Math.max(1, employees.length)) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>

        {/* Modal */}
        <Modal
          title={editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
            form.resetFields();
          }}
          footer={null}
          destroyOnClose
          maskClosable={false}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveEmployee}
            onFinishFailed={() => message.error("กรุณาตรวจสอบข้อมูลที่ต้องกรอกให้ครบถ้วน")}
            disabled={submitting}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="ชื่อ (First name)" name="FirstName" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
                <Input autoComplete="off" />
              </Form.Item>
              <Form.Item label="นามสกุล (Last name)" name="LastName" rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}>
                <Input autoComplete="off" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="เพศ" name="Gender" rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}>
                <Select
                  options={[
                    { value: "male", label: "ชาย" },
                    { value: "female", label: "หญิง" },
                    { value: "other", label: "อื่น ๆ" },
                  ]}
                />
              </Form.Item>

              {/* ✅ Select เลือกตำแหน่ง (ส่งชื่อไป backend) */}
              <Form.Item label="ตำแหน่ง (ชื่อ)" name="Position" rules={[{ required: true, message: "กรุณาเลือกตำแหน่ง" }]}>
                <Select options={POSITION_CHOICES} placeholder="เลือกตำแหน่ง" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="อีเมล" name="Email" rules={[{ required: true, type: "email", message: "อีเมลไม่ถูกต้อง" }]}>
                <Input autoComplete="off" />
              </Form.Item>
              <Form.Item
                label="รหัสผ่าน"
                name="Password"
                rules={
                  editingEmployee
                    ? []
                    : [
                        { required: true, message: "กรุณากรอกรหัสผ่าน" },
                        { min: 6, message: "รหัสผ่านอย่างน้อย 6 ตัวอักษร" },
                      ]
                }
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item
                label="เบอร์โทร"
                name="Phone"
                rules={[
                  { required: true, message: "กรุณากรอกเบอร์โทร" },
                  { pattern: /^[0-9+\-\s]{8,20}$/, message: "รูปแบบเบอร์โทรไม่ถูกต้อง" },
                ]}
              >
                <Input autoComplete="off" />
              </Form.Item>
              <div />
            </div>

            {/* ✅ ใช้ DatePicker + ปิดอนาคต */}
            <Form.Item label="วันที่เข้าร่วม" name="JoinDate" rules={[{ required: true, message: "กรุณาเลือกวันที่เข้าร่วม" }]}>
              <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="เลือกวันที่" disabledDate={disableFuture} />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="สถานะ (StatusName)" name="Status" rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}>
                <Select
                  options={[
                    { value: "active", label: "active" },
                    { value: "inactive", label: "inactive" },
                    { value: "onleave", label: "onleave" },
                  ]}
                  onChange={(val) => form.setFieldsValue({ StatusDescription: STATUS_DESC[val as EmpStatus] })}
                />
              </Form.Item>
              <Form.Item label="รายละเอียดสถานะ" name="StatusDescription">
                <Input.TextArea rows={1} readOnly placeholder="คำอธิบายจะกำหนดอัตโนมัติตามสถานะ" />
              </Form.Item>
            </div>

            {editingEmployee && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="text-red-600 font-medium" />
                  <Popconfirm
                    title="ต้องการลบข้อมูลพนักงานหรือไม่?"
                    description={`คุณกำลังจะลบ "${fullName(editingEmployee)}" ออกจากระบบ`}
                    okText="ยืนยันลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleDeleteInModal}
                  >
                    <Button danger icon={<FaTrash />}>
                      ลบพนักงาน
                    </Button>
                  </Popconfirm>
                </div>
              </>
            )}

            <Form.Item>
              <div className="flex items-center mt-4">
                <Button type="primary" htmlType="submit" loading={submitting}>
                  {editingEmployee ? "บันทึกการแก้ไข" : "บันทึก"}
                </Button>
                <div className="ml-auto">
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingEmployee(null);
                      form.resetFields();
                    }}
                  >
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminSidebar>
  );
};

export default EmployeePage;
