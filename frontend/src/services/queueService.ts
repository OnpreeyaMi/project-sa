const API_BASE = "http://localhost:8000"; // หรือเปลี่ยนเป็น BASE URL ของ backend
export interface Queue {
  ID: number;
  Queue_type: string; // pickup หรือ delivery
  Status: string;
  OrderID: number;
  AssignedEmp?: string;
  TimeSlotID?: number;
  TimeSlot?: TimeSlot;
  Order?: {
    ID: number;
    Customer?: {
      FirstName: string;
      LastName: string;
      PhoneNumber?: string;
    };
    Address?: {
      AddressDetails: string;
    };
  };
}
// TimeSlot สำหรับระบบคิว
export interface TimeSlot {
  ID: number;
  Start_time: string; // ISO string
  End_time: string;   // ISO string
  SlotType: "pickup" | "delivery";
  Capacity: number;
  Status: "available" | "full" | "closed";
}
// QueueHistory interface
export interface QueueHistory {
  ID: number;
  QueueID: number;
  CreatedAt: string;
  Queue?: Queue;
}

export const queueService = {
  // ดึงคิว pickup/delivery
  getQueues: async (type: "pickup" | "delivery"): Promise<Queue[]> => {
    const res = await fetch(`${API_BASE}/queues?type=${type}`);
    if (!res.ok) throw new Error("Failed to fetch queues");
    return res.json();
  },

  // พนักงานกดรับคิว
  acceptQueue: async (queueId: number, employeeId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) throw new Error("Failed to accept queue");
    return res.json();
  },

  // ยืนยันรับผ้าแล้ว (ส่ง employeeId ด้วย)
  confirmPickupDone: async (queueId: number, employeeId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/pickup_done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) throw new Error("Failed to confirm pickup done");
    return res.json();
  },

  // ยืนยันส่งผ้าแล้ว (ส่ง employeeId ด้วย)
  confirmDeliveryDone: async (queueId: number, employeeId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/delivery_done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employee_id: employeeId }),
    });
    if (!res.ok) throw new Error("Failed to confirm delivery done");
    return res.json();
  },

  // ลบคิว
  deleteQueue: async (queueId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete queue");
    return res.json();
  },

  // อัปเดตคิว (status, employee)
  updateQueue: async (queueId: number, data: Partial<{ status: string; employee_id: number }>) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update queue");
    return res.json();
  },

  // assign timeslot ให้คิว (ตรวจสอบ capacity)
  assignTimeSlot: async (queueId: number, timeSlotId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/assign_timeslot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_slot_id: timeSlotId }),
    });
    if (!res.ok) throw new Error("Failed to assign timeslot");
    return res.json();
  },

  // ดึง TimeSlot ทั้งหมด (optionally filter by type)
  getTimeSlots: async (type?: "pickup" | "delivery"): Promise<TimeSlot[]> => {
    let url = `${API_BASE}/timeslots`;
    if (type) url += `?type=${type}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch timeslots");
    return res.json();
  },
  // ดึงประวัติคิวที่เสร็จแล้ว
  getQueueHistories: async (): Promise<QueueHistory[]> => {
    const res = await fetch(`${API_BASE}/queue_histories`);
    if (!res.ok) throw new Error("Failed to fetch queue histories");
    return res.json();
  },
};
