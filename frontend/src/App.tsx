import React, { useState } from "react";
import AdminSidebar from "./component/layout/sidebar";
import Background from "./component/background";


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      {/* <Background activeTab={activeTab} setActiveTab={setActiveTab} /> */}
      <AdminSidebar></AdminSidebar>
      
    </>
  );
};

export default App;
