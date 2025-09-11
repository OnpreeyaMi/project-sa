export interface IEmployee {
  ID: number;
  Code?: string;

  FirstName?: string;
  LastName?: string;
  Gender?: "male" | "female" | "other" | string;

  PositionID?: number;
  Phone?: string;

  StartDate?: string;       // ISO string (จาก Go time.Time)

  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;

  User?: IUser;
  Position?: IPosition;
  EmployeeStatus?: IEmployeeStatus;
}

export interface IEmployeeStatus {
  ID: number;
  StatusName: "active" | "inactive" | "onleave" | string;
  StatusDescription?: string;
}

export interface IPosition {
  ID: number;
  PositionName: string;
}

export interface IUser {
  ID?: number;
  Email?: string;
  Password?: string; // ใช้เฉพาะตอนส่งสร้าง/แก้
}
