import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
import HomePage from "./pages/Home/EmployeeHome";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/employees" replace />} />
      <Route path="/employee/check" element={<LaundryCheckPage />} />
      <Route path="/employee/dashboard" element={<HomePage />} />
      <Route path="/employee/delivery" element={<TransportQueuePage />} />
      <Route path="/admin/employees" element={<EmployeePage />} />
      <Route path="*" element={<div style={{ padding: 20 }}>Route not found</div>} />
    </Routes>
  );
};

export default App;
