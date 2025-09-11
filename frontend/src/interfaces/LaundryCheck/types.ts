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
  ClothTypeID?: number;
  ClothTypeName?: string;
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
  ServiceTypes: { ID: number; Name: string }[];
  Items: OrderItemView[];
  TotalItems: number;
  TotalQuantity: number;
}

export interface HistoryEntry {
  ID: number;
  RecordedAt: string;
  Quantity: number;
  Action: "ADD" | "EDIT" | "DELETE";
  ClothTypeID?: number;
  ServiceTypeID?: number;
  ClothTypeName: string;
  ServiceType: string;
  CurrentQuantity: number; // 👈 ใช้ค่านี้ตรง ๆ
}
