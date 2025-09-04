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
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />


        <Route path="/employee/check" element={<LaundryCheckPage />} />
        <Route path="/profile" element={<Profile />} />


        <Route path="/admin/employees" element={<EmployeePage />} />
        <Route path="/admin/customers" element={<CustomerManagement />} />
        <Route path="/admin/promotions" element={<PromotionManagement />} />
      </Routes>
    </>

      //     <Routes>
      //       <Route path="/" element={<EmpSidebar />} />
      //       <Route path="/Home" element={<EmployeeHome />} />
      //       <Route path="/order" element={<StatusUpdate/>} />
      //       <Route path="/orders/:orderId" element={<OrderDetail />} />
      //       <Route path="/TransportQueuePage" element={<TransportQueuePage/>} />
      //       <Route path="/store" element={<EmployeeHome />} />
      //       <Route path="/profile" element={<StatusPage />} />
      //       <Route path="/OrderPage" element={<OrderPage />} />
      //       <Route path="/HistoryPage" element={<HistoryPage />} />
      //       <Route path="/StockEmpPage" element={<StockEmpPage />} />
      //       <Route path="/StockAdminPage" element={<StockAdminPage />} />
      //       </Routes>
      // {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      // {/* <AdminSidebar></AdminSidebar> */}
      // {/* <EmpSidebar></EmpSidebar> */}
      // {/*<CustomerSidebar></CustomerSidebar>*/}
      // <OrderPage></OrderPage>
      // <HistoryPage></HistoryPage>
      // <StockEmpPage></StockEmpPage>
      // <StockAdminPage></StockAdminPage>
      
      
    // </BrowserRouter>
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
