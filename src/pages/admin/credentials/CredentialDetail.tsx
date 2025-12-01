import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  QRCode,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
	ArrowLeftOutlined,
	BlockOutlined,
	CalendarOutlined,
	CopyOutlined,
	DownloadOutlined,
	LinkOutlined,
	QrcodeOutlined,
	SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { CredentialDetailDto } from "../../../types/Credential";
import {
	downloadCredentialPdfApi,
	getCredentialByIdApi,
	getCredentialQRCodeApi,
} from "../../../services/admin/credentials/api";
import CredentialServices from "../../../services/credential/api.service";
import "./CredentialDetail.scss";

const { Title, Text } = Typography;

const statusBadgeColors: Record<string, "success" | "warning" | "error" | "default"> = {
  issued: "success",
  active: "success",
  revoked: "error",
  pending: "warning",
};

const typeLabels: Record<string, string> = {
  Completion: "Hoàn thành",
  Subject: "Môn học",
  Semester: "Học kỳ",
  Roadmap: "Lộ trình",
  SubjectCompletion: "Chứng chỉ môn học",
  SemesterCompletion: "Chứng chỉ học kỳ",
  RoadmapCompletion: "Chứng chỉ lộ trình",
};

const formatDateDisplay = (date?: string | null, fallback = "—") => {
  if (!date) {
    return fallback;
  }
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallback;
};

const MAX_QR_LENGTH = 800;

