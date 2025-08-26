import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
import EmpSidebar from "./component/layout/Sidebar/EmpSidebar";
import StatusUpdate from "./Feature/LaundryProcess/pages/StatusUpdate";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import HomePage from "./Roles/Employee/HomePage"; // สร้างใหม่ด้านล่าง
import TransportQueuePage from "./Feature/Queue/page/TransportQueuePage";
import OrderDetail from "./Feature/LaundryProcess/pages/OrderDetail"; // หน้ารายละเอียดออเดอร์ + อัพเดทสถานะ

import CustomerSidebar from "./component/layout/Sidebar/CusSidebar"; //หน้าลูกค้า
import StatusPage from "./Feature/LaundryProcess/pages/StatusPage";


const App: React.FC = () => {
  return (
    <BrowserRouter>

          <Routes>
            <Route path="/" element={<EmpSidebar />}/>
            <Route path="/Home" element={<HomePage />} />
            <Route path="/statusupdate" element={<StatusUpdate/>} />
            <Route path="/TransportQueuePage" element={<TransportQueuePage/>} />

            <Route path="/orders/:orderId" element={<OrderDetail />} />
            </Routes>
        
      
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

