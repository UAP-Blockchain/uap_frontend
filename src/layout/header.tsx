import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  RightOutlined,
  LockOutlined,
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
import { useEffect, useState } from "react";
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
  const [searchFocused, setSearchFocused] = useState(false);
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
      key: "view-profile",
      icon: <UserOutlined />,
      label: "View Profile",
      onClick: () => {
        // Navigate to profile page based on role
        if (userProfile?.roleCode === "R4") {
          navigate("/student-portal/profile");
        } else {
          navigate("/admin/students");
        }
      },
    },
    {
      key: "theme",
      icon: <GlobalOutlined />,
      label: (
        <div className="theme-menu-item">
          <span>Theme</span>
          <RightOutlined className="theme-arrow" />
        </div>
      ),
      children: [
        {
          key: "light",
          label: "Light",
        },
        {
          key: "dark",
          label: "Dark",
        },
        {
          key: "auto",
          label: "Auto",
        },
      ],
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Change Password",
      onClick: () => navigate("/change-password"),
    },
    {
      type: "divider",
    },
    {
      key: "sign-out",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
    {
      type: "divider",
    },
    {
      key: "footer",
      label: (
        <div className="dropdown-footer">
          <Text type="secondary" className="footer-link">
            Terms of Service
          </Text>
          <Text type="secondary" className="footer-link">
            Privacy
          </Text>
        </div>
      ),
      disabled: true,
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
        <Link to="/admin/dashboard" className="logo-container">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="logo-icon"
          >
            <path
              d="M12 2L2 7V10C2 16.37 6.4 22.16 12 23C17.6 22.16 22 16.37 22 10V7L12 2ZM12 9C13.1 9 14 9.9 14 11S13.1 13 12 13S10 12.1 10 11S10.9 9 12 9ZM18 17H6V16C6 14 10 12.9 12 12.9S18 14 18 16V17Z"
              fill="currentColor"
            />
          </svg>
          <span className="logo-text">FAP Blockchain</span>
        </Link>
      </div>

      <div className="header-center">
        <div className={`search-container ${searchFocused ? "focused" : ""}`}>
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên, giảng viên, lớp học..."
            className="search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <Button
            type="primary"
            className="search-button"
            icon={<SearchOutlined />}
          />
        </div>
      </div>

      <div className="header-right">
        <Tooltip title="Trợ giúp">
          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            className="icon-button"
          />
        </Tooltip>

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
