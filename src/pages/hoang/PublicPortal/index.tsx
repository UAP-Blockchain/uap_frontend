import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Space, Typography, theme, Dropdown } from "antd";
import {
  HomeOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  MenuOutlined,
  GlobalOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import "./index.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function PublicPortal() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Menu items cho Public Portal
  const menuItems = [
    {
      key: "",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/public-portal"),
    },
    {
      key: "verify",
      icon: <SafetyCertificateOutlined />,
      label: "Verify Credentials",
      onClick: () => navigate("/public-portal/verify"),
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Verification History",
      onClick: () => navigate("/public-portal/history"),
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help & FAQ",
      onClick: () => navigate("/public-portal/help"),
    },
  ];

  // Quick access dropdown
  const quickAccessItems = [
    {
      key: "contact",
      icon: <PhoneOutlined />,
      label: "Contact Support",
    },
    {
      key: "api",
      icon: <GlobalOutlined />,
      label: "API Documentation",
    },
    {
      type: "divider" as const,
    },
    {
      key: "enterprise",
      label: "Enterprise Solutions",
    },
  ];

  // Get current selected key
  const getCurrentKey = () => {
    const path = location.pathname.replace("/public-portal/", "");
    if (path === "/public-portal" || path === "") return "";
    return path.split("/")[0];
  };

  return (
    <div className="public-portal-layout">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="public-sider"
          theme="light"
          width={280}
          style={{
            background: colorBgContainer,
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🏢</span>
              {!collapsed && (
                <Title level={4} className="logo-text">
                  Credential Verifier
                </Title>
              )}
            </div>
            {!collapsed && (
              <Text type="secondary" className="logo-subtitle">
                For Employers & Organizations
              </Text>
            )}
          </div>

          <Menu
            mode="inline"
            selectedKeys={[getCurrentKey()]}
            items={menuItems}
            className="public-menu"
          />

          {!collapsed && (
            <div className="sidebar-footer">
              <div className="trust-indicators">
                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block", marginBottom: 8 }}
                >
                  Trusted by 500+ Organizations
                </Text>
                <div className="trust-logos">
                  <span style={{ opacity: 0.6 }}>🏛️ FPT</span>
                  <span style={{ opacity: 0.6 }}>🏢 VNG</span>
                  <span style={{ opacity: 0.6 }}>🌐 Grab</span>
                </div>
              </div>
            </div>
          )}
        </Sider>

        <Layout>
          <Header
            className="public-header"
            style={{
              padding: "0 24px",
              background: colorBgContainer,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div className="header-left">
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="trigger"
              />
              <div className="header-brand">
                <Title level={3} style={{ margin: 0, color: "#722ed1" }}>
                  Blockchain Credential Verification
                </Title>
                <Text type="secondary">Instant, Secure, Trusted</Text>
              </div>
            </div>

            <div className="header-right">
              <Space size="middle">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  size="large"
                  onClick={() => navigate("/public-portal/verify")}
                >
                  Quick Verify
                </Button>
                <Dropdown
                  menu={{ items: quickAccessItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button size="large">More Services</Button>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content
            className="public-content"
            style={{
              margin: "24px",
              padding: "24px",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: "auto",
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
}

export default PublicPortal;
