import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
// import EmpSidebar from "./component/layout/employee/empSidebar";
// import CustomerSidebar from "./component/layout/customer/CusSidebar";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
// import EmployeeSidebar from "./pages/laundryCheck";
// import EmpSidebar from "./component/layout/employee/empSidebar";
// import CustomerSidebar from "./component/layout/customer/CusSidebar";
// import EmployeePage from "./pages/employee";
// import LaundryCheckPage from "./pages/laundryCheck";
// import CustomerManagement from "./pages/customer/CustomerMangement";
// import PromotionManagement from "./pages/promotion/PromotionManagement";
import Login from "./pages/login/login";
import RegisterForm from "./pages/register/register";
import "leaflet/dist/leaflet.css";


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
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />
        {/* <Route path="/employee/check" element={<LaundryCheckPage />} />
        <Route path="/admin/employees" element={<EmployeePage />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        <Route path="/admin/promotions" element={<PromotionManagement />} /> */}
      </Routes>
    </>

  );

};

export default App;

//ระบบย่อย : จัดการกระบวนการซัก actor customer

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
      
//       <Routes>
//         {/* เส้นทางอื่นๆ */}
//         <Route path="/" element={<CustomerSidebar />}/>
//         <Route path="/status" element={<StatusPage />} />
//       </Routes>
   
//     </BrowserRouter>
//   );

// };

// export default App;

