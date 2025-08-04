// components/Content.tsx
import React from 'react';

type Props = {
  activeTab: string;
};

const Content: React.FC<Props> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <h1>หน้าหลัก</h1>;
      case 'about':
        return <h1>ออเดอร์</h1>;
      case 'status':
        return <h1>สถานะ</h1>;
      case 'queue':
          return <h1>คิวขนส่ง</h1>;
      case 'stock':
        return <h1>คลัง</h1>;
      case 'check':
        return <h1>รับผ้า</h1>;
      case 'profile':
        return <h1>โปรไฟล์</h1>;
      default:
      return <h1>ไม่พบหน้า</h1>;

    }
  };

  return (
    <div style={{
      flex: 1,
      backgroundColor: '#0E4587',
      padding: '100px'
    }}>
      {renderContent()}
    </div>
  );
};

export default Content;
