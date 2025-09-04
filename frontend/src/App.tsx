import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import EmployeeHome from "./pages/Home/EmployeeHome";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";
import OrderDetail from "./pages/LaundryProcess/OrderDetail"; 
import CustomerSidebar from "./component/layout/customer/CusSidebar";
import StatusPage from "./pages/LaundryProcess/StatusPage";
// import EmpSidebar from "./component/layout/employee/empSidebar";
//import CustomerSidebar from "./component/layout/customer/CusSidebar";
import OrderPage from "./pages/orders/create";
import HistoryPage from "./pages/orders/history";
import StockEmpPage from "./pages/stock/employee";
import StockAdminPage from "./pages/stock/Admin";

const App: React.FC = () => {
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/employee/dashboard" element={<EmployeeHome />} />
            <Route path="/employee/orders" element={<StatusUpdate/>} />
            <Route path="/employee/orders/:orderId" element={<OrderDetail />} />
            <Route path="/employee/delivery" element={<TransportQueuePage/>} />
            <Route path="/employee/inventory" element={<StockEmpPage />} />
            <Route path="/employee/profile" element={<StatusPage />} />
            
            </Routes>
           {/* <OrderPage></OrderPage> */}
            
      {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      {/* <AdminSidebar></AdminSidebar> */}
      {/* <EmpSidebar></EmpSidebar> */}
      {/*<CustomerSidebar></CustomerSidebar>*/}
      {/* <OrderPage></OrderPage>
      <HistoryPage></HistoryPage>
      <StockEmpPage></StockEmpPage>
      <StockAdminPage></StockAdminPage> */}
      
      
    </BrowserRouter>
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

