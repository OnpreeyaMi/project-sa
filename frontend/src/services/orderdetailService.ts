// src/services/orderdetailService.ts
export interface Machine {
  ID: number;
  Machine_type: string;
  Capacity_kg: number;
  Machine_number: number;
  status?: string;
}

export interface Customer {
  FirstName: string;
  LastName: string;
  PhoneNumber: string; 
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
  Customer?: Customer;
  Address?: Address;
  LaundryProcesses?: LaundryProcess[];
}

const API_BASE = "http://localhost:8080";

export const orderdeailService = {
  // ดึง Order ตาม ID
  getOrder: async (orderId: string | undefined): Promise<Order> => {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },

  // ดึงเครื่องซัก/อบทั้งหมด
  getMachines: async (): Promise<Machine[]> => {
    const res = await fetch(`${API_BASE}/machines` );
    if (!res.ok) throw new Error("Failed to fetch machines");
    return res.json();
  },

  // บันทึกเครื่องซัก/อบสำหรับ LaundryProcess
    saveMachines: async (processId: number, machine_ids: number[]) => {
    const res = await fetch(`${API_BASE}/laundry-process/${processId}/machines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine_ids }),
    });
    if (!res.ok) throw new Error("Failed to save machines");
    return res.json();
    },

  // อัปเดตสถานะ LaundryProcess พร้อมหมายเหตุ
  updateStatus: async (processId: number, status: string, status_note: string) => {
    const res = await fetch(`${API_BASE}/laundry-process/${processId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, status_note }),
    });
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
};
