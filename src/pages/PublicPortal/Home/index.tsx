import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Avatar,
  Steps,
  Badge,
} from "antd";
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  FileProtectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import "./Home.scss";

const { Title, Text, Paragraph } = Typography;

const PublicHome: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Nhập thông tin chứng chỉ",
      description: "Quét mã QR, nhập ID, hoặc tải lên file",
      icon: <SearchOutlined style={{ color: "#1890ff" }} />,
    },
    {
      title: "Xác thực Blockchain",
      description: "Kiểm tra trên sổ cái bất biến",
      icon: <SafetyCertificateOutlined style={{ color: "#52c41a" }} />,
    },
    {
      title: "Nhận kết quả",
      description: "Xác thực tức thì với báo cáo chi tiết",
      icon: <CheckCircleOutlined style={{ color: "#1890ff" }} />,
    },
  ];

  const features = [
    {
      icon: <ClockCircleOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Xác thực tức thì",
      description: "Nhận kết quả trong vài giây, không phải vài ngày",
      color: "#e6f7ff",
    },
    {
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: "#52c41a" }} />
      ),
      title: "100% An toàn",
      description: "Xác thực chống giả mạo bằng công nghệ blockchain",
      color: "#f6ffed",
    },
    {
      icon: <GlobalOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Công nhận toàn cầu",
      description: "Được xác thực bởi 500+ tổ chức trên toàn thế giới",
      color: "#e6f7ff",
    },
    {
      icon: <FileProtectOutlined style={{ fontSize: 48, color: "#36cfc9" }} />,
      title: "Không gian lận",
      description: "Loại bỏ chứng chỉ giả bằng bằng chứng blockchain",
      color: "#e6fffb",
    },
  ];

  return (
    <div className="public-home">
      {/* Hero Section */}
      <Card className="hero-card">
        <Row align="middle" gutter={[48, 32]}>
          <Col xs={24} lg={14}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={1} className="hero-title">
                  Xác thực Chứng chỉ Học thuật
                  <br />
                  <span className="highlight">Tức thì & An toàn</span>
                </Title>
                <Paragraph className="hero-description">
                  Tin tưởng nhưng phải xác minh. Nền tảng blockchain của chúng
                  tôi giúp nhà tuyển dụng xác thực chứng chỉ học thuật trong vài
                  giây, loại bỏ gian lận và tiết kiệm thời gian trong quy trình
                  tuyển dụng.
                </Paragraph>
              </div>

              <Space size="large" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => navigate("/verify")}
                  className="cta-button"
                >
                  Bắt đầu xác thực
                </Button>
                <Button size="large" onClick={() => navigate("/help")}>
                  Tìm hiểu cách hoạt động
                </Button>
              </Space>
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <div className="hero-visual">
              <Avatar
                size={200}
                style={{
                  background: "linear-gradient(135deg, #1890ff, #36cfc9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <SafetyCertificateOutlined
                  style={{ fontSize: 80, color: "white" }}
                />
              </Avatar>
              <div className="floating-badges">
                <Badge
                  count="VERIFIED"
                  style={{ backgroundColor: "#52c41a" }}
                />
                <Badge count="SECURE" style={{ backgroundColor: "#1890ff" }} />
                <Badge count="INSTANT" style={{ backgroundColor: "#1890ff" }} />
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* How It Works Section */}
      <Card className="section-card" style={{ marginBottom: 48 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Cách thức xác thực hoạt động
        </Title>
        <Steps
          current={-1}
          items={steps}
          size="default"
          direction="horizontal"
          className="verification-steps"
        />
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate("/verify")}
          >
            Thử ngay
          </Button>
        </div>
      </Card>

      {/* Features Section */}
      <Card className="section-card" style={{ marginBottom: 48 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Tại sao chọn nền tảng của chúng tôi?
        </Title>
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                className="feature-card"
                style={{ background: feature.color, height: "100%" }}
              >
                <div style={{ textAlign: "center" }}>
                  {feature.icon}
                  <Title level={4} style={{ margin: "16px 0 8px" }}>
                    {feature.title}
                  </Title>
                  <Text type="secondary">{feature.description}</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default PublicHome;
