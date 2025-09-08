export interface Customer {
  ID: number;
  Name: string;
  Phone: string;
  AddressID?: number;
  Address?: string;
  Note?: string;
}

export interface ClothType { ID: number; Name: string; }
export interface ServiceType { ID: number; Name: string; }

export interface LaundryItemInput {
  ClothTypeID?: number;      // (ไม่ได้ใช้ตอนพิมพ์ชื่อเอง)
  ClothTypeName?: string;    // ใช้กรณีพิมพ์เอง
  ServiceTypeID: number;
  Quantity: number;
}

export interface UpsertLaundryCheckInput {
  StaffNote?: string;
  Items: { ClothTypeName: string; ServiceTypeID: number; Quantity: number; }[];
}

export interface OrderSummary {
  ID: number;
  CreatedAt: string;
  CustomerName: string;
  Phone: string;
  OrderNote: string;
  HistoryCount: number;
  LatestHistoryAt?: string | null;
  TotalItems: number;
  TotalQuantity: number;
  // ถ้าคุณอยากโชว์บริการในตารางด้วย ให้เพิ่ม field นี้ที่ FE ด้วย
  ServiceTypes?: { ID: number; Name: string }[];
}

export interface OrderItemView {
  ID: number;
  ClothTypeID: number;
  ClothTypeName: string;
  ServiceTypeID: number;
  ServiceType: string;
  Quantity: number;
}

export interface OrderDetail {
  ID: number;
  CreatedAt: string;
  CustomerID: number;
  CustomerName: string;
  Phone: string;
  AddressID: number;
  Address: string;
  OrderNote: string;
  StaffNote: string;
  // ✅ เพิ่ม: บริการของออเดอร์
  ServiceTypes: { ID: number; Name: string }[];
  Items: OrderItemView[];
  TotalItems: number;
  TotalQuantity: number;
}

export interface HistoryEntry {
  ID: number;
  RecordedAt: string;
  Quantity: number;
  ClothTypeName: string;
  ServiceType: string;
}
