import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
import StatusUpdate from "./pages/LaundryProcess/StatusUpdate";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import EmployeeHome from "./pages/Home/EmployeeHome";
import TransportQueuePage from "./pages/Queue/TransportQueuePage";
import OrderDetail from "./pages/LaundryProcess/OrderDetail";
import EmpSidebar from "./component/layout/Sidebar/EmpSidebar"; 
import CustomerSidebar from "./component/layout/Sidebar/CusSidebar"; 
import StatusPage from "./pages/LaundryProcess/StatusPage";
// import EmpSidebar from "./component/layout/employee/empSidebar";
//import CustomerSidebar from "./component/layout/customer/CusSidebar";

const App: React.FC = () => {
  return (

          <Routes>
           
            <Route path="/Home" element={<EmployeeHome />} />
            <Route path="/order" element={<StatusUpdate/>} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/TransportQueuePage" element={<TransportQueuePage/>} />
            <Route path="/store" element={<EmployeeHome />} />
            {/* <Route path="/profile" element={<StatusPage />} />
            <Route path="/OrderPage" element={<OrderPage />} />
            <Route path="/HistoryPage" element={<HistoryPage />} />
            <Route path="/StockEmpPage" element={<StockEmpPage />} />
            <Route path="/StockAdminPage" element={<StockAdminPage />} /> */}
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

