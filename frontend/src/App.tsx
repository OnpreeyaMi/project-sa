import React, { useState } from "react";

import Background from "./component/background";


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <>
      <Background activeTab={activeTab} setActiveTab={setActiveTab} />
      
    </>
  );
};

export default App;
