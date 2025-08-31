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
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface SidebarProps {
  children: ReactNode;
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

  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/employee/dashboard",
      icon: <FaHome style={{ fontSize: 18 }} />,
      label: "หน้าหลัก",
      onClick: () => navigate("/employee")
    },
    {
      key: "/employee/orders",
      icon: <IoNewspaper style={{ fontSize: 18 }} />,
      label: "ออเดอร์",
      onClick: () => navigate("/employee/orders")
    },
    {
      key: "/employee/status",
      icon: <MdLocalLaundryService style={{ fontSize: 18 }} />,
      label: "สถานะ",
      onClick: () => navigate("/employee/status")
    },
    {
      key: "/employee/delivery",
      icon: <TbTruckDelivery style={{ fontSize: 18 }} />,
      label: "คิวขนส่ง",
      onClick: () => navigate("/employee/delivery")
    },
    {
      key: "/employee/check",
      icon: <FaShirt style={{ fontSize: 18 }} />,
      label: "รับผ้า",
      onClick: () => navigate("/employee/check")
    },
    {
      key: "/employee/inventory",
      icon: <IoStorefrontSharp style={{ fontSize: 18 }} />,
      label: "คลัง",
      onClick: () => navigate("/employee/inventory")
    },
    {
      key: "/employee/profile",
      icon: <FaUserCircle style={{ fontSize: 18 }} />,
      label: "โปรไฟล์",
      onClick: () => navigate("/employee/profile")
    }
  ];

  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ backgroundColor: "#0E4587", minHeight: "100vh" }}
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
          selectedKeys={[location.pathname]} // ✅ highlight ตาม path ปัจจุบัน
          items={menuItems}
          onClick={({ key }) => {
            const selected = menuItems.find(item => item.key === key);
            if (selected?.onClick) selected.onClick();
          }}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 20 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 20 }} />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 64, height: 64 }}
          />
          <span style={{ color: '#0E4587', fontSize: '20px', marginLeft: '16px' }}>
          </span>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 617,
            background: colorBgContainer,
            borderRadius: borderRadiusLG
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeSidebar;
