import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Button,
  Space,
  Typography,
  theme,
} from "antd";
import {
  HomeOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import "./index.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function StudentPortal() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Student mock data
  const studentInfo = {
    name: "Nguyễn Văn Hoàng",
    studentId: "SE171234",
    email: "hoang.nv@fpt.edu.vn",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format",
  };

  // Menu items
  const menuItems = [
    {
      key: "",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/student-portal"),
    },
    {
      key: "credentials",
      icon: <FileTextOutlined />,
      label: "My Credentials",
      onClick: () => navigate("/student-portal/credentials"),
    },
    {
      key: "timetable",
      icon: <CalendarOutlined />,
      label: "Weekly Timetable",
      onClick: () => navigate("/student-portal/timetable"),
    },
    {
      key: "attendance-report",
      icon: <FileSearchOutlined />,
      label: "Attendance Report",
      onClick: () => navigate("/student-portal/attendance-report"),
    },
    {
      key: "grade-report",
      icon: <BarChartOutlined />,
      label: "Grade Report",
      onClick: () => navigate("/student-portal/grade-report"),
    },
    {
      key: "share",
      icon: <ShareAltOutlined />,
      label: "Share Portal",
      onClick: () => navigate("/student-portal/share"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => navigate("/student-portal/profile"),
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile Settings",
      onClick: () => navigate("/student-portal/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  // Get current selected key based on pathname
  const getCurrentKey = () => {
    const path = location.pathname.replace("/student-portal/", "");
    if (path === "/student-portal" || path === "") return "";
    return path.split("/")[0];
  };

  return (
    <div className="student-portal-layout">
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="student-sider"
          theme="light"
          width={280}
          style={{
            background: colorBgContainer,
            borderRight: "1px solid #f0f0f0",
          }}
        >
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">🎓</span>
              {!collapsed && (
                <Title level={4} className="logo-text">
                  Student Portal
                </Title>
              )}
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[getCurrentKey()]}
            items={menuItems}
            className="student-menu"
          />
        </Sider>

        <Layout>
          <Header
            className="student-header"
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
            </div>

            <div className="header-right">
              <Space size="middle">
                <div className="user-info">
                  <Text strong>{studentInfo.name}</Text>
                  <Text type="secondary" className="student-id">
                    {studentInfo.studentId}
                  </Text>
                </div>
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Avatar
                    size="large"
                    src={studentInfo.avatar}
                    className="user-avatar"
                    style={{ cursor: "pointer" }}
                  />
                </Dropdown>
              </Space>
            </div>
          </Header>

          <Content
            className="student-content"
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

export default StudentPortal;
