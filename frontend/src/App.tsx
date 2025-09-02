import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import EmployeePage from "./pages/employee";
import LaundryCheckPage from "./pages/laundryCheck";
import HomePage from "./pages/Home/EmployeeHome";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/employees" replace />} />
      <Route path="/employee/check" element={<LaundryCheckPage />} />
      <Route path="/employee/dashboard" element={<HomePage />} />
      <Route path="/employee/delivery" element={<TransportQueuePage />} />
      <Route path="/admin/employees" element={<EmployeePage />} />
      <Route path="*" element={<div style={{ padding: 20 }}>Route not found</div>} />
    </Routes>
    
  );

};
export default App;
// import React, { useState } from "react";
// // import AdminSidebar from "./component/layout/admin/AdminSidebar";
// // import Background from "./component/background";
// import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
// import { BrowserRouter , Routes, Route } from "react-router-dom";
// import EmployeeHome from "./pages/Home/EmployeeHome";
// import TransportQueuePage from "./pages/Queue/TransportQueuePage";
// import OrderDetail from "./pages/LaundryProcess/OrderDetail";
// import EmpSidebar from "./component/layout/Sidebar/EmpSidebar"; 
// import CustomerSidebar from "./component/layout/Sidebar/CusSidebar"; 
// import StatusPage from "./pages/LaundryProcess/StatusPage";
// // import EmpSidebar from "./component/layout/employee/empSidebar";
// //import CustomerSidebar from "./component/layout/customer/CusSidebar";
// import OrderPage from "./pages/orders/create";
// import HistoryPage from "./pages/orders/history";
// import StockEmpPage from "./pages/stock/employee";
// import StockAdminPage from "./pages/stock/Admin";

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
