// components/Content.tsx
import React from 'react';

type Props = {
  activeTab: string;
};

const Content: React.FC<Props> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <h2>🏠 หน้าหลัก</h2>;
      case 'about':
        return <h2>ℹ️ เกี่ยวกับเรา</h2>;
      case 'contact':
        return <h2>📞 ติดต่อ</h2>;
      default:
        return <h2>ออเดอร์วันนี้</h2>;
    }
  };

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0E4587',
      padding: '40px'
    }}>
      {renderContent()}
    </div>
  );
};

export default Content;
