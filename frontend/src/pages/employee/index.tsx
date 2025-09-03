import React, { useMemo, useState, useEffect } from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Form, Input, Select, Button, Popconfirm, message, Divider } from "antd";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";
import api from "../../lib/api";
import type { IEmployee } from "../../interfaces/Employee/IEmployee";

type EmpStatus = "active" | "inactive" | "onleave";
type EmpGender = "male" | "female" | "other";

interface EmployeeExt extends IEmployee { statusDescription?: string; }
type Employee = EmployeeExt;

type EmployeeUpsert = Partial<Employee> & { email?: string; password?: string; statusDescription?: string; };

const initialEmployees: Employee[] = [];

const statusMeta: Record<EmpStatus, { label: string; badge: string; dot: string }> = {
  active: { label: "ออนไลน์",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  inactive:{ label: "ออฟไลน์",  badge: "bg-gray-200 text-gray-600",   dot: "bg-gray-400"   },
  onleave: { label: "ลาพัก",    badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
};

// คำอธิบายสถานะแบบลิงก์อัตโนมัติ
const STATUS_DESC: Record<EmpStatus, string> = {
  active: "กำลังปฎิบัติงาน",
  inactive: "ยังไม่ปฎิบัติงาน",
  onleave: "ลาพัก",
};

const genderLabel = (g?: EmpGender | string) => (g === "male" ? "ชาย" : g === "female" ? "หญิง" : "อื่น ๆ");
const fullName = (e: Employee) => `${e.firstName || ""} ${e.lastName || ""}`.trim();
const initialsOf = (e: Employee) => [e.firstName?.trim()?.[0], e.lastName?.trim()?.[0]].filter(Boolean).join("");

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

  const allPositions = useMemo(() => {
    const setPos = new Set<string>();
    employees.forEach((e) => e.position && setPos.add(e.position as string));
    return Array.from(setPos);
  }, [employees]);

  // ---------- Transform raw from backend ----------
  const transformRaw = (raw: any): Employee => {
    const posObj = raw.Position || raw.position || {};
    const posName = posObj.PositionName || posObj.position_name || raw.position || "";

    const statusName: string =
      raw.EmployeeStatus?.StatusName ||
      raw.employeeStatus?.statusName ||
      raw.status ||
      "inactive";

    const statusDescFromDB: string | undefined =
      raw.EmployeeStatus?.StatusDescription ||
      raw.employeeStatus?.statusDescription ||
      undefined;

    const startDateStr = raw.startDate || raw.StartDate || raw.start_date;
    const joinDate = startDateStr ? String(startDateStr).slice(0, 10) : (raw.joinDate || "");

    // ใช้คำอธิบายจาก DB ก่อน ถ้าไม่มี ใช้ mapping
    const normalized = (statusName || "inactive").toLowerCase() as EmpStatus;
    const effectiveDesc = statusDescFromDB || STATUS_DESC[normalized];

    return {
      id: raw.id ?? raw.ID ?? 0,
      firstName: raw.firstName ?? raw.FirstName ?? raw.first_name,
      lastName: raw.lastName ?? raw.LastName ?? raw.last_name,
      gender: (raw.gender || "").toLowerCase(),
      position: posName,
      positionID: raw.positionID ?? raw.PositionID ?? posObj.id ?? posObj.ID,
      phone: raw.phone,
      startDate: startDateStr,
      joinDate,
      status: normalized,
      statusDescription: effectiveDesc,
      User: raw.User,
      Position: raw.Position,
      EmployeeStatus: raw.EmployeeStatus,
    };
  };

  // ---------- API calls ----------
  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      const list = Array.isArray(res.data) ? res.data.map(transformRaw) : [];
      setEmployees(list);
    } catch (err) {
      console.error("fetch employees:", err);
      message.error("ไม่สามารถดึงข้อมูลพนักงานได้");
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const createEmployeeAPI = async (payload: EmployeeUpsert) => {
    try {
      const res = await api.post("/employees", { ...payload, startDate: payload.joinDate });
      const created = transformRaw(res.data);
      await fetchEmployees();
      message.success("เพิ่มพนักงานเรียบร้อย");
      return created;
    } catch (err: any) {
      console.error("createEmployeeAPI:", err);
      message.error(err?.response?.data?.error || "สร้างพนักงานไม่สำเร็จ");
      throw err;
    }
  };

  const updateEmployeeAPI = async (id: number, payload: EmployeeUpsert) => {
    try {
      const res = await api.put(`/employees/${id}`, { ...payload, startDate: payload.joinDate });
      const updated = transformRaw(res.data);
      await fetchEmployees();
      message.success("อัปเดตข้อมูลเรียบร้อย");
      return updated;
    } catch (err: any) {
      console.error("updateEmployeeAPI:", err);
      message.error(err?.response?.data?.error || "อัปเดตไม่สำเร็จ");
      throw err;
    }
  };

  const deleteEmployeeAPI = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      await fetchEmployees();
      message.success("ลบข้อมูลพนักงานเรียบร้อย");
    } catch (err: any) {
      console.error("deleteEmployeeAPI:", err);
      message.error(err?.response?.data?.error || "ลบพนักงานไม่สำเร็จ");
      throw err;
    }
  };

  // ---------- Filtering ----------
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const term = search.toLowerCase();
      const possibleStrings = [
        fullName(emp),
        emp.firstName,
        emp.lastName,
        emp.position,
        emp.phone,
        emp.User?.email,
        emp.statusDescription,
      ].filter((f): f is string => typeof f === "string" && f.length > 0);

      const hit = possibleStrings.some((f) => f.toLowerCase().includes(term));
      const statusOk = statusFilter === "all" || emp.status === statusFilter;
      const genderOk = genderFilter === "all" || emp.gender === genderFilter;
      const positionOk = positionFilter === "all" || emp.position === positionFilter;
      return hit && statusOk && genderOk && positionOk;
    });
  }, [employees, search, statusFilter, genderFilter, positionFilter]);

  // ---------- Edit handler ----------
  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    form.setFieldsValue({
      firstName: emp.firstName,
      lastName: emp.lastName,
      gender: emp.gender,
      position: emp.position,
      email: emp.User?.email,
      phone: emp.phone,
      joinDate: emp.joinDate,
      status: emp.status,
      statusDescription: emp.statusDescription,
    });
    setIsModalOpen(true);
  };

  // ---------- Delete helpers ----------
  const handleConfirmDelete = async (id: number) => { try { await deleteEmployeeAPI(id); } catch {} };
  const handleDeleteInModal = async () => {
    if (!editingEmployee) return;
    await handleConfirmDelete(editingEmployee.id);
    setIsModalOpen(false);
    setEditingEmployee(null);
    form.resetFields();
  };

  // ---------- Save handler ----------
  const handleSaveEmployee = async (values: any) => {
    const statusVal = values.status as EmpStatus;
    const payload: EmployeeUpsert = {
      firstName: values.firstName,
      lastName: values.lastName,
      gender: values.gender,
      position: values.position,
      email: values.email,
      password: values.password ?? "",
      phone: values.phone,
      joinDate: values.joinDate,
      status: statusVal,
      // ถ้าไม่มี ให้เติมจาก mapping
      statusDescription: values.statusDescription || STATUS_DESC[statusVal],
    };

    try {
      if (editingEmployee) {
        if (!payload.password) delete payload.password;
        await updateEmployeeAPI(editingEmployee.id, payload);
      } else {
        if (!payload.password || payload.password.trim() === "") {
          message.error("กรุณากรอกรหัสผ่าน"); return;
        }
        if (!payload.email || payload.email.trim() === "") {
          message.error("กรุณากรอกอีเมล"); return;
        }
        await createEmployeeAPI(payload);
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingEmployee(null);
    } catch {}
  };

  // ---------- Derived ----------
  const statusCounts = useMemo(() => ({
    active: employees.filter((e) => e.status === "active").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
    onleave: employees.filter((e) => e.status === "onleave").length,
  }), [employees]);

  const positionCounts = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, cur) => {
      const p = (cur.position as string) || "ไม่ระบุ";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  const positionOptions = useMemo(
    () => [{ value: "all", label: "ทุกตำแหน่ง" },
      ...Array.from(new Set(employees.map(e => e.position).filter(Boolean)))
        .map((p) => ({ value: p as string, label: p as string }))],
    [employees]
  );

  const statusOptions = [
    { value: "active", label: "active" },
    { value: "inactive", label: "inactive" },
    { value: "onleave", label: "onleave" },
  ];

  const genderOptions = [
    { value: "male", label: "ชาย" },
    { value: "female", label: "หญิง" },
    { value: "other", label: "อื่น ๆ" },
  ];

  // ---------- Render ----------
  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 font-sans bg-gray-50">
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
              // ค่าเริ่มต้น status + คำอธิบายตาม mapping
              form.setFieldsValue({ status: "inactive", statusDescription: STATUS_DESC["inactive"] });
              setIsModalOpen(true);
            }}
          >
            + เพิ่มพนักงาน
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input placeholder="ค้นหา (ชื่อ, ตำแหน่ง, อีเมล, เบอร์โทร, คำอธิบายสถานะ)" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              className="w-full"
              options={[{ value: "all", label: "สถานะทั้งหมด" }, ...statusOptions]}
            />
            <Select
              value={genderFilter}
              onChange={(v) => setGenderFilter(v as any)}
              className="w-full"
              options={[{ value: "all", label: "เพศทั้งหมด" }, ...genderOptions]}
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
            <Button onClick={() => { setSearch(""); setStatusFilter("all"); setGenderFilter("all"); setPositionFilter("all"); }}>
              ล้างตัวกรอง
            </Button>
          </div>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            ไม่มีข้อมูลที่ตรงกับการค้นหา/ตัวกรอง
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEmployees.map((emp) => {
              const meta = statusMeta[(emp.status ?? "inactive") as EmpStatus];
              const initials = initialsOf(emp) || "•";
              const badgeText = emp.statusDescription || STATUS_DESC[(emp.status ?? "inactive") as EmpStatus];
              return (
                <div key={emp.id} className="group relative overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg">
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
                  <div className="p-5">
                    <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 select-none ${meta.badge}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {badgeText}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                        {initials}
                      </div>
                      <div>
                        <h2 className="font-semibold leading-tight">{fullName(emp)}</h2>
                        <p className="text-gray-500 text-sm">{emp.position} • {genderLabel(emp.gender)}</p>
                      </div>
                    </div>

                    <div className="text-sm space-y-1.5 text-gray-700">
                      <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> รหัส: { (emp as any).code || `EMP${String(emp.id).padStart(3, "0")}`}</p>
                      <p className="flex items-center gap-2"><FaPhone className="text-gray-400" /> {emp.phone}</p>
                      <p className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> {emp.User?.email || "-"}</p>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">เข้าร่วม: {emp.joinDate}</p>

                    <div className="flex justify-end mt-4 pt-3 border-t">
                      <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600" onClick={() => handleEditClick(emp)}>
                        <FaEdit /> แก้ไข
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-700">
              <div><p className="text-blue-600 text-xl font-bold">{employees.length}</p>ทั้งหมด</div>
              <div><p className="text-green-600 text-xl font-bold">{statusCounts.active}</p>ออนไลน์</div>
              <div><p className="text-gray-600 text-xl font-bold">{statusCounts.inactive}</p>ออฟไลน์</div>
              <div><p className="text-yellow-600 text-xl font-bold">{statusCounts.onleave}</p>ลาพัก</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold mb-2">จำนวนพนักงานตามแผนก/ตำแหน่ง</h3>
            {Object.keys(positionCounts).length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีข้อมูล</p>
            ) : (
              <ul className="space-y-2">
                {Object.entries(positionCounts).sort((a,b)=>b[1]-a[1]).map(([position, count]) => (
                  <li key={position} className="py-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{position}</span>
                      <span className="font-semibold">{count} คน</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${(Number(count) / Math.max(1, employees.length)) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Modal
          title={editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
          open={isModalOpen}
          onCancel={() => { setIsModalOpen(false); setEditingEmployee(null); form.resetFields(); }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSaveEmployee}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="ชื่อ (First name)" name="firstName" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}><Input /></Form.Item>
              <Form.Item label="นามสกุล (Last name)" name="lastName" rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}><Input /></Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="เพศ" name="gender" rules={[{ required: true, message: "กรุณาเลือกเพศ" }]} >
                <Select options={[{ value: "male", label: "ชาย" }, { value: "female", label: "หญิง" }, { value: "other", label: "อื่น ๆ" }]} />
              </Form.Item>
              <Form.Item label="ตำแหน่ง" name="position" rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]}><Input /></Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="อีเมล" name="email" rules={[{ required: true, type: "email", message: "อีเมลไม่ถูกต้อง" }]}><Input /></Form.Item>
              <Form.Item
                label="รหัสผ่าน"
                name="password"
                rules={editingEmployee ? [] : [{ required: true, message: "กรุณากรอกรหัสผ่าน" }, { min: 6, message: "รหัสผ่านอย่างน้อย 6 ตัวอักษร" }]}
              >
                <Input.Password />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="เบอร์โทร" name="phone" rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}><Input /></Form.Item>
              <div />
            </div>

            <Form.Item label="วันที่เข้าร่วม" name="joinDate" rules={[{ required: true, message: "กรุณากรอกวันที่เข้าร่วม" }]} >
              <Input placeholder="เช่น 15/1/2566 หรือ 2025-09-03" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="สถานะ (StatusName)" name="status" rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}>
                <Select
                  options={[
                    { value: "active", label: "active" },
                    { value: "inactive", label: "inactive" },
                    { value: "onleave", label: "onleave" },
                  ]}
                  onChange={(val) => {
                    // อัปเดตรีวิวคำอธิบายตาม mapping ทุกครั้งที่เปลี่ยนสถานะ
                    form.setFieldsValue({ statusDescription: STATUS_DESC[val as EmpStatus] });
                  }}
                />
              </Form.Item>
              <Form.Item label="รายละเอียดสถานะ" name="statusDescription">
                <Input.TextArea rows={1} readOnly placeholder="คำอธิบายจะกำหนดอัตโนมัติตามสถานะ" />
              </Form.Item>
            </div>

            {editingEmployee && (
              <>
                <Divider />
                <div className="flex items-center justify-between">
                  <div className="text-red-600 font-medium"></div>
                  <Popconfirm
                    title="ต้องการลบข้อมูลพนักงานหรือไม่?"
                    description={`คุณกำลังจะลบ "${fullName(editingEmployee)}" ออกจากระบบ`}
                    okText="ยืนยันลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleDeleteInModal}
                  >
                    <Button danger icon={<FaTrash />}>ลบพนักงาน</Button>
                  </Popconfirm>
                </div>
              </>
            )}

            <Form.Item>
              <div className="flex items-center mt-4">
                <Button type="primary" htmlType="submit">{editingEmployee ? "บันทึกการแก้ไข" : "บันทึก"}</Button>
                <div className="ml-auto">
                  <Button onClick={() => { setIsModalOpen(false); setEditingEmployee(null); form.resetFields(); }}>
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
