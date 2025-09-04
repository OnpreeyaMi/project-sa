export interface IEmployee {
  ID: number;
  Code?: string;

  FirstName?: string;
  LastName?: string;
  Gender?: "male" | "female" | "other" | string;

  // แสดงผลชื่อแผนก/ตำแหน่ง ให้ใช้จาก Relation
  PositionID?: number;
  Phone?: string;

  StartDate?: string;   // มาจาก time.Time ของ Go -> ISO string
  // ถ้าจะมีช่องกรอก JoinDate ในฟอร์ม ควรแม็พไป/มาให้เป็น "JoinDate" (PascalCase) ตอนเรียก API

  // ไม่มีฟิลด์ Status ตรง ๆ ใน Employee (อยู่ใน Relation)
  // ใช้จาก EmployeeStatus.StatusName / StatusDescription
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
  id?: number;
  total?: string;

  Position?: IPosition;

}

export interface IUser {
  ID?: number;
  Email?: string;
  Status?: string;
  Password?: string; // ถ้าไม่ต้องใช้ฝั่ง FE จะละไว้ก็ได้
}
