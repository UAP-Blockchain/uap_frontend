import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  QRCode,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  DownloadOutlined,
  LinkOutlined,
  QrcodeOutlined,
  SafetyCertificateOutlined,
  BlockOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import CredentialServices from "../../../services/credential/api.service";
import { downloadCredentialPdfApi } from "../../../services/admin/credentials/api";
import type { StudentCredentialDto } from "../../../types/Credential";
import type { RootState } from "../../../redux/store";
import "./CredentialDetail.scss";

const { Title, Text, Paragraph } = Typography;

const certificateLabels: Record<string, string> = {
  SubjectCompletion: "Chứng chỉ hoàn thành môn học",
  SemesterCompletion: "Chứng chỉ hoàn thành học kỳ",
  RoadmapCompletion: "Chứng chỉ hoàn thành lộ trình",
};

const CredentialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [credential, setCredential] = useState<StudentCredentialDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) {
        setError("Thiếu mã chứng chỉ");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await CredentialServices.getMyCredentials();
        const found = data.find(
          (item) => item.id === id || item.credentialId === id
        );
        if (!found) {
          setError("Không tìm thấy chứng chỉ này trong tài khoản của bạn");
        } else {
          setCredential(found);
          setQrCodeData((found as any).shareableUrl || null);
        }
      } catch (err) {
        const messageText =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string }).message ||
          "Không thể tải dữ liệu chứng chỉ";
        setError(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDetail();
  }, [id]);

  const certificateTitle = useMemo(() => {
    if (!credential) return "";
    return (
      credential.subjectName ||
      credential.roadmapName ||
      certificateLabels[credential.certificateType] ||
      credential.certificateType
    );
  }, [credential]);

  const formattedIssuedDate = credential?.issuedDate
    ? dayjs(credential.issuedDate).format("DD/MM/YYYY")
    : "—";

  const handleCopyLink = async () => {
    if (!credential?.shareableUrl) return;
    try {
      await navigator.clipboard.writeText(credential.shareableUrl);
      void message.success("Đã sao chép liên kết xác thực");
    } catch {
      void message.error("Không thể sao chép liên kết");
    }
  };

  const handleDownloadCertificate = async () => {
    if (!credential) return;

    const fileUrl = (credential as any).fileUrl as string | undefined;
    if (fileUrl) {
      window.open(fileUrl, "_blank");
      return;
    }

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
      void message.success("Đã tải xuống chứng chỉ");
    } catch (err) {
      void message.error(
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Không thể tải xuống chứng chỉ",
      );
    }
  };

  const handleDownloadQr = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) {
      void message.error("Không tìm thấy hình ảnh QR để tải");
      return;
    }

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${credential?.credentialId || "credential"}-qr.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="credential-detail loading-state">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="credential-detail">
        <Alert
          type="error"
          message="Không thể tải chứng chỉ"
          description={error}
          showIcon
          action={
            <Button type="primary" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="credential-detail">
        <Empty description="Không tìm thấy chứng chỉ" />
      </div>
    );
  }

  const displayName = credential.studentName || userProfile?.fullName || "—";

  return (
    <div className="credential-detail">
      <div className="detail-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student-portal/credentials")}
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card className="credential-info-card" bordered={false}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space>
                <SafetyCertificateOutlined
                  style={{ fontSize: 32, color: "#1a94fc" }}
                />
                <div>
                  <Text type="secondary">
                    {certificateLabels[credential.certificateType] ||
                      "Chứng chỉ"}
                  </Text>
                  <Title level={3} style={{ margin: 0 }} className="info-title">
                    {certificateTitle}
                  </Title>
                </div>
              </Space>

              <Paragraph
                type="secondary"
                style={{ marginBottom: 0 }}
                className="info-description"
              >
                Chứng chỉ điện tử được xác thực bởi UAP Blockchain, đảm bảo tính
                toàn vẹn và có thể chia sẻ cho nhà tuyển dụng trong mọi bối
                cảnh.
              </Paragraph>

              <Divider className="card-divider" />

              <Space direction="vertical" size={12} className="info-grid">
                <div className="info-row">
                  <span>Họ và tên</span>
                  <span className="strong-text">{displayName}</span>
                </div>
                <div className="info-row">
                  <span>Mã chứng chỉ</span>
                  <Tag color="blue">{credential.credentialId}</Tag>
                </div>
                <div className="info-row">
                  <span>Ngày cấp</span>
                  <span>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    {formattedIssuedDate}
                  </span>
                </div>
                {credential.completionDate && (
                  <div className="info-row">
                    <span>Ngày hoàn thành</span>
                    <span>
                      <CalendarOutlined style={{ marginRight: 6 }} />
                      {dayjs(credential.completionDate).format("DD/MM/YYYY")}
                    </span>
                  </div>
                )}
                {credential.letterGrade && (
                  <div className="info-row">
                    <span>Điểm trung bình</span>
                    <Tag color="gold">{credential.letterGrade}</Tag>
                  </div>
                )}
                <div className="info-row">
                  <span>Trạng thái</span>
                  <Tag
                    color={credential.status === "Issued" ? "green" : "orange"}
                  >
                    {credential.status}
                  </Tag>
                </div>
                {credential.semesterName && (
                  <div className="info-row">
                    <span>Học kỳ</span>
                    <span>{credential.semesterName}</span>
                  </div>
                )}
                {credential.verificationHash && (
                  <div className="info-row">
                    <span>Hash xác thực</span>
                    <Tooltip title={credential.verificationHash}>
                      <Text code>
                        {credential.verificationHash.slice(0, 12)}...
                      </Text>
                    </Tooltip>
                  </div>
                )}
              </Space>

              <Divider className="card-divider" />

              <Space direction="vertical" size={12}>
                <Text strong>Tuỳ chọn</Text>
                <Space wrap>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadCertificate}
                  >
                    Tải PDF
                  </Button>
                  {credential.shareableUrl && (
                    <Button icon={<LinkOutlined />} onClick={handleCopyLink}>
                      Sao chép liên kết
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
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} className="certificate-qr-card">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                Mã QR xác thực
              </Title>
              <Text type="secondary">
                Quét mã QR này để mở trang xác thực chứng chỉ công khai.
              </Text>
              <div ref={qrRef} style={{ textAlign: "center", marginTop: 8 }}>
                {qrCodeData ? (
                  <QRCode value={qrCodeData} size={200} />
                ) : (
                  <Text type="secondary">
                    Không tìm thấy liên kết chia sẻ cho chứng chỉ này.
                  </Text>
                )}
              </div>
              <Button
                icon={<QrcodeOutlined />}
                onClick={handleDownloadQr}
                disabled={!qrCodeData}
              >
                Tải mã QR
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CredentialDetail;
