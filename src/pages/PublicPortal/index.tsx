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
    token: { borderRadiusLG },
  } = theme.useToken();

  // Menu items cho Public Portal
  const menuItems = [
    {
      key: "",
      icon: <HomeOutlined />,
      label: "Trang chủ",
      onClick: () => navigate("/public-portal"),
    },
    {
      key: "verify",
      icon: <SafetyCertificateOutlined />,
      label: "Xác thực chứng chỉ",
      onClick: () => navigate("/public-portal/verify"),
    },
    {
      key: "history",
      icon: <HistoryOutlined />,
      label: "Lịch sử xác thực",
      onClick: () => navigate("/public-portal/history"),
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Trợ giúp & FAQ",
      onClick: () => navigate("/public-portal/help"),
    },
  ];

  // Quick access dropdown
  const quickAccessItems = [
    {
      key: "contact",
      icon: <PhoneOutlined />,
      label: "Liên hệ hỗ trợ",
    },
    {
      key: "api",
      icon: <GlobalOutlined />,
      label: "Tài liệu API",
    },
    {
      type: "divider" as const,
    },
    {
      key: "enterprise",
      label: "Giải pháp doanh nghiệp",
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
      <Layout style={{ height: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="public-sider"
          theme="light"
          width={280}
          style={{
            background: "#ffffff",
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">
                <SafetyCertificateOutlined />
              </span>
              {!collapsed && (
                <Title level={4} className="logo-text">
                  Xác thực Chứng chỉ
                </Title>
              )}
            </div>
            {!collapsed && (
              <Text type="secondary" className="logo-subtitle">
                Dành cho Nhà tuyển dụng & Tổ chức
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
                  Được tin tưởng bởi 500+ Tổ chức
                </Text>
                <div className="trust-logos">
                  <span style={{ opacity: 0.6 }}> FPT</span>
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
              background: "#ffffff",
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
                <Title level={3} className="brand-title">
                  Xác thực Chứng chỉ Blockchain
                </Title>
                <Text type="secondary">Tức thì, An toàn, Đáng tin cậy</Text>
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
                  Xác thực nhanh
                </Button>
                <Dropdown
                  menu={{ items: quickAccessItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button size="large">Dịch vụ khác</Button>
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content
            className="public-content"
            style={{
              margin: "24px",
              padding: "24px",
              background: "#ffffff",
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
