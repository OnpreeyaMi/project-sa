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
import PurchaseHistoryPage from './pages/stock/Admin/history'; 
import StockEmployeePage from "./pages/stock/employee";
import { UserProvider } from "./hooks/UserContext";

const App: React.FC = () => {

  return (
    <UserProvider>
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
        <Route path="profile" element={<StatusPage />} />
        <Route path="complaint" element={<ComplaintAdminPage />} />
        <Route path="stock" element={<StockEmployeePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" >
        <Route path="employees" element={<EmployeePage />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="promotions" element={<PromotionManagement />} />
        <Route path="stock" element={<StockAdminPage />} />
        <Route path="stock/history" element={<PurchaseHistoryPage />} />
      </Route>

      {/* Customer routes */}
        <Route path="/customer">
          <Route path="profile" element={<Profile />} />
          <Route path="complaint" element={<CustomerComplaintPage />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="home" element={<CustomerHomePage/>}/>
          <Route path="status" element={<StatusPage />}/>
        </Route>
    </Routes>
  </UserProvider>
  );
};
export default App;
