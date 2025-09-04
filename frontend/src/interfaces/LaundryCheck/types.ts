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
  ClothTypeID: number;
  ServiceTypeID: number;
  Quantity: number;
}

export interface LaundryCheckInput {
  CustomerID: number;
  AddressID: number;
  StaffNote?: string;
  Items: LaundryItemInput[];
}

export interface OrderSummary {
  ID: number;
  CreatedAt: string;          // ISO string from backend
  CustomerName: string;
  Phone: string;
  TotalItems: number;
  TotalQuantity: number;
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
  StaffNote: string;
  Items: OrderItemView[];
  TotalItems: number;
  TotalQuantity: number;
}
