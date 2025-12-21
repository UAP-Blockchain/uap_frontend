import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  Tooltip,
  theme,
  Dropdown,
  Avatar,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../redux/store";
import { logout } from "../redux/features/authSlice";
import { clearAllCookies } from "../utils/cookie";
import AuthServices from "../services/auth/api.service";
import "./index.scss";
const { Header } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const { token } = theme.useToken();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from Redux
  const userProfile = useSelector(
    (state: RootState) => state.auth?.userProfile
  );
  const email = userProfile?.email || "user@fpt.edu.vn";
  const username = email.split("@")[0] || "user";
  const fullName = userProfile?.fullName || username;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await AuthServices.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local state
      dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      clearAllCookies();
      navigate("/login");
    }
  };

  // Generate avatar color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      "#722ed1", // Purple
      "#1890ff", // Blue
      "#52c41a", // Green
      "#fa8c16", // Orange
      "#eb2f96", // Pink
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Determine home path based on role
  const homePath = useMemo(() => {
    const role = userProfile?.role;
    if (role === "Admin") return "/admin/dashboard";
    if (role === "Teacher") return "/teacher/classes";
    if (role === "Student") return "/student-portal/";
    return "/";
  }, [userProfile?.role]);

  // Dropdown menu items
  const menuItems: MenuProps["items"] = [
    {
      key: "user-info",
      label: (
        <div className="user-info-header">
          <Avatar
            size={40}
            style={{
              backgroundColor: getAvatarColor(username),
              flexShrink: 0,
            }}
          >
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <div className="user-info-text">
            <Text strong className="user-username">
              {fullName}
            </Text>
            <Text type="secondary" className="user-email">
              {email}
            </Text>
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "sign-out",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
    {
      type: "divider",
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
      className="site-layout-header"
      style={{
        padding: 0,
        background: token.colorBgContainer,
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        height: "64px",
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
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
        <Link to={homePath} className="logo-container">
          <img
            src="/image/z7310396057810_d32c375c6ada6e3edcb4bff25b5461b2.jpg"
            alt="FAP Blockchain Logo"
            className="logo-icon"
          />
          <span className="logo-text">UAP Blockchain</span>
        </Link>
      </div>

      <div className="header-right">
        <Dropdown
          menu={{ items: menuItems }}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="user-profile-dropdown"
        >
          <div className="user-profile-trigger">
            <Avatar
              size={32}
              style={{
                backgroundColor: getAvatarColor(username),
                flexShrink: 0,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Text className="user-profile-username">{fullName}</Text>
            <RightOutlined className="user-profile-chevron" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default HeaderComponent;
