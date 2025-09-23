import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Descriptions,
  Tag,
  Result,
  Timeline,
  Statistic,
  Divider,
  Alert,
  QRCode,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  BookOutlined,
  CalendarOutlined,
  LinkOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./VerificationResults.scss";

const { Title, Text, Paragraph } = Typography;

interface VerificationResultData {
  success: boolean;
  credentialId: string;
  verificationMethod: string;
  timestamp: string;
  credentialInfo?: {
    title: string;
    type: "degree" | "certificate" | "transcript";
    institution: string;
    studentName: string;
    studentId: string;
    issueDate: string;
    gpa?: string;
    major?: string;
    status: "active" | "revoked" | "expired";
    blockchainHash: string;
    transactionHash: string;
    blockNumber: number;
  };
  verificationDetails: {
    blockchainVerified: boolean;
    institutionVerified: boolean;
    tamperProof: boolean;
    verificationScore: number;
  };
}

const VerificationResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [resultData, setResultData] = useState<VerificationResultData | null>(
    null
  );

  useEffect(() => {
    // Get data from navigation state or create mock data
    const stateData = location.state;

    if (stateData?.success) {
      // Create mock successful verification result
      setResultData({
        success: true,
        credentialId: stateData.verificationData?.id || "deg_001",
        verificationMethod: stateData.method || "manual",
        timestamp: new Date().toISOString(),
        credentialInfo: {
          title: "Bachelor of Software Engineering",
          type: "degree",
          institution: "FPT University",
          studentName: "Nguyễn Văn Hoàng",
          studentId: "SE171234",
          issueDate: "2024-06-15",
          gpa: "3.85",
          major: "Software Engineering",
          status: "active",
          blockchainHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
          transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
          blockNumber: 18567234,
        },
        verificationDetails: {
          blockchainVerified: true,
          institutionVerified: true,
          tamperProof: true,
          verificationScore: 100,
        },
      });
    } else {
      // Mock failed verification
      setResultData({
        success: false,
        credentialId: "unknown_001",
        verificationMethod: "manual",
        timestamp: new Date().toISOString(),
        verificationDetails: {
          blockchainVerified: false,
          institutionVerified: false,
          tamperProof: false,
          verificationScore: 0,
        },
      });
    }
  }, [location.state]);

  if (!resultData) {
    return (
      <div className="verification-results">
        <Card>
          <Result
            status="404"
            title="No Verification Data"
            subTitle="Please go back to the verification portal to verify a credential."
            extra={
              <Button
                type="primary"
                onClick={() => navigate("/public-portal/verify")}
              >
                Start Verification
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const getCredentialIcon = (type?: string) => {
    switch (type) {
      case "degree":
        return <TrophyOutlined style={{ color: "#52c41a", fontSize: 24 }} />;
      case "certificate":
        return (
          <SafetyCertificateOutlined
            style={{ color: "#1890ff", fontSize: 24 }}
          />
        );
      case "transcript":
        return <BookOutlined style={{ color: "#722ed1", fontSize: 24 }} />;
      default:
        return (
          <SafetyCertificateOutlined
            style={{ color: "#8c8c8c", fontSize: 24 }}
          />
        );
    }
  };

  const getStatusTag = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        );
      case "revoked":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Revoked
          </Tag>
        );
      case "expired":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Expired
          </Tag>
        );
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const handleDownloadReport = () => {
    // Mock PDF download
    const element = document.createElement("a");
    element.setAttribute(
      "download",
      `verification-report-${resultData.credentialId}.pdf`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const verificationTimeline = [
    {
      color: "green",
      children: (
        <div>
          <Text strong>Verification Initiated</Text>
          <br />
          <Text type="secondary">
            {dayjs(resultData.timestamp).format("YYYY-MM-DD HH:mm:ss")}
          </Text>
        </div>
      ),
    },
    {
      color: resultData.verificationDetails.blockchainVerified
        ? "green"
        : "red",
      children: (
        <div>
          <Text strong>Blockchain Verification</Text>
          <br />
          <Text type="secondary">
            {resultData.verificationDetails.blockchainVerified
              ? "✅ Verified on blockchain"
              : "❌ Not found on blockchain"}
          </Text>
        </div>
      ),
    },
    {
      color: resultData.verificationDetails.institutionVerified
        ? "green"
        : "red",
      children: (
        <div>
          <Text strong>Institution Verification</Text>
          <br />
          <Text type="secondary">
            {resultData.verificationDetails.institutionVerified
              ? "✅ Confirmed by institution"
              : "❌ Institution not verified"}
          </Text>
        </div>
      ),
    },
    {
      color: resultData.success ? "green" : "red",
      children: (
        <div>
          <Text strong>Final Result</Text>
          <br />
          <Text type="secondary">
            {resultData.success
              ? "✅ Verification completed successfully"
              : "❌ Verification failed"}
          </Text>
        </div>
      ),
    },
  ];

  return (
    <div className="verification-results">
      {/* Result Header */}
      <Card
        className={`result-header ${resultData.success ? "success" : "failed"}`}
      >
        <Result
          status={resultData.success ? "success" : "error"}
          title={
            <Title level={2} style={{ margin: 0 }}>
              {resultData.success
                ? "Credential Verified Successfully!"
                : "Verification Failed"}
            </Title>
          }
          subTitle={
            <Text style={{ fontSize: 16 }}>
              {resultData.success
                ? "The credential has been successfully verified against blockchain records."
                : "The credential could not be verified or does not exist in our records."}
            </Text>
          }
          extra={
            <Space size="middle">
              <Button
                type="primary"
                onClick={() => navigate("/public-portal/verify")}
              >
                Verify Another Credential
              </Button>
              {resultData.success && (
                <>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadReport}
                  >
                    Download Report
                  </Button>
                  <Button icon={<PrinterOutlined />}>Print Results</Button>
                </>
              )}
            </Space>
          }
        />
      </Card>

      {resultData.success && resultData.credentialInfo ? (
        <Row gutter={[24, 24]}>
          {/* Credential Details */}
          <Col xs={24} lg={16}>
            <Card title="📋 Credential Information" className="detail-card">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Credential Type" span={2}>
                  <Space>
                    {getCredentialIcon(resultData.credentialInfo.type)}
                    <Tag
                      color={
                        resultData.credentialInfo.type === "degree"
                          ? "green"
                          : resultData.credentialInfo.type === "certificate"
                          ? "blue"
                          : "purple"
                      }
                    >
                      {resultData.credentialInfo.type.charAt(0).toUpperCase() +
                        resultData.credentialInfo.type.slice(1)}
                    </Tag>
                  </Space>
                </Descriptions.Item>

                <Descriptions.Item label="Title" span={2}>
                  <Text strong>{resultData.credentialInfo.title}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Institution">
                  {resultData.credentialInfo.institution}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getStatusTag(resultData.credentialInfo.status)}
                </Descriptions.Item>

                <Descriptions.Item label="Student Name">
                  {resultData.credentialInfo.studentName}
                </Descriptions.Item>
                <Descriptions.Item label="Student ID">
                  {resultData.credentialInfo.studentId}
                </Descriptions.Item>

                <Descriptions.Item label="Issue Date">
                  <Space>
                    <CalendarOutlined />
                    {dayjs(resultData.credentialInfo.issueDate).format(
                      "MMMM DD, YYYY"
                    )}
                  </Space>
                </Descriptions.Item>
                {resultData.credentialInfo.gpa && (
                  <Descriptions.Item label="GPA">
                    <Tag color="gold">{resultData.credentialInfo.gpa}</Tag>
                  </Descriptions.Item>
                )}

                {resultData.credentialInfo.major && (
                  <Descriptions.Item label="Major" span={2}>
                    {resultData.credentialInfo.major}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <Divider />

              {/* Blockchain Details */}
              <Title level={5}>🔗 Blockchain Verification Details</Title>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Blockchain Hash">
                  <Text code copyable>
                    {resultData.credentialInfo.blockchainHash}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Hash">
                  <Text code copyable>
                    {resultData.credentialInfo.transactionHash}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Block Number">
                  {resultData.credentialInfo.blockNumber.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Verification Summary */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {/* Verification Score */}
              <Card>
                <Statistic
                  title="Verification Score"
                  value={resultData.verificationDetails.verificationScore}
                  suffix="%"
                  valueStyle={{
                    color:
                      resultData.verificationDetails.verificationScore === 100
                        ? "#3f8600"
                        : "#cf1322",
                  }}
                  prefix={<SafetyCertificateOutlined />}
                />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    Based on blockchain verification, institution validation,
                    and tamper-proof analysis
                  </Text>
                </div>
              </Card>

              {/* Verification Checklist */}
              <Card title="✅ Verification Checklist">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div className="check-item">
                    {resultData.verificationDetails.blockchainVerified ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    )}
                    <Text style={{ marginLeft: 8 }}>Blockchain Verified</Text>
                  </div>
                  <div className="check-item">
                    {resultData.verificationDetails.institutionVerified ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    )}
                    <Text style={{ marginLeft: 8 }}>Institution Confirmed</Text>
                  </div>
                  <div className="check-item">
                    {resultData.verificationDetails.tamperProof ? (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    )}
                    <Text style={{ marginLeft: 8 }}>Tamper-Proof</Text>
                  </div>
                </Space>
              </Card>

              {/* Quick Actions */}
              <Card title="⚡ Quick Actions">
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    block
                    icon={<ShareAltOutlined />}
                    onClick={() => setShowQRModal(true)}
                  >
                    Share Verification
                  </Button>
                  <Button
                    block
                    icon={<LinkOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    Copy Result Link
                  </Button>
                  <Button
                    block
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadReport}
                  >
                    Download Report
                  </Button>
                </Space>
              </Card>
            </Space>
          </Col>

          {/* Verification Timeline */}
          <Col xs={24}>
            <Card title="📅 Verification Timeline">
              <Timeline items={verificationTimeline} />
            </Card>
          </Col>
        </Row>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Alert
              message="Verification Failed"
              description={
                <div>
                  <p>
                    The credential with ID{" "}
                    <Text code>{resultData.credentialId}</Text> could not be
                    verified for the following reasons:
                  </p>
                  <ul>
                    <li>Credential not found in blockchain records</li>
                    <li>Invalid credential format or ID</li>
                    <li>Credential may have been revoked or expired</li>
                    <li>
                      Institution not participating in our verification network
                    </li>
                  </ul>
                  <p>
                    Please double-check the credential ID or contact the issuing
                    institution for assistance.
                  </p>
                </div>
              }
              type="error"
              showIcon
              action={
                <Button
                  type="primary"
                  onClick={() => navigate("/public-portal/verify")}
                >
                  Try Again
                </Button>
              }
            />
          </Col>
        </Row>
      )}

      {/* Share Modal */}
      <Modal
        title="Share Verification Results"
        open={showQRModal}
        onCancel={() => setShowQRModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowQRModal(false)}>
            Close
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <QRCode value={window.location.href} size={200} />
          <br />
          <br />
          <Text type="secondary">
            Scan this QR code to view the verification results
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default VerificationResults;
