import { Breadcrumb, Layout } from "antd";
import React, { useState } from "react";

import { Link } from "react-router-dom";
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
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  // Generate default breadcrumb items based on the current path if not provided
  const generateDefaultBreadcrumbs = () => {
    if (breadcrumbItems) return breadcrumbItems;

    const paths = pathname?.split("/").filter(Boolean) || [];
    return [
      ...paths.map((path, index) => {
        const href = "/" + paths.slice(0, index + 1).join("/");
        const pathTitle =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        return {
          title: pathTitle.replace(/(quan-li|quản-lý)/i, "Quản lý"),
          href,
        };
      }),
    ];
  };

  const items = generateDefaultBreadcrumbs();

  // Render the layout with a stable structure for both server and client
  return (
    <Layout style={{ minHeight: "95vh" }}>
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
            <div className="">
              <Breadcrumb
                className=""
                items={items.map((item) => ({
                  title: item.href ? (
                    <Link to={item.href}>{item.title}</Link>
                  ) : (
                    item.title
                  ),
                }))}
              />

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
