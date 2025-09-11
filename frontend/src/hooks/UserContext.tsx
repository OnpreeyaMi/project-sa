// src/hooks/UserContext.tsx
export { useUser, UserProvider } from "../context/UserContext";


// // src/context/UserContext.tsx
// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// /* ===================== เดิม (Customer) ===================== */
// interface Address {
//   id: number;
//   detail: string;
//   latitude: number;
//   longitude: number;
//   isDefault: boolean;
// }

// interface Gender {
//   id: number;
//   name: string;
// }

// interface Customer {
//   id: number;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   gender: Gender;
//   addresses: Address[];
// }

// /* ===================== เพิ่มส่วน Employee ===================== */
// interface IUser {
//   ID?: number;
//   Email?: string;
//   Password?: string;
// }

// interface IPosition {
//   ID: number;
//   PositionName: string;
// }

// interface IEmployeeStatus {
//   ID: number;
//   StatusName: "active" | "inactive" | "onleave" | string;
//   StatusDescription?: string;
// }

// interface IEmployee {
//   ID: number;
//   Code?: string;
//   FirstName?: string;
//   LastName?: string;
//   Gender?: "male" | "female" | "other" | string;
//   PositionID?: number;
//   Phone?: string;
//   StartDate?: string;
//   CreatedAt?: string;
//   UpdatedAt?: string;
//   DeletedAt?: string | null;
//   User?: IUser;
//   Position?: IPosition;
//   EmployeeStatus?: IEmployeeStatus;
// }

// /* ===================== User (คงของเดิม + เพิ่ม employee) ===================== */
// interface User {
//   id: number;
//   email: string;
//   role: "customer" | "employee" | "admin";
//   token: string;
//   customer?: Customer;      // ถ้าเป็นลูกค้า
//   employeeId?: number;      // ถ้าเป็นพนักงาน
//   employee?: IEmployee;     // โปรไฟล์พนักงาน
// }

// interface UserContextType {
//   user: User | null;
//   setUser: (user: User | null) => void;
//   logout: () => void;
//   refreshCustomer: () => Promise<void>;  // เดิม
//   refreshEmployee: () => Promise<void>;  // เพิ่ม
// }

// /* ===================== Context ===================== */
// const UserContext = createContext<UserContextType | undefined>(undefined);

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// /* -------- helper เดิม (customer) -------- */
// function normalizeCustomer(raw: any) {
//   return {
//     id: raw.ID,
//     firstName: raw.FirstName,
//     lastName: raw.LastName,
//     phone: raw.PhoneNumber,
//     gender: raw.Gender ? { id: raw.Gender.ID, name: raw.Gender.Name } : { id: 0, name: "" },
//     addresses: (raw.Addresses || []).map((addr: any) => ({
//       id: addr.ID,
//       detail: addr.AddressDetails,
//       latitude: addr.Latitude,
//       longitude: addr.Longitude,
//       isDefault: addr.IsDefault,
//     })),
//   };
// }

// /* -------- helper ใหม่ (employee) -------- */
// function normalizeEmployee(raw: any): IEmployee {
//   const posObj = raw?.Position || raw?.position || {};
//   const posName = posObj?.PositionName || posObj?.positionName || raw?.position || "";
//   const statusName: string =
//     raw?.EmployeeStatus?.StatusName ||
//     raw?.employeeStatus?.statusName ||
//     raw?.Status ||
//     raw?.status ||
//     "inactive";
//   const statusDescFromDB: string | undefined =
//     raw?.EmployeeStatus?.StatusDescription || raw?.employeeStatus?.statusDescription || undefined;

//   const startDateStr = raw?.StartDate || raw?.startDate || raw?.start_date;
//   const userObj = raw?.User || raw?.user || undefined;
//   if (userObj) userObj.Email = userObj.Email ?? userObj.email;

//   return {
//     ID: raw?.ID ?? raw?.id ?? 0,
//     Code: raw?.Code ?? raw?.code,
//     FirstName: raw?.FirstName ?? raw?.firstName,
//     LastName: raw?.LastName ?? raw?.lastName,
//     Gender: (raw?.Gender ?? raw?.gender ?? "").toLowerCase(),
//     Phone: raw?.Phone ?? raw?.phone,
//     StartDate: startDateStr,
//     User: userObj,
//     PositionID: raw?.PositionID ?? raw?.positionID ?? posObj?.ID ?? posObj?.id,
//     Position: posName
//       ? { ID: posObj?.ID ?? posObj?.id ?? raw?.PositionID ?? 0, PositionName: posName }
//       : undefined,
//     EmployeeStatus: {
//       ID: raw?.EmployeeStatus?.ID ?? raw?.EmployeeStatus?.id ?? 0,
//       StatusName: (statusName || "inactive").toLowerCase(),
//       StatusDescription: statusDescFromDB,
//     },
//     CreatedAt: raw?.CreatedAt ?? raw?.createdAt,
//     UpdatedAt: raw?.UpdatedAt ?? raw?.updatedAt,
//     DeletedAt: raw?.DeletedAt ?? raw?.deletedAt ?? null,
//   };
// }

// export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUserState] = useState<User | null>(null);

//   // โหลดจาก localStorage ตอนเปิดเว็บใหม่ (คงเดิม)
//   useEffect(() => {
//     const stored = localStorage.getItem("user");
//     if (stored) setUserState(JSON.parse(stored));
//   }, []);

//   const setUser = (u: User | null) => {
//     if (u) localStorage.setItem("user", JSON.stringify(u));
//     else localStorage.removeItem("user");
//     setUserState(u);
//   };

//   const logout = () => setUser(null);

//   /* -------- เดิม: ดึง customer ใหม่ -------- */
//   const refreshCustomer = async () => {
//     if (!user || user.role !== "customer") return;

//     try {
//       const res = await axios.get(`${API_BASE}/customer/profile`, {
//         headers: { Authorization: `Bearer ${user.token}` },
//       });

//       setUser({
//         ...user,
//         customer: normalizeCustomer(res.data),
//       });
//     } catch (err) {
//       console.error("Failed to refresh customer", err);
//     }
//   };

//   /* -------- ใหม่: ดึง employee ใหม่ (ไม่กระทบของเดิม) -------- */
//   const refreshEmployee = async () => {
//     if (!user || user.role !== "employee") return;

//     try {
//       // มี /employee/me ให้ใช้ก่อน
//       try {
//         const res = await axios.get(`${API_BASE}/employee/me`, {
//           headers: { Authorization: `Bearer ${user.token}` },
//         });
//         const emp = normalizeEmployee(res.data);
//         setUser({ ...user, employee: emp, employeeId: emp.ID });
//         return;
//       } catch {
//         // ไม่มี /employee/me -> ถ้ามี employeeId ใช้ /employees/:id
//         if (user.employeeId) {
//           const res2 = await axios.get(`${API_BASE}/employees/${user.employeeId}`, {
//             headers: { Authorization: `Bearer ${user.token}` },
//           });
//           const emp2 = normalizeEmployee(res2.data);
//           setUser({ ...user, employee: emp2 });
//         }
//       }
//     } catch (err) {
//       console.error("Failed to refresh employee", err);
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, logout, refreshCustomer, refreshEmployee }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) throw new Error("useUser must be used within UserProvider");
//   return context;
// };
