import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Progress,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ShareAltOutlined,
  QrcodeOutlined,
  TrophyOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  LinkOutlined,
  ArrowUpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import "./Dashboard.scss";

const { Title, Text, Paragraph } = Typography;

interface CredentialSummary {
  id: string;
  type: "degree" | "transcript" | "certificate";
  title: string;
  institution: string;
  issueDate: string;
  status: "active" | "pending" | "revoked";
  blockchainHash?: string;
  gpa?: string;
}

interface DashboardStats {
  totalCredentials: number;
  verifiedCredentials: number;
  pendingCredentials: number;
  recentVerifications: number;
}

interface ActivityItem {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  type: "verification" | "share" | "credential" | "profile";
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardStats: DashboardStats = {
    totalCredentials: 8,
    verifiedCredentials: 6,
    pendingCredentials: 2,
    recentVerifications: 15,
  };

  const recentCredentials: CredentialSummary[] = [
    {
      id: "deg_001",
      type: "degree",
      title: "Bachelor of Software Engineering",
      institution: "FPT University",
      issueDate: "2024-06-15",
      status: "active",
      blockchainHash: "0x1a2b3c4d...",
      gpa: "3.85",
    },
    {
      id: "cert_001",
      type: "certificate",
      title: "AWS Cloud Practitioner",
      institution: "Amazon Web Services",
      issueDate: "2024-03-22",
      status: "active",
      blockchainHash: "0x5e6f7g8h...",
    },
    {
      id: "trans_001",
      type: "transcript",
      title: "Academic Transcript - Fall 2023",
      institution: "FPT University",
      issueDate: "2024-01-10",
      status: "active",
      blockchainHash: "0x9i0j1k2l...",
      gpa: "3.75",
    },
    {
      id: "cert_002",
      type: "certificate",
      title: "React Advanced Certification",
      institution: "Meta",
      issueDate: "2024-02-28",
      status: "pending",
    },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: 1,
      action: "Credential Verified",
      description: "Your Bachelor's degree was verified by TechCorp Vietnam",
      timestamp: "2 hours ago",
      type: "verification",
    },
    {
      id: 2,
      action: "QR Code Generated",
      description: "QR code created for AWS Cloud Practitioner certificate",
      timestamp: "1 day ago",
      type: "share",
    },
    {
      id: 3,
      action: "New Credential Issued",
      description: "Academic Transcript - Spring 2024 has been issued",
      timestamp: "3 days ago",
      type: "credential",
    },
    {
      id: 4,
      action: "Profile Updated",
      description: "Contact information updated successfully",
      timestamp: "1 week ago",
      type: "profile",
    },
  ];

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "degree":
        return <TrophyOutlined style={{ color: "#52c41a" }} />;
      case "certificate":
        return <SafetyCertificateOutlined style={{ color: "#1890ff" }} />;
      case "transcript":
        return <BookOutlined style={{ color: "#722ed1" }} />;
      default:
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">Active</Tag>;
      case "pending":
        return <Tag color="warning">Pending</Tag>;
      case "revoked":
        return <Tag color="error">Revoked</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "verification":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "share":
        return <ShareAltOutlined style={{ color: "#1890ff" }} />;
      case "credential":
        return <FileTextOutlined style={{ color: "#722ed1" }} />;
      case "profile":
        return <Avatar size="small" icon={<UserOutlined />} />;
      default:
        return <EyeOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const handleCredentialClick = (credentialId: string) => {
    navigate(`/student-portal/credentials/${credentialId}`);
  };

  return (
    <div className="antd-dashboard">
      {/* Welcome Header */}
      <Card className="welcome-card" style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Welcome back! 👋
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Here's what's happening with your credentials today.
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                type="primary"
                size="large"
                icon={<ShareAltOutlined />}
                onClick={() => navigate("/student-portal/share")}
              >
                Share Credentials
              </Button>
              <Button
                size="large"
                icon={<QrcodeOutlined />}
                onClick={() => navigate("/student-portal/share")}
              >
                Generate QR
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Total Credentials"
              value={dashboardStats.totalCredentials}
              prefix={<FileTextOutlined style={{ color: "#1890ff" }} />}
              suffix={
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  +2 this month
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Verified Credentials"
              value={dashboardStats.verifiedCredentials}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              suffix={
                <Progress
                  type="circle"
                  size={30}
                  percent={Math.round(
                    (dashboardStats.verifiedCredentials /
                      dashboardStats.totalCredentials) *
                      100
                  )}
                  showInfo={false}
                  strokeColor="#52c41a"
                />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Pending Review"
              value={dashboardStats.pendingCredentials}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
              suffix={<Tag color="orange">In progress</Tag>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable>
            <Statistic
              title="Recent Verifications"
              value={dashboardStats.recentVerifications}
              prefix={<EyeOutlined style={{ color: "#722ed1" }} />}
              suffix={
                <Tooltip title="This week">
                  <ArrowUpOutlined style={{ color: "#3f8600" }} />
                </Tooltip>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Recent Credentials */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: "#1890ff" }} />
                <Text strong>Recent Credentials</Text>
              </Space>
            }
            extra={
              <Button
                type="link"
                onClick={() => navigate("/student-portal/credentials")}
              >
                View All →
              </Button>
            }
            hoverable
          >
            <List
              dataSource={recentCredentials}
              renderItem={(credential) => (
                <List.Item
                  onClick={() => handleCredentialClick(credential.id)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    padding: "12px 16px",
                    borderRadius: "8px",
                  }}
                  className="credential-list-item"
                  actions={[
                    getStatusTag(credential.status),
                    credential.blockchainHash && (
                      <Tooltip
                        title={`Blockchain: ${credential.blockchainHash}`}
                      >
                        <Badge dot color="green">
                          <LinkOutlined style={{ color: "#52c41a" }} />
                        </Badge>
                      </Tooltip>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="large"
                        icon={getCredentialIcon(credential.type)}
                        style={{
                          backgroundColor: "#f6f8ff",
                          border: "1px solid #d9e5ff",
                        }}
                      />
                    }
                    title={
                      <div>
                        <Text strong>{credential.title}</Text>
                        {credential.gpa && (
                          <Tag color="gold" style={{ marginLeft: 8 }}>
                            GPA: {credential.gpa}
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <Text type="secondary">{credential.institution}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Issued:{" "}
                          {new Date(credential.issueDate).toLocaleDateString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <EyeOutlined style={{ color: "#722ed1" }} />
                <Text strong>Recent Activities</Text>
              </Space>
            }
            extra={<Button type="link">View All →</Button>}
            hoverable
          >
            <List
              dataSource={recentActivities}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size="default"
                        style={{
                          backgroundColor: "#f6f8ff",
                          border: "1px solid #d9e5ff",
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    }
                    title={<Text strong>{activity.action}</Text>}
                    description={
                      <div>
                        <Paragraph
                          ellipsis={{ rows: 1, expandable: false }}
                          style={{ margin: 0, marginBottom: 4 }}
                        >
                          {activity.description}
                        </Paragraph>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {activity.timestamp}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Access Section */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: "#fa541c" }} />
            <Text strong>Quick Access</Text>
          </Space>
        }
        hoverable
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              className="quick-access-card"
              onClick={() => navigate("/student-portal/credentials")}
            >
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: "#f6ffed",
                    color: "#52c41a",
                    marginBottom: 16,
                  }}
                >
                  <TrophyOutlined style={{ fontSize: 32 }} />
                </Avatar>
                <Title level={4} style={{ margin: "8px 0" }}>
                  My Degrees
                </Title>
                <Text type="secondary">
                  View and manage your academic degrees
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              className="quick-access-card"
              onClick={() => navigate("/student-portal/credentials")}
            >
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: "#f0f5ff",
                    color: "#722ed1",
                    marginBottom: 16,
                  }}
                >
                  <BookOutlined style={{ fontSize: 32 }} />
                </Avatar>
                <Title level={4} style={{ margin: "8px 0" }}>
                  Transcripts
                </Title>
                <Text type="secondary">
                  Official academic transcripts and grades
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              className="quick-access-card"
              onClick={() => navigate("/student-portal/credentials")}
            >
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: "#e6f7ff",
                    color: "#1890ff",
                    marginBottom: 16,
                  }}
                >
                  <SafetyCertificateOutlined style={{ fontSize: 32 }} />
                </Avatar>
                <Title level={4} style={{ margin: "8px 0" }}>
                  Certificates
                </Title>
                <Text type="secondary">
                  Professional certifications and achievements
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card
              hoverable
              className="quick-access-card"
              onClick={() => navigate("/student-portal/share")}
            >
              <div style={{ textAlign: "center" }}>
                <Avatar
                  size={64}
                  style={{
                    backgroundColor: "#fff7e6",
                    color: "#fa8c16",
                    marginBottom: 16,
                  }}
                >
                  <ShareAltOutlined style={{ fontSize: 32 }} />
                </Avatar>
                <Title level={4} style={{ margin: "8px 0" }}>
                  Share Portal
                </Title>
                <Text type="secondary">
                  Generate QR codes and verification links
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard;
