import React, { useEffect, useRef, useState } from "react";
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
import { notification } from "antd";
import { BrowserQRCodeReader } from "@zxing/browser";
import CredentialServices from "../../../services/credential/api.service";
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
	const [isDecodingQr, setIsDecodingQr] = useState(false);
  const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  useEffect(() => {
    qrReaderRef.current = new BrowserQRCodeReader();
    return () => {
      qrReaderRef.current = null;
    };
  }, []);

  // Parse QR payload (URL hoặc plain credentialNumber)
  const parseQrPayload = (input: string) => {
    const qrText = input.trim();
    if (!qrText) {
      return { credentialNumber: undefined as string | undefined, verificationHash: undefined as string | undefined };
    }

    try {
      const url = new URL(qrText);
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments[segments.length - 1];

      const searchParams = url.searchParams;
      const credentialNumberFromQuery =
        searchParams.get("credentialNumber") || lastSegment;
      const verificationHash = searchParams.get("verificationHash") || undefined;

      return {
        credentialNumber: credentialNumberFromQuery,
        verificationHash,
      };
    } catch {
      const looksLikeHash =
        /^0x[a-fA-F0-9]{10,}$/i.test(qrText) ||
        /^[a-fA-F0-9]{40,}$/.test(qrText);

      if (looksLikeHash) {
        return {
          credentialNumber: undefined,
          verificationHash: qrText,
        };
      }

      return {
        credentialNumber: qrText,
        verificationHash: undefined,
      };
    }
  };

  const handleQRScanResult = async (qrText: string) => {
    const { credentialNumber, verificationHash } = parseQrPayload(qrText);

    if (!credentialNumber && !verificationHash) {
      notificationApi.error({
        message: "QR không hợp lệ",
        description: "QR không chứa dữ liệu xác thực hợp lệ.",
      });
      setIsScanning(false);
      return;
    }

    try {
      setIsScanning(true);
      setIsVerifying(true);
      const verifyResult = await CredentialServices.verifyCredential({
        credentialNumber,
        verificationHash,
      });

      const { isValid, message: backendMessage, credential } =
        (verifyResult || {}) as {
          isValid?: boolean;
          message?: string;
          credential?: { credentialId?: string; id?: string };
        };

      if (isValid === false) {
        notificationApi.error({
          message: "Không thể xác thực chứng chỉ",
          description:
            backendMessage || "Chứng chỉ không hợp lệ hoặc đã bị thu hồi.",
        });
        return;
      }

      const credentialNumberFromResult =
        credential?.credentialId ||
        credential?.id ||
        credentialNumber ||
        verificationHash;

      if (!credentialNumberFromResult) {
        notificationApi.warning({
          message: "Không tìm thấy mã chứng chỉ",
          description: "Không tìm thấy mã chứng chỉ sau khi xác thực.",
        });
        return;
      }

      notificationApi.success({
        message: "Xác thực thành công",
        description: "Đang mở chứng chỉ...",
      });
      navigate(
        `/certificates/verify/${encodeURIComponent(
            credentialNumberFromResult
          )}`
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      notificationApi.error({
        message: "Lỗi xác thực",
        description: "Có lỗi khi xác thực chứng chỉ. Vui lòng thử lại sau.",
      });
    } finally {
      setIsVerifying(false);
      setIsScanning(false);
    }
  };

  // Decode QR từ file ảnh bằng ZXing
  const decodeQrFromFile = async (file: File): Promise<string | null> => {
    setIsDecodingQr(true);
    try {
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(null);
        img.onerror = () => reject(new Error("Không thể tải ảnh QR"));
      });

      const readerInstance = qrReaderRef.current ?? new BrowserQRCodeReader();
      if (!qrReaderRef.current) {
        qrReaderRef.current = readerInstance;
      }

      const result = await readerInstance.decodeFromImageElement(img);
      return result?.getText() ?? null;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("QR decode error", error);
      return null;
    } finally {
      setIsDecodingQr(false);
    }
  };

  // Decode QR từ file ảnh (tạm thời yêu cầu user đọc text QR và dán)
  const handleQrImageUploaded = async (file: File) => {
    setUploadedFile(file);

    const qrText = await decodeQrFromFile(file);
    if (!qrText) {
      message.error("Không đọc được mã QR từ ảnh. Vui lòng thử lại với ảnh rõ hơn.");
      return false;
    }

    message.success("Đọc mã QR thành công, đang xác thực...");
    void handleQRScanResult(qrText);
    return false;
  };

  // Bắt Ctrl+V để dán text QR (hoặc hash / URL)
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return;

      const text =
        event.clipboardData.getData("text") ||
        event.clipboardData.getData("text/plain");
      if (text) {
        // Nếu đang ở tab QR thì coi như dán nội dung QR
        if (activeTab === "qr") {
          event.preventDefault();
          void handleQRScanResult(text.trim());
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [activeTab]);

  // Nút quét QR giờ chỉ là hướng dẫn sử dụng Ctrl+V hoặc upload
  const handleQRScan = () => {
    notificationApi.info({
      message: "Hướng dẫn quét QR",
      description:
        "Hãy tải lên ảnh QR bên dưới hoặc nhấn Ctrl+V để dán nội dung QR/text.",
    });
  };

  // Manual ID verification (dùng verify API)
  const handleManualVerification = async () => {
    const trimmed = credentialId.trim();
    if (!trimmed) {
      notificationApi.error({
        message: "Thiếu mã chứng chỉ",
        description: "Vui lòng nhập ID chứng chỉ hoặc hash hợp lệ.",
      });
      return;
    }

    // Đoán đây là mã chứng chỉ (SUB-YYYY-XXXXXX, GRAD-YYYY-XXXXXX, ...)
    const isCredentialNumber =
      /^([A-Z]{3,4})-\d{4}-\d{6}$/.test(trimmed) ||
      /^deg_\d+$/i.test(trimmed) ||
      /^cert_\d+$/i.test(trimmed) ||
      /^trans_\d+$/i.test(trimmed);

    const payload = isCredentialNumber
      ? { credentialNumber: trimmed, verificationHash: undefined }
      : { credentialNumber: undefined, verificationHash: trimmed };

    try {
      setIsVerifying(true);
      const verifyResult = await CredentialServices.verifyCredential(payload);

      const { isValid, message: backendMessage, credential } =
        (verifyResult || {}) as {
          isValid?: boolean;
          message?: string;
          credential?: { credentialId?: string; id?: string };
        };

      if (isValid === false) {
        notificationApi.error({
          message: "Không thể xác thực chứng chỉ",
          description:
            backendMessage || "Chứng chỉ không hợp lệ hoặc đã bị thu hồi.",
        });
        return;
      }

      const credentialNumberFromResult =
        credential?.credentialId || credential?.id || trimmed;

      notificationApi.success({
        message: "Xác thực thành công",
        description: "Đang mở chứng chỉ...",
      });
      navigate(
        `/certificates/verify/${encodeURIComponent(
            credentialNumberFromResult
          )}`
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      notificationApi.error({
        message: "Lỗi xác thực",
        description: "Có lỗi khi xác thực chứng chỉ. Vui lòng thử lại sau.",
      });
    } finally {
      setIsVerifying(false);
    }
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
        message.error("Bạn chỉ có thể tải lên file PDF, JPG hoặc PNG!");
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("File phải nhỏ hơn 10MB!");
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
      notificationApi.error({
        message: "Thiếu file chứng chỉ",
        description: "Vui lòng tải lên file chứng chỉ trước khi xác thực.",
      });
      return;
    }

    notificationApi.info({
      message: "Đang phát triển",
      description: "Chức năng phân tích file sẽ được hỗ trợ trong phiên bản sau.",
    });
  };

  const tabItems = [
    {
      key: "qr",
      label: (
        <span>
          <QrcodeOutlined />
          Quét mã QR
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Quét mã QR
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Sử dụng camera để quét mã QR từ tài liệu chứng chỉ hoặc màn hình kỹ thuật số
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
                    Đang quét mã QR...
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
                  Sẵn sàng quét
                </Title>
                
                
          <div style={{ marginTop: 16 }}>
            <Upload.Dragger
              accept=".jpg,.jpeg,.png"
              showUploadList={false}
              beforeUpload={handleQrImageUploaded}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: "#1990FF" }} />
              </p>
              <p className="ant-upload-text">
                Nhấp hoặc kéo ảnh QR vào đây để tải lên
              </p>
              <p className="ant-upload-hint">
                Hệ thống sẽ tự động đọc nội dung QR và xác thực ngay sau khi tải lên.
              </p>
            </Upload.Dragger>
            {isDecodingQr && (
              <Space style={{ marginTop: 16 }}>
                <LoadingOutlined />
                <Text>Đang đọc mã QR...</Text>
              </Space>
            )}
          </div>
              </div>
            )}
          </div>

          {/* <Alert
            message="Thông báo bảo mật"
            description="Quyền truy cập camera chỉ được sử dụng để quét mã QR và không lưu trữ hình ảnh."
            type="info"
            showIcon
            style={{ marginTop: 24 }}
          /> */}
        </div>
      ),
    },
    {
      key: "manual",
      label: (
        <span>
          <SearchOutlined />
          Nhập thủ công
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Nhập Mã chứng chỉ/ Mã Hash Blockchain
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Nhập thủ công mã chứng chỉ hoặc mã hash blockchain để xác thực tính xác thực
            </Paragraph>
          </div>

          <Form layout="vertical" style={{ maxWidth: 600, margin: "0 auto" }}>
            <Form.Item
              label="Mã chứng chỉ / Mã hash Blockchain"
              extra="Nhập mã định danh duy nhất được tìm thấy trên tài liệu chứng chỉ"
            >
              <TextArea
                placeholder="deg_001 hoặc 0x1a2b3c4d5e6f7890abcdef..."
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
                Xác thực chứng chỉ
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="examples-section">
            <Title level={5} style={{ color: "#1990FF" }}>
              Định dạng ví dụ:
            </Title>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className="example-item">
                <Text strong>ID chứng chỉ:</Text>
                <Text code>deg_001, cert_002, trans_003</Text>
              </div>
              <div className="example-item">
                <Text strong>Mã hash Blockchain:</Text>
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
          Tải lên file
        </span>
      ),
      children: (
        <div className="verification-method">
          <div className="method-header">
            <Title
              level={3}
              style={{ textAlign: "center", margin: "0 0 16px" }}
            >
              Tải lên file chứng chỉ
            </Title>
            <Paragraph style={{ textAlign: "center", color: "#8c8c8c" }}>
              Tải lên bản sao kỹ thuật số của chứng chỉ để phân tích xác thực
            </Paragraph>
          </div>

          <div
            className="upload-section"
            style={{ maxWidth: 600, margin: "0 auto" }}
          >
            <Upload.Dragger {...uploadProps} className="credential-uploader">
              <p className="ant-upload-drag-icon">
                <UploadOutlined style={{ color: "#1990FF" }} />
              </p>
              <p className="ant-upload-text">
                Nhấp hoặc kéo file chứng chỉ vào khu vực này để tải lên
              </p>
              <p className="ant-upload-hint">
                Hỗ trợ file PDF, JPG, PNG tối đa 10MB. Đảm bảo chứng chỉ có mã QR hoặc thông tin xác thực.
              </p>
            </Upload.Dragger>

            {uploadedFile && (
              <div className="uploaded-file-info">
                <Alert
                  message="File sẵn sàng để xác thực"
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
                  Phân tích & Xác thực file
                </Button>
              </div>
            )}
          </div>

          <Alert
            message="Xử lý file"
            description="Hệ thống AI của chúng tôi sẽ trích xuất dữ liệu xác thực từ các file đã tải lên và đối chiếu với hồ sơ blockchain."
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
      {notificationContextHolder}
      {/* Page Header */}
      <div className="page-header" style={{ position: "relative", textAlign: "center" }}>
        <Button
          type="default"
          size="large"
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: 999,
            paddingInline: 24,
            fontWeight: 500,
          }}
        >
          Trang chủ
        </Button>
        <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
          Cổng xác thực chứng chỉ
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Chọn phương thức ưa thích của bạn để xác thực chứng chỉ học thuật ngay lập tức
        </Text>
      </div>

      {isVerifying && (
        <Alert
          message="Đang xác thực"
          description="Vui lòng đợi trong khi chúng tôi xác thực chứng chỉ với hồ sơ blockchain..."
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
            <Title level={4}>Phương thức QR Code</Title>
            <Text type="secondary">
              Phương thức nhanh nhất và an toàn nhất. Chỉ cần quét mã QR từ chứng chỉ.
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable className="help-card">
            <SearchOutlined
              style={{ fontSize: 32, color: "#1890ff", marginBottom: 16 }}
            />
            <Title level={4}>Nhập thủ công</Title>
            <Text type="secondary">
              Nhập ID chứng chỉ thủ công khi mã QR không có sẵn.
            </Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable className="help-card">
            <FileTextOutlined
              style={{ fontSize: 32, color: "#722ed1", marginBottom: 16 }}
            />
            <Title level={4}>Phân tích file</Title>
            <Text type="secondary">
              Tải lên file kỹ thuật số để tự động phát hiện và xác thực chứng chỉ.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VerificationPortal;