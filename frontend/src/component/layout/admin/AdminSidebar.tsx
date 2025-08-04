import React, { useState } from 'react';
import { FaHome,FaUserFriends } from "react-icons/fa";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Col, Layout, Menu, theme } from 'antd';
import iconWashing from '../../../assets/iconwashing.png';
import { LiaUserCogSolid } from "react-icons/lia";
import { TbSettings } from "react-icons/tb";
const { Header, Sider, Content } = Layout;

interface SidebarProps {
  children?: React.ReactNode;
}

const AdminSidebar: React.FC<SidebarProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
          <Col style={{ marginBottom: '20px',display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={iconWashing} alt="Washing Icon" width={100} height={100} />
            <h1
            style={{
              color: "white",
              margin: "-5px",
              fontSize: "18px",
              textAlign: "center",
            }}
          >
            Admin
    
          </h1>
        </Col>
          
          
        )}
        <Menu
        //   theme="#0E4587"
          style={{ backgroundColor: '#0E4587', color: 'white' }}  
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            { key: '1', icon: <FaHome style={{fontSize: "18px" , color: "#6da3d3"}} />, label: <span style={{ color: '#6da3d3' }}>หน้าหลัก</span>},
            { key: '2', icon: <LiaUserCogSolid  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>พนังงาน</span> },
            { key: '3', icon: <TbSettings  style={{fontSize: "18px" , color: "#6da3d3"}}/>, label: <span style={{ color: '#6da3d3' }}>จัดการสิทธิ์</span> },
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
            <span style={{ color: '#0E4587', fontSize: '20px', marginLeft: '16px' }}>Admin Dashboard</span>
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

export default AdminSidebar;
