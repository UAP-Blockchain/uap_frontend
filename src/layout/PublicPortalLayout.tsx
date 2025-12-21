import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Space, Typography, Drawer } from "antd";
import {
  HomeOutlined,
  SafetyCertificateOutlined,
  QuestionCircleOutlined,
  LoginOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import "./PublicPortalLayout.scss";

const { Header, Footer, Content } = Layout;
const { Title, Text } = Typography;

const PublicPortalLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Menu items cho Public Portal
  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Trang chủ",
    },
    {
      key: "verify",
      icon: <SafetyCertificateOutlined />,
      label: "Xác thực chứng chỉ",
    },
    {
      key: "results",
      icon: <SafetyCertificateOutlined />,
      label: "Kết quả xác thực",
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Trợ giúp",
    },
  ];

  // Get current selected key
  const getCurrentKey = () => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return "home";
    // Remove leading slash and get first segment
    const segments = path.split("/").filter(Boolean);
    return segments[0] || "home";
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "home") {
      navigate("/home");
    } else {
      navigate(`/${key}`);
    }
    // Close mobile menu after navigation
    setMobileMenuOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <Layout
      className="public-portal-layout"
      style={{ minHeight: "100vh", height: "auto" }}
    >
      <Header className="public-portal-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <SafetyCertificateOutlined className="logo-icon" />
              <Title level={4} className="logo-text">
                Xác thực Chứng chỉ
              </Title>
            </div>
          </div>

          <div className="header-center">
            <Menu
              mode="horizontal"
              selectedKeys={[getCurrentKey()]}
              items={menuItems}
              onClick={handleMenuClick}
              className="public-nav-menu"
            />
          </div>

          <div className="header-right">
            <Button
              className="mobile-menu-button"
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
            />
            <Button
              type="primary"
              icon={<LoginOutlined />}
              size="large"
              onClick={handleLogin}
              className="login-button"
            >
              Đăng nhập
            </Button>
          </div>
        </div>
      </Header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div className="drawer-header">
            <SafetyCertificateOutlined className="drawer-logo-icon" />
            <span className="drawer-logo-text">Xác thực Chứng chỉ</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-menu-drawer"
        width={280}
        bodyStyle={{ padding: 0, paddingBottom: 80 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[getCurrentKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          className="mobile-nav-menu"
        />
        <div className="drawer-footer">
          <Button
            type="primary"
            icon={<LoginOutlined />}
            block
            size="large"
            onClick={() => {
              handleLogin();
              setMobileMenuOpen(false);
            }}
          >
            Đăng nhập
          </Button>
        </div>
      </Drawer>

      <Content
        className="public-portal-content"
        style={{ overflow: "visible", height: "auto" }}
      >
        <Outlet />
      </Content>

      <Footer className="public-portal-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <Title level={5}>Về chúng tôi</Title>
              <Text type="secondary">
                Hệ thống xác thực chứng chỉ dựa trên công nghệ blockchain, đảm
                bảo tính minh bạch và bảo mật.
              </Text>
            </div>

            <div className="footer-section">
              <Title level={5}>Liên kết nhanh</Title>
              <Space direction="vertical" size="small">
                <Button type="link" onClick={() => navigate("/home")}>
                  Trang chủ
                </Button>
                <Button type="link" onClick={() => navigate("/verify")}>
                  Xác thực chứng chỉ
                </Button>
                <Button type="link" onClick={() => navigate("/help")}>
                  Trợ giúp
                </Button>
              </Space>
            </div>

            <div className="footer-section">
              <Title level={5}>Liên hệ</Title>
              <Space direction="vertical" size="small">
                <Text type="secondary">Email: support@fap.edu.vn</Text>
                <Text type="secondary">Hotline: 1900-xxxx</Text>
              </Space>
            </div>
          </div>

          <div className="footer-bottom">
            <Text type="secondary">
              © {new Date().getFullYear()} FAP Education. Tất cả quyền được bảo
              lưu.
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default PublicPortalLayout;
