import React from "react";
import { Routes, Route } from "react-router-dom";
import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
import LaundryHistoryPage from "./pages/laundryCheck/LaundryHistoryPage";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";
import Login from "./pages/login/login";
import RegisterForm from "./pages/register/register";
import EmployeeHome from "./pages/Home/EmployeeHome";
import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
import OrderDetail from "./pages/LaundryProcess/OrderDetail";
import StockEmpPage from "./pages/stock/employee";
import StatusPage from "./pages/LaundryProcess/StatusPage";
import CustomerManagement from "./pages/customer/CustomerMangement";
import PromotionManagement from "./pages/promotion/PromotionManagement";
import Profile from "./pages/profile/profile";
import CustomerComplaintPage from "./pages/complaint/complaintCreate";
import Payment from "./pages/payment/create";
import ComplaintAdminPage from "./pages/complaint/complaintReply";
import OrderPage from "./pages/orders/create";
import HistoryPage from "./pages/orders/history";
import StockAdminPage from "./pages/stock/Admin";
import CustomerHomePage from "./pages/Home/CustomerHome";
import EmployeeProfile from "./pages/employee/EmployeeProfile";

const App: React.FC = () => {

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
        <Route path="/employee/laundry-history" element={<LaundryHistoryPage />} />
        <Route path="inventory" element={<StockEmpPage />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="complaint" element={<ComplaintAdminPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" >
        <Route path="employees" element={<EmployeePage />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="promotions" element={<PromotionManagement />} />
        <Route path="stock" element={<StockAdminPage />} />
      </Route>

      {/* Customer routes */}
        <Route path="/customer">
          <Route path="profile" element={<Profile />} />
          <Route path="complaint" element={<CustomerComplaintPage />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="home" element={<CustomerHomePage/>}/>
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
