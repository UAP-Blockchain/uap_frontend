import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Collapse,
  Tabs,
  Alert,
  Divider,
  List,
  Avatar,
  Tag,
} from "antd";
import {
  QuestionCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  ApiOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import "./AboutHelp.scss";

const { Title, Text, Paragraph } = Typography;

const AboutHelp: React.FC = () => {
  const [activeTab, setActiveTab] = useState("faq");

  const faqData = [
    {
      key: "what-is-blockchain-verification",
      label: "What is blockchain credential verification?",
      children: (
        <div>
          <Paragraph>
            Blockchain credential verification is a tamper-proof method of
            validating academic credentials using distributed ledger technology.
            Each credential is recorded on an immutable blockchain, ensuring its
            authenticity and preventing fraud.
          </Paragraph>
          <Paragraph>
            <strong>Benefits:</strong>
            <ul>
              <li>Instant verification (2-3 seconds)</li>
              <li>100% tamper-proof records</li>
              <li>Global accessibility 24/7</li>
              <li>Eliminates fake credentials</li>
            </ul>
          </Paragraph>
        </div>
      ),
    },
    {
      key: "how-to-verify",
      label: "How do I verify a credential?",
      children: (
        <div>
          <Paragraph>We offer three convenient verification methods:</Paragraph>
          <div style={{ marginLeft: 16 }}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Tag color="green">QR Code Scan</Tag>
                <Text>
                  Use your camera to scan the QR code from the credential
                </Text>
              </div>
              <div>
                <Tag color="blue">Manual Entry</Tag>
                <Text>Enter the credential ID or blockchain hash manually</Text>
              </div>
              <div>
                <Tag color="purple">File Upload</Tag>
                <Text>
                  Upload a digital copy of the credential for analysis
                </Text>
              </div>
            </Space>
          </div>
          <Paragraph style={{ marginTop: 16 }}>
            Simply go to our <strong>Verify Credentials</strong> page and choose
            your preferred method. Results are typically available within
            seconds.
          </Paragraph>
        </div>
      ),
    },
    {
      key: "supported-institutions",
      label: "Which institutions are supported?",
      children: (
        <div>
          <Paragraph>
            We currently support credentials from over{" "}
            <strong>127 institutions</strong> worldwide, including:
          </Paragraph>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Title level={5}>🇻🇳 Vietnam Universities:</Title>
              <ul>
                <li>FPT University</li>
                <li>Vietnam National University (VNU)</li>
                <li>RMIT Vietnam</li>
                <li>University of Economics Ho Chi Minh City (UEH)</li>
                <li>Hanoi University of Science and Technology</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <Title level={5}>🌍 International Partners:</Title>
              <ul>
                <li>Amazon Web Services (Certifications)</li>
                <li>Google (Professional Certificates)</li>
                <li>Microsoft (Azure Certifications)</li>
                <li>Coursera (Online Degrees)</li>
                <li>edX (MicroMasters)</li>
              </ul>
            </Col>
          </Row>
          <Alert
            message="Don't see your institution?"
            description="Contact us to discuss adding your institution to our verification network."
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
    },
    {
      key: "verification-failed",
      label: "What if verification fails?",
      children: (
        <div>
          <Paragraph>
            If credential verification fails, it could be due to several
            reasons:
          </Paragraph>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: "Credential not found",
                description:
                  "The credential ID or blockchain hash doesn't exist in our records",
              },
              {
                title: "Invalid format",
                description:
                  "The credential ID format is incorrect or contains typos",
              },
              {
                title: "Revoked credential",
                description:
                  "The institution has revoked or cancelled this credential",
              },
              {
                title: "Institution not supported",
                description:
                  "The issuing institution is not part of our verification network",
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={<CloseCircleOutlined />}
                      style={{ backgroundColor: "#ff4d4f" }}
                    />
                  }
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
          <Alert
            message="Next Steps"
            description="If verification fails, please double-check the credential ID and contact the issuing institution for assistance."
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
    },
    {
      key: "data-privacy",
      label: "How is my data protected?",
      children: (
        <div>
          <Paragraph>
            We take data privacy seriously and follow industry best practices:
          </Paragraph>
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              <Text strong>No personal data storage:</Text> We don't store
              personal information from verifications
            </div>
            <div>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              <Text strong>Encrypted connections:</Text> All data transmission
              uses SSL/TLS encryption
            </div>
            <div>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              <Text strong>Anonymous verification:</Text> Verifications can be
              performed without creating accounts
            </div>
            <div>
              <CheckCircleOutlined
                style={{ color: "#52c41a", marginRight: 8 }}
              />
              <Text strong>GDPR compliant:</Text> We comply with international
              data protection regulations
            </div>
          </Space>
        </div>
      ),
    },
  ];

  const contactInfo = [
    {
      icon: <PhoneOutlined style={{ color: "#1890ff" }} />,
      title: "Phone Support",
      description: "+84 (0) 123 456 789",
      subtitle: "Monday - Friday, 9:00 AM - 6:00 PM (GMT+7)",
    },
    {
      icon: <MailOutlined style={{ color: "#52c41a" }} />,
      title: "Email Support",
      description: "support@credentialverifier.com",
      subtitle: "Response within 24 hours",
    },
    {
      icon: <GlobalOutlined style={{ color: "#722ed1" }} />,
      title: "Live Chat",
      description: "Available on our website",
      subtitle: "Monday - Friday, 9:00 AM - 6:00 PM (GMT+7)",
    },
    {
      icon: <TeamOutlined style={{ color: "#fa541c" }} />,
      title: "Enterprise Support",
      description: "enterprise@credentialverifier.com",
      subtitle: "Dedicated support for large organizations",
    },
  ];

  const apiEndpoints = [
    {
      method: "POST",
      endpoint: "/api/v1/verify",
      description: "Verify a credential by ID or hash",
      parameters: "credential_id, verification_method",
    },
    {
      method: "GET",
      endpoint: "/api/v1/institutions",
      description: "Get list of supported institutions",
      parameters: "page, limit, search",
    },
    {
      method: "GET",
      endpoint: "/api/v1/status/{credential_id}",
      description: "Get credential status and details",
      parameters: "credential_id",
    },
    {
      method: "POST",
      endpoint: "/api/v1/batch-verify",
      description: "Verify multiple credentials at once",
      parameters: "credential_ids[]",
    },
  ];

  const tabItems = [
    {
      key: "faq",
      label: (
        <span>
          <QuestionCircleOutlined />
          FAQ
        </span>
      ),
      children: (
        <div className="faq-section">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={3}>Frequently Asked Questions</Title>
            <Text type="secondary">
              Find answers to common questions about our credential verification
              service
            </Text>
          </div>

          <Collapse
            items={faqData}
            defaultActiveKey={["what-is-blockchain-verification"]}
            ghost
            size="large"
          />
        </div>
      ),
    },
    {
      key: "contact",
      label: (
        <span>
          <PhoneOutlined />
          Contact Us
        </span>
      ),
      children: (
        <div className="contact-section">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={3}>Get in Touch</Title>
            <Text type="secondary">
              Need help? Our support team is here to assist you
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            {contactInfo.map((contact, index) => (
              <Col xs={24} md={12} key={index}>
                <Card hoverable className="contact-card">
                  <Space>
                    <Avatar size={48} icon={contact.icon} />
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {contact.title}
                      </Title>
                      <Text strong>{contact.description}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {contact.subtitle}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider />

          <Card title="📍 Office Location" style={{ textAlign: "center" }}>
            <Title level={4}>FPT Software Building</Title>
            <Paragraph>
              Nam Kỳ Khởi Nghĩa Street, Nguyễn Du Ward
              <br />
              District 1, Ho Chi Minh City, Vietnam
            </Paragraph>
            <Button type="primary" icon={<GlobalOutlined />}>
              View on Google Maps
            </Button>
          </Card>
        </div>
      ),
    },
    {
      key: "api",
      label: (
        <span>
          <ApiOutlined />
          API Docs
        </span>
      ),
      children: (
        <div className="api-section">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={3}>API Documentation</Title>
            <Text type="secondary">
              Integrate credential verification into your applications
            </Text>
          </div>

          <Alert
            message="API Access"
            description="API access is available for enterprise customers. Contact our sales team to get started."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Card title="🚀 Getting Started" style={{ marginBottom: 24 }}>
            <Paragraph>
              Our RESTful API allows you to integrate credential verification
              directly into your applications. All endpoints return JSON
              responses and use standard HTTP status codes.
            </Paragraph>
            <Paragraph>
              <Text strong>Base URL:</Text>{" "}
              <Text code>https://api.credentialverifier.com</Text>
            </Paragraph>
            <Paragraph>
              <Text strong>Authentication:</Text> Bearer token (provided upon
              registration)
            </Paragraph>
          </Card>

          <Card title="📋 API Endpoints">
            <List
              itemLayout="vertical"
              dataSource={apiEndpoints}
              renderItem={(item) => (
                <List.Item>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Space>
                      <Tag color={item.method === "GET" ? "blue" : "green"}>
                        {item.method}
                      </Tag>
                      <Text code>{item.endpoint}</Text>
                    </Space>
                    <Text>{item.description}</Text>
                    <Text type="secondary">Parameters: {item.parameters}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          <Card title="💻 Example Request" style={{ marginTop: 24 }}>
            <pre
              style={{ background: "#f5f5f5", padding: 16, borderRadius: 8 }}
            >
              {`curl -X POST https://api.credentialverifier.com/api/v1/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "credential_id": "deg_001",
    "verification_method": "api"
  }'`}
            </pre>
          </Card>
        </div>
      ),
    },
    {
      key: "about",
      label: (
        <span>
          <BookOutlined />
          About Us
        </span>
      ),
      children: (
        <div className="about-section">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <Title level={3}>About Our Platform</Title>
            <Text type="secondary">
              Leading the future of credential verification with blockchain
              technology
            </Text>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <SafetyCertificateOutlined
                  style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }}
                />
                <Title level={4}>Secure & Trusted</Title>
                <Paragraph>
                  Built on blockchain technology ensuring tamper-proof
                  verification and eliminating credential fraud.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <RocketOutlined
                  style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }}
                />
                <Title level={4}>Fast & Reliable</Title>
                <Paragraph>
                  Get verification results in seconds with 99.9% uptime and
                  global accessibility.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="feature-card">
                <GlobalOutlined
                  style={{ fontSize: 48, color: "#722ed1", marginBottom: 16 }}
                />
                <Title level={4}>Global Network</Title>
                <Paragraph>
                  Partnered with 127+ institutions worldwide, trusted by 500+
                  organizations.
                </Paragraph>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card>
            <Title level={4}>🎯 Our Mission</Title>
            <Paragraph style={{ fontSize: 16, lineHeight: 1.8 }}>
              To revolutionize credential verification by providing instant,
              secure, and globally accessible validation of academic
              achievements. We believe in creating a world where authentic
              credentials can be verified anywhere, anytime, eliminating fraud
              and building trust in education.
            </Paragraph>

            <Title level={4} style={{ marginTop: 32 }}>
              📊 Platform Statistics
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <Title level={2} style={{ color: "#722ed1", margin: 0 }}>
                    152K+
                  </Title>
                  <Text type="secondary">Credentials Verified</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <Title level={2} style={{ color: "#722ed1", margin: 0 }}>
                    127
                  </Title>
                  <Text type="secondary">Partner Institutions</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <Title level={2} style={{ color: "#722ed1", margin: 0 }}>
                    500+
                  </Title>
                  <Text type="secondary">Trusted Organizations</Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: "center" }}>
                  <Title level={2} style={{ color: "#722ed1", margin: 0 }}>
                    2.3s
                  </Title>
                  <Text type="secondary">Average Response Time</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="about-help">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#722ed1" }}>
          ❓ Help & Support Center
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Everything you need to know about credential verification
        </Text>
      </div>

      {/* Main Content */}
      <Card className="help-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="large"
          items={tabItems}
          className="help-tabs"
        />
      </Card>
    </div>
  );
};

export default AboutHelp;
