import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerSidebar from './component/layout/customer/CusSidebar';
import Payment from './pages/payment/create/index';

import ComplaintCreate from './pages/complaint/complaintCreate'; // ถ้ามีไฟล์สำหรับ create
 import ComplaintReply from './pages/complaint/complaintReply'; // ถ้ามีไฟล์สำหรับ reply
 import EmpSidebar from './component/layout/employee/empSidebar';

function App() {
  return (
    <BrowserRouter>
      <CustomerSidebar>
        <Routes>
          <Route path="/payment" element={<Payment />} />
           
          <Route path="/complaint/create" element={<ComplaintCreate />} />
          
          
        </Routes>
      </CustomerSidebar>
      
          
      {/* <EmpSidebar>
        <Routes>
          <Route path="/complaint/reply" element={<ComplaintReply />} />
        </Routes>
      </EmpSidebar> */}
    </BrowserRouter>
  );
}

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

//           <Routes>
//             <Route path="/" element={<EmpSidebar />} />
//             <Route path="/Home" element={<EmployeeHome />} />
//             <Route path="/order" element={<StatusUpdate/>} />
//             <Route path="/orders/:orderId" element={<OrderDetail />} />
//             <Route path="/TransportQueuePage" element={<TransportQueuePage/>} />
//             <Route path="/store" element={<EmployeeHome />} />
//             <Route path="/profile" element={<StatusPage />} />
//             <Route path="/OrderPage" element={<OrderPage />} />
//             <Route path="/HistoryPage" element={<HistoryPage />} />
//             <Route path="/StockEmpPage" element={<StockEmpPage />} />
//             <Route path="/StockAdminPage" element={<StockAdminPage />} />
//             </Routes>
//       {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
//       {/* <AdminSidebar></AdminSidebar> */}
//       {/* <EmpSidebar></EmpSidebar> */}
//       {/*<CustomerSidebar></CustomerSidebar>*/}
//       <OrderPage></OrderPage>
//       <HistoryPage></HistoryPage>
//       <StockEmpPage></StockEmpPage>
//       <StockAdminPage></StockAdminPage>
      
      
//     </BrowserRouter>
//   );

// };

// export default App;

// //ระบบย่อย : จัดการกระบวนการซัก actor customer

// // const App: React.FC = () => {
// //   return (
// //     <BrowserRouter>
      
// //       <Routes>
// //         {/* เส้นทางอื่นๆ */}
// //         <Route path="/" element={<CustomerSidebar />}/>
// //         <Route path="/status" element={<StatusPage />} />
// //       </Routes>
   
// //     </BrowserRouter>
// //   );

// // };

// // export default App;

