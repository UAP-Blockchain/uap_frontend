import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { Button, Layout, Tooltip, theme, Avatar, Dropdown, Badge } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const { Header } = Layout;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderTeacher: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  // Prevent SSR/Client mismatch by returning simplified header during server render
  if (!mounted) {
    return (
      <Header
        className="site-layout-header"
        style={{
          padding: 0,
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 1000,
          height: "64px",
        }}
      />
    );
  }

  return (
    <Header
      className="site-layout-header teacher-header"
      style={{
        padding: "0 24px",
        background: token.colorBgContainer,
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        height: "64px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div className="header-left">
        <Tooltip
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          placement="right"
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="toggle-btn"
            aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
          />
        </Tooltip>
        <Link to="/teacher/dashboard" className="logo-container">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-icon"
          >
            <path
              d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z"
              fill="currentColor"
            />
          </svg>
          <span className="logo-text">Teacher Portal</span>
        </Link>
      </div>

      <div className="header-right">
        <Tooltip title="Thông báo">
          <Badge count={3} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="icon-button"
            />
          </Badge>
        </Tooltip>

        <Tooltip title="Trợ giúp">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            className="icon-button"
          />
        </Tooltip>

        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow={{ pointAtCenter: true }}
        >
          <div className="user-info">
            <Avatar size="small" icon={<UserOutlined />} />
            <span className="username">GV. Nguyễn Văn A</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderTeacher;
