import type { IPosition } from "./IPosition";
import type { IUser } from "./IUser";
import type { IEmployeeStatus } from "./IEmployeeStatus";

export interface IEmployee {
  id: number;
  code?: string;
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other" | string;
  position?: string;
  positionID?: number;
  
  phone?: string;

  // รองรับทั้งสองชื่อ (backend ส่ง startDate; UI ใช้ joinDate)
  startDate?: string;
  joinDate?: string;

  status?: "active" | "inactive" | "onleave" | string;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;

  User?: IUser;
  Position?: IPosition;
  EmployeeStatus?: IEmployeeStatus;
}
