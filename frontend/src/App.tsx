import React from "react";
import { Routes, Route } from "react-router-dom";
import { UserProvider } from "./hooks/UserContext";
import { RequireRole } from "./routes/guards";
import EmployeePage from "./pages/employee"; // index.tsx
import LaundryCheckPage from "./pages/laundryCheck"; // index.tsx
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
import StatusPage from "./pages/LaundryProcess/StatusPage";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterForm />} />

        {/* Employee */}
        <Route path="/employee">
          <Route path="dashboard" element={<RequireRole role="employee"><EmployeeHome /></RequireRole>} />
          <Route path="orders" element={<RequireRole role="employee"><StatusUpdate /></RequireRole>} />
          <Route path="orders/:orderId" element={<RequireRole role="employee"><OrderDetail /></RequireRole>} />
          <Route path="delivery" element={<RequireRole role="employee"><TransportQueuePage /></RequireRole>} />
          <Route path="check" element={<RequireRole role="employee"><LaundryCheckPage /></RequireRole>} />
          <Route path="laundry-history" element={<RequireRole role="employee"><LaundryHistoryPage /></RequireRole>} />
          <Route path="inventory" element={<RequireRole role="employee"><StockEmpPage /></RequireRole>} />
          <Route path="profile" element={<RequireRole role="employee"><EmployeeProfile /></RequireRole>} />
          <Route path="complaint" element={<RequireRole role="employee"><ComplaintAdminPage /></RequireRole>} />
        </Route>

        {/* Admin */}
        <Route path="/admin">
          <Route path="employees" element={<RequireRole role="admin"><EmployeePage /></RequireRole>} />
          <Route path="customers" element={<RequireRole role="admin"><CustomerManagement /></RequireRole>} />
          <Route path="promotions" element={<RequireRole role="admin"><PromotionManagement /></RequireRole>} />
          <Route path="stock" element={<RequireRole role="admin"><StockAdminPage /></RequireRole>} />
        </Route>

        {/* Customer */}
        <Route path="/customer">
          <Route path="status" element={<RequireRole role="customer"><StatusPage /></RequireRole>} />
          <Route path="complaint" element={<RequireRole role="customer"><CustomerComplaintPage /></RequireRole>} />
          <Route path="payment" element={<RequireRole role="customer"><Payment /></RequireRole>} />
          <Route path="orders" element={<RequireRole role="customer"><OrderPage /></RequireRole>} />
          <Route path="history" element={<RequireRole role="customer"><HistoryPage /></RequireRole>} />
          <Route path="home" element={<RequireRole role="customer"><CustomerHomePage /></RequireRole>} />
          <Route path="profile" element={<RequireRole role="customer"><Profile /></RequireRole>} />
        </Route>
      </Routes>
    </UserProvider>
  );
};

export default App;
