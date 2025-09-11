import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface IUser { ID?: number; Email?: string; Password?: string }
interface IPosition { ID: number; PositionName: string }
interface IEmployeeStatus { ID: number; StatusName: "active"|"inactive"|"onleave"|string; StatusDescription?: string }
interface IEmployee {
  ID: number;
  Code?: string;
  FirstName?: string;
  LastName?: string;
  Gender?: string;
  PositionID?: number;
  Phone?: string;
  StartDate?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
  User?: IUser;
  Position?: IPosition;
  EmployeeStatus?: IEmployeeStatus;
}

interface Address { id: number; detail: string; latitude: number; longitude: number; isDefault: boolean }
interface Gender { id: number; name: string }
interface Customer {
  id: number; firstName: string; lastName: string; phone: string; gender: Gender; addresses: Address[];
}

interface User {
  id: number;
  email: string;
  role: "customer" | "employee" | "admin";
  token: string;
  customer?: Customer;
  employeeId?: number;
  employee?: IEmployee;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshCustomer: () => Promise<void>;
  refreshEmployee: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

function normalizeCustomer(raw: any): Customer {
  return {
    id: raw.ID,
    firstName: raw.FirstName,
    lastName: raw.LastName,
    phone: raw.PhoneNumber,
    gender: raw.Gender ? { id: raw.Gender.ID, name: raw.Gender.Name } : { id: 0, name: "" },
    addresses: (raw.Addresses || []).map((addr: any) => ({
      id: addr.ID,
      detail: addr.AddressDetails,
      latitude: addr.Latitude,
      longitude: addr.Longitude,
      isDefault: addr.IsDefault,
    })),
  };
}

function normalizeEmployee(raw: any): IEmployee {
  const posObj = raw?.Position || raw?.position || {};
  const posName = posObj?.PositionName || posObj?.positionName || raw?.position || "";
  const statusName: string =
    raw?.EmployeeStatus?.StatusName ||
    raw?.employeeStatus?.statusName ||
    raw?.Status ||
    raw?.status ||
    "inactive";
  const statusDescFromDB: string | undefined =
    raw?.EmployeeStatus?.StatusDescription || raw?.employeeStatus?.statusDescription || undefined;

  const startDateStr = raw?.StartDate || raw?.startDate || raw?.start_date;
  const userObj = raw?.User || raw?.user || undefined;
  if (userObj) userObj.Email = userObj.Email ?? userObj.email;

  return {
    ID: raw?.ID ?? raw?.id ?? 0,
    Code: raw?.Code ?? raw?.code,
    FirstName: raw?.FirstName ?? raw?.firstName,
    LastName: raw?.LastName ?? raw?.lastName,
    Gender: (raw?.Gender ?? raw?.gender ?? "").toLowerCase(),
    Phone: raw?.Phone ?? raw?.phone,
    StartDate: startDateStr,
    User: userObj,
    PositionID: raw?.PositionID ?? raw?.positionID ?? posObj?.ID ?? posObj?.id,
    Position: posName
      ? { ID: posObj?.ID ?? posObj?.id ?? raw?.PositionID ?? 0, PositionName: posName }
      : undefined,
    EmployeeStatus: {
      ID: raw?.EmployeeStatus?.ID ?? raw?.EmployeeStatus?.id ?? 0,
      StatusName: (statusName || "inactive").toLowerCase(),
      StatusDescription: statusDescFromDB,
    },
    CreatedAt: raw?.CreatedAt ?? raw?.createdAt,
    UpdatedAt: raw?.UpdatedAt ?? raw?.updatedAt,
    DeletedAt: raw?.DeletedAt ?? raw?.deletedAt ?? null,
  };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = (u: User | null) => {
    if (u) {
      localStorage.setItem("user", JSON.stringify(u));
      if ((u as any).token) localStorage.setItem("token", (u as any).token);
      if ((u as any).role) localStorage.setItem("role", (u as any).role);
      if ((u as any).employeeId) localStorage.setItem("employeeId", String((u as any).employeeId));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("employeeId");
    }
    setUserState(u);
  };

  const logout = () => setUser(null);

  const refreshCustomer = async () => {
    if (!user || user.role !== "customer") return;
    try {
      const res = await axios.get(`${API_BASE}/customer/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUser({ ...user, customer: normalizeCustomer(res.data) });
    } catch (err) {
      console.error("Failed to refresh customer", err);
    }
  };

  const refreshEmployee = async () => {
    if (!user || user.role !== "employee") return;
    try {
      // พยายาม /employee/me ก่อน
      try {
        const res = await axios.get(`${API_BASE}/employee/me`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const emp = normalizeEmployee(res.data);
        setUser({ ...user, employee: emp, employeeId: emp.ID });
        localStorage.setItem("employeeId", String(emp.ID));
        return;
      } catch (_) {
        // fallback /employees/:id
        const id = Number(localStorage.getItem("employeeId") || 0);
        if (!id) return;
        const r2 = await axios.get(`${API_BASE}/employees/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const emp2 = normalizeEmployee(r2.data);
        setUser({ ...user, employee: emp2 });
      }
    } catch (e) {
      console.error("Failed to refresh employee", e);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshCustomer, refreshEmployee }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};
