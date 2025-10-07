"use client";

import {
  DashboardOutlined,
  CalendarOutlined,
  
  EditOutlined,
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

interface SiderProps {
  collapsed: boolean;
}

const SiderTeacher: React.FC<SiderProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const pathname = window?.location?.pathname || "";
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // Get current selected menu item based on path
  useEffect(() => {
    if (pathname) {
      // For the home page
      if (pathname === "/teacher" || pathname === "/teacher/") {
        setSelectedKeys(["/teacher/dashboard"]);
      }
      // For specific teacher pages, match with the second path segment
      else if (pathname.startsWith("/teacher/")) {
        const pathSegments = pathname.split("/");
        if (pathSegments.length >= 3) {
          setSelectedKeys([`/teacher/${pathSegments[2]}`]);
        }
      }
    }
    setMounted(true);
  }, [pathname]);

  // Prevent hydration mismatch by returning minimal sidebar
  if (!mounted) {
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={true}
        width={240}
        className="sidebar-layout teacher-sidebar"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 64,
          bottom: 0,
        }}
      />
    );
  }

  // Main navigation items for teacher
  const mainNavItems = [
    {
      key: "/teacher/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      "data-index": 0,
    },
    {
      key: "/teacher/schedule",
      icon: <CalendarOutlined />,
      label: "Thời khóa biểu",
      "data-index": 1,
    },
    {
      key: "/teacher/classes",
      icon: <BookOutlined />,
      label: "Lớp học của tôi",
      "data-index": 2,
    },
    {
      key: "/teacher/attendance",
      icon: <UserOutlined />,
      label: "Điểm danh",
      "data-index": 3,
    },
    {
      key: "/teacher/grading",
      icon: <EditOutlined />,
      label: "Chấm điểm",
      "data-index": 4,
    },
    {
      key: "/teacher/results",
      icon: <TrophyOutlined />,
      label: "Kết quả học tập",
      "data-index": 5,
    },
  ];

  // Additional tools for teacher
  const toolsNavItems = [
    {
      key: "/teacher/students",
      icon: <TeamOutlined />,
      label: "Danh sách học sinh",
      "data-index": 0,
    },
    {
      key: "/teacher/reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo thống kê",
      "data-index": 1,
    },
    {
      key: "/teacher/materials",
      icon: <FileTextOutlined />,
      label: "Tài liệu giảng dạy",
      "data-index": 2,
    },
  ];

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={240}
      className="sidebar-layout teacher-sidebar"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 64, // Height of the header
        bottom: 0,
      }}
    >
      <div className="sidebar-menu-container">
        {/* Main Navigation */}
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={({ key }) => navigate(key)}
          className="sidebar-menu"
          items={mainNavItems.map((item) => ({
            ...item,
            style: {
              "--item-index": item["data-index"],
            } as React.CSSProperties,
          }))}
        />

        {/* Tools Section */}
        {!collapsed && (
          <>
            <div className="menu-divider" />
            <div className="sidebar-section-title">Công cụ hỗ trợ</div>
            <Menu
              theme="light"
              mode="inline"
              selectedKeys={selectedKeys}
              className="sidebar-menu"
              items={toolsNavItems.map((item) => ({
                ...item,
                style: {
                  "--item-index": item["data-index"],
                } as React.CSSProperties,
              }))}
              onClick={({ key }) => navigate(key)}
            />
          </>
        )}

        {/* Footer Section */}
        {!collapsed && (
          <>
            <div className="menu-divider" />
            <div className="sidebar-footer">
              <div className="footer-link">Hướng dẫn sử dụng</div>
              <div className="footer-link">Hỗ trợ kỹ thuật</div>
              <div className="footer-link">Liên hệ</div>
              <div className="footer-copyright">
                © 2024 Teacher Portal System
              </div>
            </div>
          </>
        )}
      </div>
    </Sider>
  );
};

export default SiderTeacher;
