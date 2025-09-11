// src/services/Employee.ts
import axios from "axios";

export type EmpStatus = "active" | "inactive" | "onleave";
export type EmpGender = "male" | "female" | "other";

export type Employee = {
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

export type EmployeeUpsert = Partial<Employee> & {
  Email?: string;
  Password?: string;
  JoinDate?: string;
  Status?: EmpStatus;
  StatusDescription?: string;
  Position?: string;
  PositionID?: number;
  Gender?: EmpGender | string;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// แนบ token ทุกคำขออัตโนมัติ
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// แปลง payload เป็น PascalCase ให้ตรงกับ Go
const toApiPayload = (p: EmployeeUpsert) => {
  const payload: any = {
    Code: p.Code,
    FirstName: p.FirstName,
    LastName: p.LastName,
    Gender: p.Gender,
    Position: p.Position,
    PositionID: p.PositionID,
    Phone: p.Phone,
    Email: p.Email,
    Password: p.Password,
    JoinDate: p.JoinDate,
    StartDate: p.JoinDate, // เผื่อ backend อ่านตัวนี้
    Status: p.Status,
    StatusDescription: p.StatusDescription,
  };
  Object.keys(payload).forEach((k) => {
    const v = (payload as any)[k];
    if (v === undefined || v === null || v === "") delete (payload as any)[k];
  });
  return payload;
};

export const EmployeeService = {
  async list(): Promise<Employee[]> {
    const res = await api.get("/employees");
    return Array.isArray(res.data) ? res.data : [];
  },

  async get(id: number): Promise<Employee> {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  async create(p: EmployeeUpsert): Promise<Employee> {
    const res = await api.post("/employees", toApiPayload(p));
    return res.data;
  },

  async update(id: number, p: EmployeeUpsert): Promise<Employee> {
    const payload = { ...toApiPayload(p) };
    if (!p.Password) delete (payload as any).Password;
    const res = await api.put(`/employees/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/employees/${id}`);
  },
};
