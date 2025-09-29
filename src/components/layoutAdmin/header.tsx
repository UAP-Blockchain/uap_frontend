import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Layout, Tooltip, theme } from "antd";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./index.scss";
const { Header } = Layout;

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      </div>
    </Header>
  );
};

export default HeaderComponent;
