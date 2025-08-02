import React from 'react';
// import PNG แทน SVG
import iconWashing from '../assets/iconwashing.png';

type Props = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = [
  { key: 'home', label: 'หน้าหลัก' },
  { key: 'about', label: 'ออเดอร์' },
  { key: 'status', label: 'สถานะ' },
  { key: 'queue', label: 'คิวขนส่ง' },
  { key: 'stock', label: 'คลัง' },
  { key: 'check', label: 'รับผ้า' },
  { key: 'profile', label: 'โปรไฟล์' },
];

const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        width: '150px',
        color: 'white',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: '100vh',
      }}
    >
      {/* ส่วนแสดงโลโก้ PNG ด้านบน */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <img src={iconWashing} alt="Washing Icon" width={150} height={150} />
      </div>

      {/* ปุ่มเมนู */}
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            aria-pressed={isActive}
            style={{
              backgroundColor: isActive ? 'white' : '#0E4587',
              color: isActive ? '#0E4587' : 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '40px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: isActive ? '600' : '400',
              transition: 'background-color 0.3s, color 0.3s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;