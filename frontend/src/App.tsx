import React, { useState } from "react";



const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      <Background activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </>
  );
};

export default App;
