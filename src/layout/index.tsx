import { Breadcrumb, Layout } from "antd";
import React, { useState } from "react";

import { Link, useLocation } from "react-router-dom";
import HeaderComponent from "./header";
import "./index.scss";
import SiderComponent from "./siderAdmin";

const { Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  breadcrumbItems?: { title: string; href?: string }[];
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  breadcrumbItems,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // Generate default breadcrumb items based on the current path if not provided
  const generateDefaultBreadcrumbs = () => {
    if (breadcrumbItems) {
      return breadcrumbItems.map((item) => ({
        title: item.href ? (
          <Link to={item.href}>{item.title}</Link>
        ) : (
          item.title
        ),
      }));
    }

    const paths = pathname?.split("/").filter(Boolean) || [];

    // Route name mapping
    const routeNameMap: Record<string, string> = {
      "student-portal": "Student Portal",
      dashboard: "Dashboard",
      credentials: "Credentials",
      timetable: "Timetable",
      "attendance-report": "Attendance Report",
      "grade-report": "Grade Report",
      profile: "Profile",
      share: "Share Portal",
      "course-registration": "Course Registration",
      "class-list": "Class List",
      activity: "Activity Detail",
      instructor: "Instructor Detail",
      "credential-detail": "Credential Detail",
      "my-credentials": "My Credentials",
    };

    // For student-portal routes, create breadcrumb with "Student Portal" as first item
    if (paths[0] === "student-portal") {
      const breadcrumbs: Array<{ title: React.ReactNode }> = [
        {
          title: <Link to="/student-portal">Student Portal</Link>,
        },
      ];

      // If only student-portal, add Dashboard
      if (paths.length === 1) {
        breadcrumbs.push({
          title: "Dashboard",
        });
      } else {
        // Add sub-routes
        const subPaths = paths.slice(1);
        subPaths.forEach((path, index) => {
          const href = "/" + paths.slice(0, index + 2).join("/");
          const displayName =
            routeNameMap[path] ||
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
          breadcrumbs.push({
            title:
              index === subPaths.length - 1 ? (
                displayName
              ) : (
                <Link to={href}>{displayName}</Link>
              ),
          });
        });
      }
      return breadcrumbs;
    }

    // Default breadcrumb generation for other routes
    return paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const pathTitle =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      const displayName = pathTitle.replace(/(quan-li|quản-lý)/i, "Quản lý");
      const isLast = index === paths.length - 1;

      return {
        title: isLast ? displayName : <Link to={href}>{displayName}</Link>,
      };
    });
  };

  const items = generateDefaultBreadcrumbs();

  // Render the layout with a stable structure for both server and client
  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <HeaderComponent collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout>
        <SiderComponent collapsed={collapsed} />

        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            marginTop: 54,
            transition: "margin 0.2s",
          }}
        >
          <Content className="admin-content-wrapper">
            {/* Breadcrumb navigation */}
            <div style={{ marginBottom: 16 }}>
              <Breadcrumb items={items} />

              {/* {(title || subtitle) && (
                <div className="page-title-section">
                  {title && <h1 className="page-title">{title}</h1>}
                  {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
              )} */}
            </div>

            <div className="content-container">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
