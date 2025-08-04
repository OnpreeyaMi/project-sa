import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
// import EmpSidebar from "./component/layout/employee/empSidebar";
import CustomerSidebar from "./component/layout/customer/CusSidebar";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      {/* <AdminSidebar></AdminSidebar> */}
      {/* <EmpSidebar></EmpSidebar> */}
      <CustomerSidebar></CustomerSidebar>
      
    </>
  );
};

export default App;
