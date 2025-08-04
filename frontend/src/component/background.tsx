import React from 'react';
import Sidebar from './sidebar';
import Content from './content';

interface BackgroundProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Background: React.FC<BackgroundProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div
      style={{
        width: '1440px',
        height: '1024px',
        margin: '20px auto',
        backgroundColor: '#0c3c78',
        borderRadius: '20px',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div
        style={{
          backgroundColor: '#fefeffff',
          flex: 1,
          padding: '40px',
          margin: '20px',
          marginLeft: 0,
          borderRadius: '20px',
          overflowY: 'auto',
        }}
      >
        <Content activeTab={activeTab} />
      </div>
    </div>
  );
};

export default Background;
