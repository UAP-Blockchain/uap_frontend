import React from "react";
import { Avatar, Button, Card, Col, Row, Space, Typography } from "antd";
import {
  LinkOutlined,
  QrcodeOutlined,
  SettingOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import "./SharePortal.scss";

const { Title, Text } = Typography;

const SharePortal: React.FC = () => {
  return (
    <div className="share-portal">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          Cổng chia sẻ
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}
        >
          Tạo mã QR và liên kết xác thực cho chứng chỉ của bạn
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
                  color: "#1a94fc",
                  marginBottom: 16,
                }}
              >
                <QrcodeOutlined style={{ fontSize: 60 }} />
              </Avatar>

              <div>
                <Title
                  level={2}
                  style={{ color: "#1a94fc", margin: "16px 0 8px" }}
                >
                  🚧 Sắp ra mắt
                </Title>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#666",
                    display: "block",
                    marginBottom: 24,
                  }}
                >
                  Trang này sẽ cho phép bạn tạo mã QR và liên kết xác thực an
                  toàn cho chứng chỉ của bạn.
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
                    <Title level={4}>Trình tạo mã QR</Title>
                    <Text type="secondary">
                      Tạo mã QR an toàn để chia sẻ chứng chỉ nhanh chóng
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card hoverable className="feature-card">
                    <LinkOutlined
                      style={{
                        fontSize: 32,
                        color: "#1a94fc",
                        marginBottom: 16,
                      }}
                    />
                    <Title level={4}>Liên kết xác thực</Title>
                    <Text type="secondary">
                      Tạo liên kết xác thực có thể chia sẻ với thời hạn hết hạn
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
                    <Title level={4}>Chia sẻ xã hội</Title>
                    <Text type="secondary">
                      Chia sẻ lên LinkedIn, email và các nền tảng khác
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
                Cấu hình cài đặt chia sẻ
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SharePortal;
