import React from "react";
import { Card, Row, Col, Typography, Space, Avatar, Button } from "antd";
import {
  QrcodeOutlined,
  ShareAltOutlined,
  LinkOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import "./SharePortal.scss";

const { Title, Text } = Typography;

const SharePortal: React.FC = () => {
  return (
    <div className="share-portal">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          🔄 Share Portal
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}
        >
          Generate QR codes and verification links for your credentials
        </Text>
      </div>

      {/* Coming Soon Card */}
      <Card className="coming-soon-card" hoverable>
        <Row justify="center" align="middle" style={{ minHeight: "400px" }}>
          <Col span={24} style={{ textAlign: "center" }}>
            <Space direction="vertical" size="large">
              <Avatar
                size={120}
                style={{
                  backgroundColor: "#f0f5ff",
                  color: "#1890ff",
                  marginBottom: 16,
                }}
              >
                <QrcodeOutlined style={{ fontSize: 60 }} />
              </Avatar>

              <div>
                <Title
                  level={2}
                  style={{ color: "#1890ff", margin: "16px 0 8px" }}
                >
                  🚧 Coming Soon
                </Title>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    display: "block",
                    marginBottom: 24,
                  }}
                >
                  This page will allow you to generate QR codes and secure
                  verification links for your credentials.
                </Text>
              </div>

              <Row gutter={[16, 16]} justify="center">
                <Col xs={24} sm={8}>
                  <Card hoverable className="feature-card">
                    <QrcodeOutlined
                      style={{
                        fontSize: 32,
                        color: "#52c41a",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={4}>QR Code Generator</Title>
                    <Text type="secondary">
                      Generate secure QR codes for quick credential sharing
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable className="feature-card">
                    <LinkOutlined
                      style={{
                        fontSize: 32,
                        color: "#1890ff",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={4}>Verification Links</Title>
                    <Text type="secondary">
                      Create shareable verification links with expiration
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable className="feature-card">
                    <ShareAltOutlined
                      style={{
                        fontSize: 32,
                        color: "#722ed1",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={4}>Social Sharing</Title>
                    <Text type="secondary">
                      Share to LinkedIn, email, and other platforms
                    </Text>
                  </Card>
                </Col>
              </Row>

              <Button
                type="primary"
                size="large"
                icon={<SettingOutlined />}
                style={{ marginTop: 24 }}
                disabled
              >
                Configure Sharing Settings
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SharePortal;
