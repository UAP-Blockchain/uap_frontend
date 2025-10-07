import React, { useState } from "react";
import { Layout } from "antd";
import HeaderTeacher from "./header";
import SiderTeacher from "./siderTeacher";
import "./index.scss";

const { Content } = Layout;

interface LayoutTeacherProps {
  children: React.ReactNode;
}

const LayoutTeacher: React.FC<LayoutTeacherProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderTeacher collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout hasSider>
        <SiderTeacher collapsed={collapsed} />
        <Layout
          style={{
            marginLeft: collapsed ? 80 : 240,
            marginTop: 64,
            transition: "margin-left 0.2s",
          }}
        >
          <Content
            style={{
              margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: "#fff",
              borderRadius: 8,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default LayoutTeacher;
