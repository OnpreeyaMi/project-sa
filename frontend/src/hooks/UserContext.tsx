<<<<<<< HEAD
// src/context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ----- Types -----
interface Address {
  id: number;
  detail: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

interface Gender {
  id: number;
  name: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  gender: Gender;
  addresses: Address[];
}

interface User {
  id: number;
  email: string;
  role: "customer" | "employee" | "admin";
  token: string;
  customer?: Customer; 
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshCustomer: () => Promise<void>; // ดึง customer ใหม่
}

// ----- Context -----
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);

  // โหลดจาก localStorage ตอนเปิดเว็บใหม่
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserState(JSON.parse(stored));
  }, []);

  const setUser = (u: User | null) => {
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
    setUserState(u);
  };

  const logout = () => setUser(null);

  // ----- ดึงข้อมูล customer + addresses ใหม่ -----
  const refreshCustomer = async () => {
    if (!user || user.role !== "customer") return;

    try {
      const res = await axios.get(`http://localhost:8000/customer/profile`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setUser({
        ...user,
        customer: normalizeCustomer(res.data),
      });

    } catch (err) {
      console.error("Failed to refresh customer", err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshCustomer }}>
      {children}
    </UserContext.Provider>
  );
};

function normalizeCustomer(raw: any) {
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
    // ...อื่นๆ
  };
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
=======
// src/hooks/UserContext.tsx
export { useUser, UserProvider } from "../context/UserContext";
>>>>>>> e041411a08e6d15d3a09f09f177d01f184310261
