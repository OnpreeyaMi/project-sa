import Sidebar from "./component/sidebar";
import OrderPage from "./pages/orders/create";
import React from "react";
const App: React.FC = () => {
  //return <OrderPage />;
  return (
    <>
      <Sidebar activeTab={""} onTabChange={function (tab: string): void {
        throw new Error("Function not implemented.");
      } } />
    </>
  );
}

export default App;
