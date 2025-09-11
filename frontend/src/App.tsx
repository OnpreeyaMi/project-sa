import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./hooks/UserContext"; // import ให้ถูก path

import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
import LaundryHistoryPage from "./pages/laundryCheck/LaundryHistoryPage";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";
import Login from "./pages/login/login";
import RegisterForm from "./pages/register/register";
import EmployeeHome from "./pages/Home/EmployeeHome";
import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
import OrderDetail from "./pages/LaundryProcess/OrderDetail";

import StockEmpPage from "./pages/stock/employee"; // src/pages/stock/employee/index.tsx
import EmployeeProfile from "./pages/employee/EmployeeProfile";

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
import LaundryHistoryPage from "./pages/laundryCheck/LaundryHistoryPage";
import PurchaseHistoryPage from "./pages/stock/Admin/history";
import UsageHistoryPage from "./pages/stock/Admin/usage";
import DeleteHistoryPage from "./pages/stock/Admin/delete";

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
          {/* <Route path="check" element={<LaundryCheckPage />} /> */}
          <Route path="inventory" element={<StockEmpPage />} />
          <Route path="profile" element={<StatusPage />} />
          <Route path="complaint" element={<ComplaintAdminPage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin">
          <Route path="employees" element={<RequireRole role="admin"><EmployeePage /></RequireRole>} />
          <Route path="customers" element={<RequireRole role="admin"><CustomerManagement /></RequireRole>} />
          <Route path="promotions" element={<RequireRole role="admin"><PromotionManagement /></RequireRole>} />
          <Route path="stock" element={<RequireRole role="admin"><StockAdminPage /></RequireRole>} />
          <Route path="stock/history" element={<RequireRole role="admin"><PurchaseHistoryPage /></RequireRole>} />
          <Route path="stock/usage" element={<RequireRole role="admin"><UsageHistoryPage /></RequireRole>} />
          <Route path="stock/delete" element={<RequireRole role="admin"><DeleteHistoryPage /></RequireRole>} />
        </Route>

        {/* Customer routes */}
        <Route path="/customer">
          <Route path="profile" element={<Profile />} />
          <Route path="complaint" element={<CustomerComplaintPage />} />
          <Route path="payment" element={<Payment />} />
          <Route path="orders" element={<OrderPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="home" element={<CustomerHomePage />} />
        </Route>
      </Routes>
    </UserProvider>
  );
};

export default App;
