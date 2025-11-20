import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
  theme,
} from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FlagOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuOutlined,
  SettingOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { PiStudentFill } from "react-icons/pi";
import "./index.scss";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

function StudentPortal() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  // Student mock data
  const studentInfo = {
    name: "Nghiêm Văn Hoàng",
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
      label: "Bảng điều khiển",
      onClick: () => navigate("/student-portal"),
    },
    {
      key: "roadmap",
      icon: <FlagOutlined />,
      label: "Lộ trình học tập",
      onClick: () => navigate("/student-portal/roadmap"),
    },
    {
      key: "credentials",
      icon: <FileTextOutlined />,
      label: "Chứng chỉ của tôi",
      onClick: () => navigate("/student-portal/credentials"),
    },
    {
      key: "timetable",
      icon: <CalendarOutlined />,
      label: "Thời khóa biểu",
      onClick: () => navigate("/student-portal/timetable"),
    },
    {
      key: "attendance-report",
      icon: <FileSearchOutlined />,
      label: "Báo cáo điểm danh",
      onClick: () => navigate("/student-portal/attendance-report"),
    },
    {
      key: "grade-report",
      icon: <BarChartOutlined />,
      label: "Báo cáo điểm",
      onClick: () => navigate("/student-portal/grade-report"),
    },
    {
      key: "share",
      icon: <ShareAltOutlined />,
      label: "Cổng chia sẻ",
      onClick: () => navigate("/student-portal/share"),
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ",
      onClick: () => navigate("/student-portal/profile"),
    },
  ];

  // User dropdown menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Cài đặt hồ sơ",
      onClick: () => navigate("/student-portal/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt tài khoản",
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
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
      <Layout style={{ height: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="student-sider"
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
                <PiStudentFill />
              </span>
              {!collapsed && (
                <Title level={4} className="logo-text">
                  Cổng sinh viên
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

export default StudentPortal;