const CredentialDetail: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [credential, setCredential] = useState<CredentialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!credentialId) {
      setError("Thiếu mã chứng chỉ");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getCredentialByIdApi(credentialId);
        setCredential({
          ...result,
          issueDate: result.issueDate || (result as Record<string, any>).issuedDate || "",
        });
      } catch (err) {
        const messageText =
          (err as { response?: { data?: { detail?: string; message?: string } } })
            ?.response?.data?.detail ||
          (err as { message?: string }).message ||
          "Không thể tải thông tin chứng chỉ";
        setError(messageText);
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [credentialId]);

  useEffect(() => {
    if (!credential) {
      return;
    }

    let active = true;
    setQrLoading(true);
    void getCredentialQRCodeApi(credential.id)
      .then((qr) => {
        if (active) {
          setQrCodeData(qr.qrCodeData);
        }
      })
      .catch(() => {
        if (active) {
          setQrCodeData((credential as any).shareableUrl || "");
        }
      })
      .finally(() => {
        if (active) {
          setQrLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [credential]);

  const certificateTitle = useMemo(() => {
    if (!credential) return "";
    return (
      credential.subjectName ||
      credential.semesterName ||
      credential.roadmapName ||
      typeLabels[credential.certificateType] ||
      credential.certificateType
    );
  }, [credential]);

  const handleDownloadQr = () => {
    try {
      const canvas = document.querySelector(
        "#admin-credential-qr canvas"
      ) as HTMLCanvasElement | null;

      if (!canvas) {
        message.error("Không tìm thấy QR để tải");
        return;
      }

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${(credential as any)?.credentialId || credential?.id || "credential-qr"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      message.error("Không thể xuất ảnh QR");
    }
  };

  const handleDownloadPdf = async () => {
    if (!credential) return;
    setActionLoading(true);
    try {
      const blob = await downloadCredentialPdfApi(credential.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${(credential as any).credentialId || credential.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Đã tải xuống chứng chỉ");
    } catch (err) {
      message.error(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          "Không thể tải xuống chứng chỉ"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = async (value?: string | null, success = "Đã sao chép") => {
    if (!value) {
      message.warning("Không có giá trị để sao chép");
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      message.success(success);
    } catch {
      message.error("Không thể sao chép vào clipboard");
    }
  };

  const renderStatusTag = () => {
    if (!credential) return null;
    return (
      <Badge
        status={statusBadgeColors[credential.status.toLowerCase()] || "default"}
        text={credential.status}
      />
    );
  };

  if (loading) {
    return (
      <div className="admin-credential-detail loading">
        <Spin tip="Đang tải thông tin chứng chỉ..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-credential-detail">
        <Alert type="error" message="Không thể tải chứng chỉ" description={error} showIcon />
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="admin-credential-detail">
        <Alert type="warning" message="Không tìm thấy chứng chỉ" showIcon />
      </div>
    );
  }

  // Ưu tiên dùng qrCodeData; nếu quá dài thì fallback sang shareableUrl (nếu có),
  // cuối cùng mới dùng credentialHash. Nếu tất cả đều quá dài thì không render QR.
  const primaryQrValue = qrCodeData || credential.credentialHash || "";
  const shareableUrl = (credential as any).shareableUrl || "";

  let safeQrValue = "";
  let isQrTooLong = false;

  if (primaryQrValue && primaryQrValue.length <= MAX_QR_LENGTH) {
    safeQrValue = primaryQrValue;
  } else if (shareableUrl && shareableUrl.length <= MAX_QR_LENGTH) {
    safeQrValue = shareableUrl;
  } else {
    isQrTooLong = Boolean(primaryQrValue || shareableUrl);
  }

  return (
    <div className="admin-credential-detail">
      <div className="detail-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/admin/credentials")}>
          Quay lại danh sách
        </Button>
       
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={18}>
          <Card className="credential-summary-card" bordered={false}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space className="summary-heading" align="center" size={12}>
                <SafetyCertificateOutlined style={{ fontSize: 32, color: "#1a94fc" }} />
                <div>
                  <Text type="secondary">Thông tin chứng chỉ</Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {certificateTitle}
                  </Title>
                </div>
                <Tag color="blue">{typeLabels[credential.certificateType] || credential.certificateType}</Tag>
              </Space>
              <Descriptions bordered size="small" column={2} layout="horizontal">
                <Descriptions.Item label="Họ và tên" span={2}>
                  {credential.studentName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Mã sinh viên">
                  {credential.studentCode || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Mã chứng chỉ">
                  {(credential as any).credentialId || credential.id}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cấp">
                  <Space>
                    <CalendarOutlined />
                    {formatDateDisplay(credential.issueDate, "Chưa cấp")}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày hoàn thành">
                  {formatDateDisplay(credential.completionDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {renderStatusTag()}
                </Descriptions.Item>
                <Descriptions.Item label="Loại" span={2}>
                  {typeLabels[credential.certificateType] || credential.certificateType}
                </Descriptions.Item>
                <Descriptions.Item label="Điểm chữ">
                  {credential.letterGrade || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Điểm số">
                  {credential.finalGrade?.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }) || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Số lần xem">
                  {(credential as any).viewCount ?? 0}
                </Descriptions.Item>
                {(credential as any).verificationHash && (
                  <Descriptions.Item label="Verification Hash" span={2}>
                    <Space align="center">
                      <Text copyable>{(credential as any).verificationHash}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
              <Divider style={{ margin: 0 }} />
              <Space wrap className="summary-actions">
                {(credential as any).fileUrl && (
                  <Button
                    icon={<DownloadOutlined />}
                    type="default"
                    onClick={() => window.open((credential as any).fileUrl, "_blank")}
                  >
                    Tải file gốc
                  </Button>
                )}
                {(credential as any).isOnBlockchain ? (
                  <Tag icon={<BlockOutlined />} color="green">
                    Đã ghi blockchain
                  </Tag>
                ) : (
                  <Tag icon={<BlockOutlined />} color="default">
                    Chưa ghi blockchain
                  </Tag>
                )}
              </Space>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card className="credential-qr-card" bordered={false}>
            <div className="qr-preview">
              {qrLoading ? (
                <Spin />
              ) : isQrTooLong || !safeQrValue ? (
                <Text type="secondary">Dữ liệu quá dài, không thể tạo QR</Text>
              ) : (
                <QRCode
                  id="admin-credential-qr"
                  value={safeQrValue}
                  size={200}
                />
              )}
            </div>
            <Text type="secondary" className="qr-helper">
              Quét mã để xác thực chứng chỉ
            </Text>
            <Space direction="vertical" size={12} className="qr-meta" align="center">
              {credential.blockchainTxHash && (
                <Space align="center" size={4}>
                  <BlockOutlined />
                  <Text copyable>{credential.blockchainTxHash}</Text>
                </Space>
              )}
              <Space direction="vertical" size={8} align="center">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadQr}
                  disabled={!qrCodeData}
                >
                  Tải ảnh QR
                </Button>
                {(credential as any).shareableUrl && (
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => copyToClipboard((credential as any).shareableUrl, "Đã sao chép liên kết xác thực")}
                  >
                    Liên kết xác thực
                  </Button>
                )}
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CredentialDetail;
