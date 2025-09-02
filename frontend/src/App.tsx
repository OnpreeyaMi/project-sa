import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CustomerSidebar from './component/layout/customer/CusSidebar';
import Payment from './pages/payment/create/index';
// import Complaint from './pages/complaint/index';
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