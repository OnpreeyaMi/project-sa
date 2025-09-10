const API_BASE = "http://localhost:8000"; // หรือเปลี่ยนเป็น BASE URL ของ backend

export interface Queue {
  ID: number;
  Queue_type: string; // pickup หรือ delivery
  Status: string;
  OrderID: number;
  AssignedEmp?: string;
  Order?: {
    ID: number;
    Customer?: {
      FirstName: string;
      LastName: string;
    };
    Address?: {
      AddressDetails: string;
    };
  };
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

  // ยืนยันรับผ้าแล้ว
  confirmPickupDone: async (queueId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/pickup_done`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to confirm pickup done");
    return res.json();
  },

  // ยืนยันส่งผ้าแล้ว
  confirmDeliveryDone: async (queueId: number) => {
    const res = await fetch(`${API_BASE}/queues/${queueId}/delivery_done`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to confirm delivery done");
    return res.json();
  },
};
