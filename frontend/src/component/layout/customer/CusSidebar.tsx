import React, { useState } from 'react';
import { FaHome, FaUserCircle, FaHistory } from "react-icons/fa";
import { MdLocalLaundryService, MdOutlinePayment, MdExitToApp } from "react-icons/md";
import { RiUserVoiceFill } from "react-icons/ri";
import { GiClothes } from "react-icons/gi";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

import { Button, Col, Layout, Menu, theme } from 'antd';
import iconWashing from '../../../assets/iconwashing.png';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;


interface SidebarProps {
  children?: React.ReactNode;
}

const CustomerSidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // ✅ เมนูลูกค้า — รูปแบบเดียวกับ EmployeeSidebar (key = path จริง + onClick)
  const menuItems = [
    {
      key: "/customer/home",
      icon: <FaHome style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>หน้าหลัก</span>,
      onClick: () => navigate("/customer/home"),
    },
    {
      key: "/customer/wash",
      icon: <GiClothes style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>ซัก-อบ</span>,
      onClick: () => navigate("/customer/orders"),
    },
    {
      key: "/customer/payment",
      icon: <MdOutlinePayment style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>ชำระเงิน</span>,
      onClick: () => navigate("/customer/payment"),
    },
    {
      key: "/customer/status",
      icon: <MdLocalLaundryService style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>สถานะ</span>,
      onClick: () => navigate("/customer/status"),
    },
    {
      key: "/customer/history",
      icon: <FaHistory style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>ประวัติ</span>,
      onClick: () => navigate("/customer/history"),
    },
    {
      key: "/customer/complaint",
      icon: <RiUserVoiceFill style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>แจ้งข้อร้องเรียน</span>,
      onClick: () => navigate("/customer/complaint"),
    },
    {
      key: "/customer/profile",
      icon: <FaUserCircle style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>โปรไฟล์</span>,
      onClick: () => navigate("/customer/profile"),
    },
  ];

  const logoutMenuItem = [
    {
      key: "logout",
      icon: <MdExitToApp style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>ออกจากระบบ</span>,
      onClick: () => {
        localStorage.clear();
        window.location.href = '/';
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', margin: 0 }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          backgroundColor: '#0E4587',
        }}
      >
        <div className="demo-logo-vertical" />
        {!collapsed && (
          <Col style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={iconWashing} alt="Washing Icon" width={100} height={100} />
            <h1
              style={{
                color: "white",
                margin: "-5px",
                fontSize: "18px",
                textAlign: "center",
              }}
            >
              NEATII.
            </h1>
          </Col>
        )}

        <Menu
          style={{ backgroundColor: '#0E4587', color: 'white' }}
          mode="inline"
          selectedKeys={[location.pathname]}  // ✅ ไฮไลท์ตาม path ปัจจุบัน (รูปแบบเดียวกัน)
          items={menuItems}
          onClick={({ key }) => {
            const selected = menuItems.find(item => item.key === key);
            if (selected?.onClick) selected.onClick();
          }}
        />
        <div style={{ position: 'absolute', bottom: 24, left: 0, width: '100%' }}>
          <Menu
            style={{ backgroundColor: '#0E4587', color: 'white', border: 'none' }}
            mode="inline"
            selectedKeys={[]}
            items={logoutMenuItem}
            onClick={({ key }) => {
              const selected = logoutMenuItem.find(item => item.key === key);
              if (selected?.onClick) selected.onClick();
            }}
          />
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <span style={{ color: '#0E4587', fontSize: '20px', marginLeft: '16px' }}>
            Customer Dashboard
          </span>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomerSidebar;
