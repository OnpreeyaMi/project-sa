import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
import CustomerManagement from "./pages/customer/CustomerMangement";
import PromotionManagement from "./pages/promotion/PromotionManagement";
import Login from "./pages/login/login";
import RegisterForm from "./pages/register/register";
import "leaflet/dist/leaflet.css";
import Profile from "./pages/profile/profile";
import EmployeeHome from "./pages/Home/EmployeeHome";
import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
import OrderDetail from "./pages/LaundryProcess/OrderDetail";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";
import StockEmpPage from "./pages/stock/employee/index";
import StatusPage from "./pages/LaundryProcess/StatusPage";
import OrderPage from "./pages/orders/create/index";

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
  const [activeTab, setActiveTab] = useState<string>("");

  return (

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Employee routes */}
        <Route path="/employee" >
          <Route path="dashboard" element={<EmployeeHome />} />
          <Route path="orders" element={<StatusUpdate />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="delivery" element={<TransportQueuePage />} />
          <Route path="check" element={<LaundryCheckPage />} />
          <Route path="inventory" element={<StockEmpPage />} />
          <Route path="profile" element={<StatusPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" >
          <Route path="employees" element={<EmployeePage />} />
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
        </Route>

        {/* Customer routes */}
        <Route path="/customer">
          <Route path="orders" element={<OrderPage/>} />
          {/* เพิ่ม route อื่นของ customer ได้ที่นี่ */}
        </Route>
      </Routes>

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

// import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// // import EmployeeHome from "./pages/Home/EmployeeHome";
// // import TransportQueuePage from "./pages/Queue/TransportQueuePage";
// // import OrderDetail from "./pages/LaundryProcess/OrderDetail";
// import StatusPage from "./pages/LaundryProcess/StatusPage";
// import HomePage from "./pages/Home/EmployeeHome";
// import EmpSidebar from "./component/layout/employee/empSidebar";

// const App: React.FC = () => {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<EmpSidebar />}>
//           <Route path="/Home" element={<HomePage />} />
//           <Route path="/order" element={<StatusUpdate />} />
//           <Route path="/profile" element={<StatusPage />} />
//           {/* เพิ่ม route อื่น ๆ */}
//         </Route>
//       </Routes>
//     </BrowserRouter>

//   );
// };

// export default App;
