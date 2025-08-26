import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
// import EmpSidebar from "./component/layout/employee/empSidebar";
// import CustomerSidebar from "./component/layout/customer/CusSidebar";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import EmployeeSidebar from "./pages/laundryCheck";
import EmpSidebar from "./component/layout/employee/empSidebar";
import CustomerSidebar from "./component/layout/customer/CusSidebar";
import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
{
  /* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */
}
{
  /* <AdminSidebar></AdminSidebar> */
}
{
  /* <EmpSidebar></EmpSidebar> */
}
{
  /* <CustomerSidebar></CustomerSidebar> */
}
const App: React.FC = () => {
  // const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      <Routes>
        <Route path="/employee/check"element={<LaundryCheckPage />} />
         <Route path="/admin/employees"element={<EmployeePage />} />
      </Routes>
    </>
    
  );
};

export default App;
