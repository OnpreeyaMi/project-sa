import React, { useState } from "react";
// import AdminSidebar from "./component/layout/admin/AdminSidebar";
// import Background from "./component/background";
// import EmpSidebar from "./component/layout/employee/empSidebar";
//import CustomerSidebar from "./component/layout/customer/CusSidebar";
import OrderPage from "./pages/orders/create";
import HistoryPage from "./pages/orders/history";
import StockEmpPage from "./pages/stock/employee";
import StockAdminPage from "./pages/stock/Admin";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      {/* <AdminSidebar></AdminSidebar> */}
      {/* <EmpSidebar></EmpSidebar> */}
      {/*<CustomerSidebar></CustomerSidebar>*/}
      <OrderPage></OrderPage>
      <HistoryPage></HistoryPage>
      <StockEmpPage></StockEmpPage>
      <StockAdminPage></StockAdminPage>
      
      
    </>
  );
};

export default App;
