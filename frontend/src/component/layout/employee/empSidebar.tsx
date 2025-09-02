import React, { useState, type ReactNode } from 'react';
import { FaHome } from "react-icons/fa";
import { IoNewspaper } from "react-icons/io5";
import { MdLocalLaundryService } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { FaShirt } from "react-icons/fa6";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Col, Layout, Menu, theme } from 'antd';
import iconWashing from '../../../assets/iconwashing.png';
import { LiaUserCogSolid } from "react-icons/lia";
import { TbSettings } from "react-icons/tb";
import { RiUserVoiceFill } from "react-icons/ri";
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface SidebarProps {
  children?: React.ReactNode;
}

const EmployeeSidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // ✅ ใช้งาน useNavigate
  const location = useLocation(); // ✅ ใช้งาน useLocation

  const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

  // ✅ เมนูพร้อม navigate
  const menuItems = [
    {
      key: "/employee/dashboard",
      icon: <FaHome style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>หน้าหลัก</span>,
      onClick: () => navigate("/employee/dashboard"),
    },
    {
      key: "/employee/orders",
      icon: <IoNewspaper style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>ออเดอร์</span>,
      onClick: () => navigate("/employee/orders"),
    },
    {
      key: "/employee/delivery",
      icon: <TbTruckDelivery style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>คิวขนส่ง</span>,
      onClick: () => navigate("/employee/delivery"),
    },
    {
      key: "/employee/check",
      icon: <FaShirt style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>รับผ้า</span>,
      onClick: () => navigate("/employee/check"),
    },
    {
      key: "/employee/inventory",
      icon: <MdLocalLaundryService style={{ fontSize: 18, color: '#6da3d3' }} />,
      label: <span style={{ color: '#6da3d3' }}>คลัง</span>,
      onClick: () => navigate("/employee/inventory"),
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
          defaultSelectedKeys={['1']}
          onClick={({ key }) => {
            if (key === '7') {
              navigate('/complaint/reply');
            }
          selectedKeys={[location.pathname]} // ✅ highlight ตาม path ปัจจุบัน
          items={menuItems}
          onClick={({ key }) => {
            const selected = menuItems.find(item => item.key === key);
            if (selected?.onClick) selected.onClick();
          }}
          items={[
            { key: '1', icon: <FaHome style={{fontSize: "18px" , color: "#6da3d3"}} />, label: <span style={{ color: '#6da3d3' }}>หน้าหลัก</span>},
            { key: '2', icon: <IoNewspaper style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>ออเดอร์</span> },
            { key: '3', icon: <MdLocalLaundryService  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>สถานะ</span> },
            { key: '4', icon: <TbTruckDelivery  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>คิวขนส่ง</span> },
            { key: '5', icon: <IoStorefrontSharp  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>คลัง</span> },
            { key: '6', icon: <FaUserCircle  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>โปรไฟล์</span> },
            { key: '7', icon: <RiUserVoiceFill   style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>ตอบกลับข้อร้องเรียน</span> },
            
          ]}
        />
        
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

export default EmployeeSidebar;

