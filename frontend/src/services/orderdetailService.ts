// src/services/orderdetailService.ts
export interface Machine {
  ID: number;
  Machine_type: string;
  Capacity_kg: number;
  Machine_number: number;
  Status?: string;
}

export interface Customer {
  ID: number;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Address: Address[];
}

export interface Address {
  ID: number;
  AddressDetails: string;
}

export interface LaundryProcess {
  ID: number;
  Status: string;
  status_note?: string;
  Machine?: Machine[];
}

export interface Order {
  ID: number;
  customer_id?: number; // เพิ่มให้ตรง backend
  created_at?: string;  // เพิ่มให้ตรง backend
  Customer?: Customer;
  LaundryProcesses?: LaundryProcess[];
  status?: string;
}

const API_BASE = "http://localhost:8000";

export const orderdeailService = {
  // ดึง Order ตาม ID
  getOrder: async (orderId: string | undefined): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },
  getProcessesByOrder: async (orderId: string) => {
    const res = await fetch(`${API_BASE}/process/${orderId}/order`);
    if (!res.ok) throw new Error("Failed to fetch processes by order");
    return res.json();

  },
  // ดึงเครื่องซัก/อบทั้งหมด
  getMachines: async (): Promise<Machine[]> => {
    const res = await fetch(`${API_BASE}/machines`);
    if (!res.ok) throw new Error("Failed to fetch machines");
    return res.json();
  },

  // บันทึกเครื่องซัก/อบสำหรับ LaundryProcess
  saveMachines: async (processId: number | string, machine_ids: number[]) => {
    // ส่งทั้ง MachineIDs และ machine_ids เพื่อรองรับ backend ทั้งสองแบบ
    const res = await fetch(`${API_BASE}/laundry-process/${processId}/machines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ MachineIDs: machine_ids, machine_ids: machine_ids }),
    });
    if (!res.ok) throw new Error("Failed to save machines");
    return res.json();
  },

  // อัปเดตสถานะ LaundryProcess พร้อมหมายเหตุ
  updateStatus: async (processId: number, status: string, description: string, employeeId?: number) => {
    const res = await fetch(`${API_BASE}/laundry-process/${processId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, status_note: description, employee_id: employeeId }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
  deleteMachine: async (processId: number, machineId: number) => {
    const res = await fetch(`${API_BASE}/laundry-process/${processId}/machines/${machineId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete machine");
    return res.json();
  },
};
