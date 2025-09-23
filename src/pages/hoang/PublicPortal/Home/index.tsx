import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Statistic,
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
  TrophyOutlined,
  BookOutlined,
  GlobalOutlined,
  TeamOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import "./Home.scss";

const { Title, Text, Paragraph } = Typography;

const PublicHome: React.FC = () => {
  const navigate = useNavigate();

  // Mock statistics
  const stats = {
    totalVerifications: 152847,
    activeInstitutions: 127,
    trustedEmployers: 543,
    verificationTime: "2.3",
  };

  const steps = [
    {
      title: "Input Credentials",
      description: "Scan QR code, enter ID, or upload file",
      icon: <SearchOutlined style={{ color: "#1890ff" }} />,
    },
    {
      title: "Blockchain Verify",
      description: "Check against immutable ledger",
      icon: <SafetyCertificateOutlined style={{ color: "#52c41a" }} />,
    },
    {
      title: "Get Results",
      description: "Instant verification with detailed report",
      icon: <CheckCircleOutlined style={{ color: "#722ed1" }} />,
    },
  ];

  const features = [
    {
      icon: <ClockCircleOutlined style={{ fontSize: 48, color: "#1890ff" }} />,
      title: "Instant Verification",
      description: "Get results in seconds, not days",
      color: "#e6f7ff",
    },
    {
      icon: (
        <SafetyCertificateOutlined style={{ fontSize: 48, color: "#52c41a" }} />
      ),
      title: "100% Secure",
      description: "Blockchain-powered tamper-proof verification",
      color: "#f6ffed",
    },
    {
      icon: <GlobalOutlined style={{ fontSize: 48, color: "#722ed1" }} />,
      title: "Global Recognition",
      description: "Verified by 500+ organizations worldwide",
      color: "#f9f0ff",
    },
    {
      icon: <FileProtectOutlined style={{ fontSize: 48, color: "#fa541c" }} />,
      title: "Zero Fraud",
      description: "Eliminate fake credentials with blockchain proof",
      color: "#fff7e6",
    },
  ];

  const trustedInstitutions = [
    { name: "FPT University", icon: "🎓", students: "50K+" },
    { name: "VNU", icon: "🏛️", students: "30K+" },
    { name: "RMIT Vietnam", icon: "🌏", students: "25K+" },
    { name: "UEH", icon: "📊", students: "40K+" },
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
                  Verify Academic Credentials
                  <br />
                  <span className="highlight">Instantly & Securely</span>
                </Title>
                <Paragraph className="hero-description">
                  Trust but verify. Our blockchain-powered platform lets
                  employers verify academic credentials in seconds, eliminating
                  fraud and saving time in your hiring process.
                </Paragraph>
              </div>

              <Space size="large" wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  onClick={() => navigate("/public-portal/verify")}
                  className="cta-button"
                >
                  Start Verification
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate("/public-portal/help")}
                >
                  Learn How It Works
                </Button>
              </Space>

              <div className="hero-stats">
                <Space size="large" wrap>
                  <div className="stat-item">
                    <Text strong style={{ fontSize: 24, color: "#722ed1" }}>
                      {stats.totalVerifications.toLocaleString()}+
                    </Text>
                    <Text type="secondary" style={{ display: "block" }}>
                      Credentials Verified
                    </Text>
                  </div>
                  <div className="stat-item">
                    <Text strong style={{ fontSize: 24, color: "#722ed1" }}>
                      {stats.verificationTime}s
                    </Text>
                    <Text type="secondary" style={{ display: "block" }}>
                      Average Time
                    </Text>
                  </div>
                  <div className="stat-item">
                    <Text strong style={{ fontSize: 24, color: "#722ed1" }}>
                      100%
                    </Text>
                    <Text type="secondary" style={{ display: "block" }}>
                      Accuracy Rate
                    </Text>
                  </div>
                </Space>
              </div>
            </Space>
          </Col>

          <Col xs={24} lg={10}>
            <div className="hero-visual">
              <Avatar
                size={200}
                style={{
                  background: "linear-gradient(135deg, #722ed1, #eb2f96)",
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
                <Badge count="INSTANT" style={{ backgroundColor: "#722ed1" }} />
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Statistics Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Total Verifications"
              value={stats.totalVerifications}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              suffix="+"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Partner Institutions"
              value={stats.activeInstitutions}
              prefix={<BookOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Trusted Employers"
              value={stats.trustedEmployers}
              prefix={<TeamOutlined style={{ color: "#722ed1" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Avg. Response Time"
              value={stats.verificationTime}
              prefix={<ClockCircleOutlined style={{ color: "#fa541c" }} />}
              suffix="s"
            />
          </Card>
        </Col>
      </Row>

      {/* How It Works Section */}
      <Card className="section-card" style={{ marginBottom: 48 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          How Verification Works
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
            onClick={() => navigate("/public-portal/verify")}
          >
            Try It Now
          </Button>
        </div>
      </Card>

      {/* Features Section */}
      <Card className="section-card" style={{ marginBottom: 48 }}>
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Why Choose Our Platform?
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

      {/* Trusted Institutions */}
      <Card className="section-card">
        <Title level={2} style={{ textAlign: "center", marginBottom: 32 }}>
          Trusted by Leading Institutions
        </Title>
        <Row gutter={[24, 24]} justify="center">
          {trustedInstitutions.map((institution, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card hoverable className="institution-card">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    {institution.icon}
                  </div>
                  <Title level={5} style={{ margin: "0 0 8px" }}>
                    {institution.name}
                  </Title>
                  <Text type="secondary">{institution.students} Students</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Text type="secondary">
            Join 500+ organizations worldwide who trust our verification system
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PublicHome;
