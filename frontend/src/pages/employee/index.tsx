import React, { useMemo, useState } from "react";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { Modal, Form, Input, Select, Button, Popconfirm, message } from "antd";
import AdminSidebar from "../../component/layout/admin/AdminSidebar";

// -----------------------------
// Types
// -----------------------------
interface Employee {
  id: number;
  name: string;
  gender: "male" | "female" | "other";
  position: string;
  email: string;
  phone: string;
  joinDate: string; // dd/mm/yyyy or yyyy-mm-dd
  status: "active" | "inactive" | "onleave";
}

// -----------------------------
// Seed Data
// -----------------------------
const initialEmployees: Employee[] = [
  {
    id: 1,
    name: "นางสาวสุดา จันทร์ใส",
    gender: "female",
    position: "พนักงานขนส่ง",
    email: "suda@laundry.com",
    phone: "089-123-4567",
    joinDate: "15/1/2566",
    status: "active",
  },
];

// -----------------------------
// Utility (UI helpers)
// -----------------------------
const statusMeta: Record<Employee["status"], { label: string; badge: string; dot: string }> = {
  active: { label: "ออนไลน์", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  inactive: { label: "ออฟไลน์", badge: "bg-gray-200 text-gray-600", dot: "bg-gray-400" },
  onleave: { label: "ลาพัก", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
};

const genderLabel = (g: Employee["gender"]) => (g === "male" ? "ชาย" : g === "female" ? "หญิง" : "อื่น ๆ");

// -----------------------------
// Component
// -----------------------------
const EmployeePage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // —— UI State ——
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Employee["status"] | "all">("all");
  const [genderFilter, setGenderFilter] = useState<Employee["gender"] | "all">("all");
  const [positionFilter, setPositionFilter] = useState<string | "all">("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Dynamic options for Position
  const allPositions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => set.add(e.position));
    return Array.from(set);
  }, [employees]);

  // —— Filter & Search ——
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const term = search.toLowerCase();
      const hit = [emp.name, emp.position, emp.email, emp.phone].some((f) => f.toLowerCase().includes(term));
      const statusOk = statusFilter === "all" || emp.status === statusFilter;
      const genderOk = genderFilter === "all" || emp.gender === genderFilter;
      const positionOk = positionFilter === "all" || emp.position === positionFilter;
      return hit && statusOk && genderOk && positionOk;
    });
  }, [employees, search, statusFilter, genderFilter, positionFilter]);

  const handleConfirmDelete = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    message.success("ลบข้อมูลพนักงานเรียบร้อย");
  };

  const handleSaveEmployee = (values: any) => {
    if (editingEmployee) {
      setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...values } : emp)));
      message.success("บันทึกการแก้ไขเรียบร้อย");
    } else {
      const newEmployee: Employee = {
        id: employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1,
        ...values,
      };
      setEmployees((prev) => [newEmployee, ...prev]);
      message.success("เพิ่มพนักงานใหม่เรียบร้อย");
    }
    setIsModalOpen(false);
    form.resetFields();
    setEditingEmployee(null);
  };

  const handleEditClick = (emp: Employee) => {
    setEditingEmployee(emp);
    form.setFieldsValue(emp);
    setIsModalOpen(true);
  };

  // —— Summary ——
  const statusCounts = useMemo(
    () => ({
      active: employees.filter((e) => e.status === "active").length,
      inactive: employees.filter((e) => e.status === "inactive").length,
      onleave: employees.filter((e) => e.status === "onleave").length,
    }),
    [employees]
  );

  const positionCounts = useMemo(() => {
    return employees.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.position] = (acc[cur.position] || 0) + 1;
      return acc;
    }, {});
  }, [employees]);

  const positionList = useMemo(() => Object.entries(positionCounts).sort((a, b) => b[1] - a[1]), [positionCounts]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <AdminSidebar>
      <div className="min-h-screen p-8 font-sans bg-gray-50">
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
              setIsModalOpen(true);
            }}
          >
            + เพิ่มพนักงาน
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="ค้นหา (ชื่อ, ตำแหน่ง, อีเมล, เบอร์โทร)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onChange={setStatusFilter} className="w-full">
              <Select.Option value="all">สถานะทั้งหมด</Select.Option>
              <Select.Option value="active">ออนไลน์</Select.Option>
              <Select.Option value="inactive">ออฟไลน์</Select.Option>
              <Select.Option value="onleave">ลาพัก</Select.Option>
            </Select>
            <Select value={genderFilter} onChange={setGenderFilter} className="w-full">
              <Select.Option value="all">เพศทั้งหมด</Select.Option>
              <Select.Option value="male">ชาย</Select.Option>
              <Select.Option value="female">หญิง</Select.Option>
              <Select.Option value="other">อื่น ๆ</Select.Option>
            </Select>
            <Select value={positionFilter} onChange={setPositionFilter} className="w-full" placeholder="เลือกแผนก/ตำแหน่ง">
              <Select.Option value="all">ทุกตำแหน่ง</Select.Option>
              {allPositions.map((p) => (
                <Select.Option key={p} value={p}>{p}</Select.Option>
              ))}
            </Select>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <Button onClick={() => { setSearch(""); setStatusFilter("all"); setGenderFilter("all"); setPositionFilter("all"); }}>ล้างตัวกรอง</Button>
          </div>
        </div>

        {/* Employee Cards */}
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            ไม่มีข้อมูลที่ตรงกับการค้นหา/ตัวกรอง
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredEmployees.map((emp) => {
              const meta = statusMeta[emp.status];
              const initials = emp.name.trim().split(' ').filter(Boolean).map((s) => s[0]).slice(0, 2).join('');
              return (
                <div key={emp.id} className="group relative overflow-hidden rounded-2xl bg-white shadow transition hover:shadow-lg">
                  {/* subtle top border */}
                  <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
                  <div className="p-5">
                    <div className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 select-none ${meta.badge}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                        {initials}
                      </div>
                      <div>
                        <h2 className="font-semibold leading-tight">{emp.name}</h2>
                        <p className="text-gray-500 text-sm">{emp.position} • {genderLabel(emp.gender)}</p>
                      </div>
                    </div>

                    <div className="text-sm space-y-1.5 text-gray-700">
                      <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-gray-400" /> รหัส: EMP{String(emp.id).padStart(3, "0")}</p>
                      <p className="flex items-center gap-2"><FaPhone className="text-gray-400" /> {emp.phone}</p>
                      <p className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /> {emp.email}</p>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">เข้าร่วม: {emp.joinDate}</p>

                    <div className="flex justify-between mt-4 pt-3 border-t">
                      <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600" onClick={() => handleEditClick(emp)}>
                        <FaEdit /> แก้ไข
                      </button>
                      <Popconfirm
                        title="ต้องการลบข้อมูลพนักงานหรือไม่?"
                        description={`คุณกำลังจะลบ "${emp.name}" ออกจากระบบ`}
                        okText="ยืนยันลบ"
                        cancelText="ยกเลิก"
                        okButtonProps={{ danger: true }}
                        onConfirm={() => handleConfirmDelete(emp.id)}
                      >
                        <button className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                          <FaTrash /> ลบ
                        </button>
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-8">
          {/* Status summary */}
          <div className="bg-white rounded-2xl shadow p-5">
            <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-700">
              <div>
                <p className="text-blue-600 text-xl font-bold">{employees.length}</p>
                ทั้งหมด
              </div>
              <div>
                <p className="text-green-600 text-xl font-bold">{statusCounts.active}</p>
                ออนไลน์
              </div>
              <div>
                <p className="text-gray-600 text-xl font-bold">{statusCounts.inactive}</p>
                ออฟไลน์
              </div>
              <div>
                <p className="text-yellow-600 text-xl font-bold">{statusCounts.onleave}</p>
                ลาพัก
              </div>
            </div>
          </div>

          {/* Position/Department counts */}
          <div className="bg-white rounded-2xl shadow p-5">
            <h3 className="font-semibold mb-2">จำนวนพนักงานตามแผนก/ตำแหน่ง</h3>
            {positionList.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีข้อมูล</p>
            ) : (
              <ul className="space-y-2">
                {positionList.map(([position, count]) => (
                  <li key={position} className="py-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{position}</span>
                      <span className="font-semibold">{count} คน</span>
                    </div>
                    {/* progress bar */}
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
        >
          <Form form={form} layout="vertical" onFinish={handleSaveEmployee}>
            <Form.Item label="ชื่อ-นามสกุล" name="name" rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}>
              <Input />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="เพศ" name="gender" rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}>
                <Select>
                  <Select.Option value="male">ชาย</Select.Option>
                  <Select.Option value="female">หญิง</Select.Option>
                  <Select.Option value="other">อื่น ๆ</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="ตำแหน่ง" name="position" rules={[{ required: true, message: "กรุณากรอกตำแหน่ง" }]}>
                <Input />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Form.Item label="อีเมล" name="email" rules={[{ required: true, type: "email", message: "อีเมลไม่ถูกต้อง" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="เบอร์โทร" name="phone" rules={[{ required: true, message: "กรุณากรอกเบอร์โทร" }]}>
                <Input />
              </Form.Item>
            </div>

            <Form.Item label="วันที่เข้าร่วม" name="joinDate" rules={[{ required: true, message: "กรุณากรอกวันที่เข้าร่วม" }]}>
              <Input placeholder="เช่น 15/1/2566" />
            </Form.Item>

            <Form.Item label="สถานะ" name="status" rules={[{ required: true, message: "กรุณาเลือกสถานะ" }]}>
              <Select>
                <Select.Option value="active">ออนไลน์</Select.Option>
                <Select.Option value="inactive">ออฟไลน์</Select.Option>
                <Select.Option value="onleave">ลาพัก</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEmployee(null);
                    form.resetFields();
                  }}
                >
                  ยกเลิก
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingEmployee ? "บันทึกการแก้ไข" : "บันทึก"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminSidebar>
  );
};

export default EmployeePage;