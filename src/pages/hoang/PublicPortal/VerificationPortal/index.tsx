import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Input,
  Upload,
  Tabs,
  Form,
  message,
  Divider,
  Alert,
  Progress,
} from "antd";
import {
  QrcodeOutlined,
  SearchOutlined,
  FileTextOutlined,
  CameraOutlined,
  UploadOutlined,
  SafetyCertificateOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import "./VerificationPortal.scss";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const VerificationPortal: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("qr");
  const [isScanning, setIsScanning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [credentialId, setCredentialId] = useState("");
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  // Mock verification process
  const handleVerification = async (method: string, data: any) => {
    setIsVerifying(true);

    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
      message.success("Verification completed successfully!");
      // Navigate to results with mock data
      navigate("/public-portal/results", {
        state: {
          verificationData: data,
          method,
          success: true,
        },
      });
    }, 2000);
  };

  // QR Code scanning simulation
  const handleQRScan = () => {
    setIsScanning(true);
    // Simulate camera access and QR scan
    setTimeout(() => {
      setIsScanning(false);
      const mockQRData = {
        id: "deg_001",
        type: "qr",
        scannedAt: new Date().toISOString(),
      };
      handleVerification("qr", mockQRData);
    }, 3000);
  };

  // Manual ID verification
  const handleManualVerification = () => {
    if (!credentialId.trim()) {
      message.error("Please enter a valid credential ID");
      return;
    }

    const mockManualData = {
      id: credentialId,
      type: "manual",
      enteredAt: new Date().toISOString(),
    };
    handleVerification("manual", mockManualData);
  };

  // File upload verification
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.jpg,.jpeg,.png",
    beforeUpload: (file) => {
      const isValidType = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ].includes(file.type);
      if (!isValidType) {
        message.error("You can only upload PDF, JPG or PNG files!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File must be smaller than 10MB!");
        return false;
      }

      setUploadedFile(file);
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setUploadedFile(null);
    },
  };

  const handleFileVerification = () => {
    if (!uploadedFile) {
      message.error("Please upload a file first");
      return;
    }

    const mockFileData = {
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      type: "file",
      uploadedAt: new Date().toISOString(),
    };
    handleVerification("file", mockFileData);
  };

  const tabItems = [
    {
      key: "qr",
      label: (
        <span>
          <QrcodeOutlined />
          QR Code Scanner
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Scan QR Code
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Use your camera to scan the QR code from the credential document
              or digital display
            </Paragraph>
          </div>

          <div className="qr-scanner-container">
            {isScanning ? (
              <div className="scanning-state">
                <div className="camera-preview">
                  <CameraOutlined style={{ fontSize: 80, color: "#722ed1" }} />
                  <Title
                    level={4}
                    style={{ margin: "16px 0", color: "#722ed1" }}
                  >
                    Scanning QR Code...
                  </Title>
                  <Progress percent={66} status="active" showInfo={false} />
                </div>
              </div>
            ) : (
              <div className="scan-prompt">
                <QrcodeOutlined
                  style={{ fontSize: 120, color: "#d9d9d9", marginBottom: 24 }}
                />
                <Title
                  level={4}
                  style={{ margin: "0 0 16px", color: "#595959" }}
                >
                  Ready to Scan
                </Title>
                <Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 32 }}
                >
                  Position the QR code within the frame to start verification
                </Text>
                <Button
                  type="primary"
                  size="large"
                  icon={<CameraOutlined />}
                  onClick={handleQRScan}
                  loading={isVerifying}
                >
                  Start Camera Scan
                </Button>
              </div>
            )}
          </div>

          <Alert
            message="Privacy Notice"
            description="Camera access is used only for QR code scanning and no images are stored."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </div>
      ),
    },
    {
      key: "manual",
      label: (
        <span>
          <SearchOutlined />
          Manual Input
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Enter Credential ID
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Manually enter the credential ID or blockchain hash to verify
              authenticity
            </Paragraph>
          </div>

          <Form layout="vertical" style={{ maxWidth: 600, margin: "0 auto" }}>
            <Form.Item
              label="Credential ID / Blockchain Hash"
              extra="Enter the unique identifier found on the credential document"
            >
              <TextArea
                placeholder="deg_001 or 0x1a2b3c4d5e6f7890abcdef..."
                rows={3}
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                style={{ fontSize: 16 }}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                onClick={handleManualVerification}
                loading={isVerifying}
                disabled={!credentialId.trim()}
              >
                Verify Credential
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="examples-section">
            <Title level={5} style={{ color: "#722ed1" }}>
              Example Formats:
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className="example-item">
                <Text strong>Credential ID:</Text>
                <Text code>deg_001, cert_002, trans_003</Text>
              </div>
              <div className="example-item">
                <Text strong>Blockchain Hash:</Text>
                <Text code>0x1a2b3c4d5e6f7890abcdef...</Text>
              </div>
            </Space>
          </div>
        </div>
      ),
    },
    {
      key: "file",
      label: (
        <span>
          <FileTextOutlined />
          File Upload
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Upload Credential File
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Upload a digital copy of the credential for verification analysis
            </Paragraph>
          </div>

          <div
            className="upload-section"
            style={{ maxWidth: 600, margin: "0 auto" }}
          >
            <Upload.Dragger {...uploadProps} className="credential-uploader">
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: "#722ed1" }} />
              </p>
              <p className="ant-upload-text">
                Click or drag credential file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support PDF, JPG, PNG files up to 10MB. Ensure the credential
                contains QR codes or verification information.
              </p>
            </Upload.Dragger>

            {uploadedFile && (
              <div className="uploaded-file-info">
                <Alert
                  message="File Ready for Verification"
                  description={`${uploadedFile.name} (${(
                    uploadedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB)`}
                  type="success"
                  showIcon
                  style={{ marginTop: 16 }}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<SafetyCertificateOutlined />}
                  onClick={handleFileVerification}
                  loading={isVerifying}
                  style={{ marginTop: 16, width: "100%" }}
                >
                  Analyze & Verify File
                </Button>
              </div>
            )}
          </div>

          <Alert
            message="File Processing"
            description="Our AI system will extract verification data from uploaded files and cross-reference with blockchain records."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="verification-portal">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#722ed1" }}>
          🔍 Credential Verification Portal
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Choose your preferred method to verify academic credentials instantly
        </Text>
      </div>

      {isVerifying && (
        <Alert
          message="Verification in Progress"
          description="Please wait while we verify the credential against blockchain records..."
          type="info"
          showIcon
          icon={<LoadingOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Verification Methods */}
      <Card className="verification-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          size="large"
          items={tabItems}
          className="verification-tabs"
        />
      </Card>

      {/* Help Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} md={8}>
          <Card hoverable className="help-card">
            <QrcodeOutlined
              style={{ fontSize: 32, color: "#52c41a", marginBottom: 16 }}
            />
            <Title level={4}>QR Code Method</Title>
            <Text type="secondary">
              Fastest and most secure method. Simply scan the QR code from the
              credential.
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable className="help-card">
            <SearchOutlined
              style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }}
            />
            <Title level={4}>Manual Entry</Title>
            <Text type="secondary">
              Enter credential ID manually when QR codes are not available.
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable className="help-card">
            <FileTextOutlined
              style={{ fontSize: 32, color: "#722ed1", marginBottom: 16 }}
            />
            <Title level={4}>File Analysis</Title>
            <Text type="secondary">
              Upload digital files for automated credential detection and
              verification.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VerificationPortal;
