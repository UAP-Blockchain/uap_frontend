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
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CredentialServices from "../../services/credential/api.service";
import type { CertificatePublicDto } from "../../types/Credential";
import "./VerificationResults/VerificationResults.scss";

const { Title, Text, Paragraph } = Typography;

const certificateLabels: Record<string, string> = {
  SubjectCompletion: "Chứng chỉ hoàn thành môn học",
  SemesterCompletion: "Chứng chỉ hoàn thành học kỳ",
  RoadmapCompletion: "Chứng chỉ hoàn thành lộ trình",
};

const CertificateVerifyDetail: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [credential, setCredential] = useState<CertificatePublicDto | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!credentialId) {
        setError("Thiếu mã chứng chỉ");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await CredentialServices.getPublicCertificateById(
          credentialId
        );
        setCredential(data as CertificatePublicDto);
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
  }, [credentialId]);

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
    ? dayjs(credential.issuedDate).format("DD MMMM, YYYY")
    : "—";

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current || !credential) return;
    const canvas = await html2canvas(certificateRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`${credential.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="verification-results-page">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="verification-results-page">
        <Alert
          type="error"
          message="Không thể xác thực chứng chỉ"
          description={error}
          showIcon
          action={
            <Button
              type="primary"
              onClick={() => navigate("/public-portal/verify")}
            >
              Quay lại cổng xác thực
            </Button>
          }
        />
      </div>
    );
  }

  if (!credential) {
    return (
      <div className="verification-results-page">
        <Empty description="Không tìm thấy chứng chỉ hoặc chứng chỉ không hợp lệ" />
      </div>
    );
  }

  const displayName = credential.studentName || "—";

  return (
    <div className="verification-results-page">
      <div className="results-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/public-portal/verify")}
        >
          Quay lại cổng xác thực
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="result-card" bordered={false}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space>
                <SafetyCertificateOutlined
                  style={{ fontSize: 32, color: "#1a94fc" }}
                />
                <div>
                  <Text type="secondary">
                    {certificateLabels[credential.certificateType] || "Chứng chỉ"}
                  </Text>
                  <Title level={3} style={{ margin: 0 }}>
                    {certificateTitle}
                  </Title>
                </div>
              </Space>

              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Chứng chỉ điện tử đã được xác thực bởi UAP Blockchain. Thông tin
                dưới đây được truy xuất trực tiếp từ hệ thống và không thể bị
                chỉnh sửa.
              </Paragraph>

              <Divider />

              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <div className="info-row">
                  <span>Họ và tên</span>
                  <span className="strong-text">{displayName}</span>
                </div>
                <div className="info-row">
                  <span>Mã chứng chỉ</span>
                  <Tag color="blue">{credential.id}</Tag>
                </div>
                <div className="info-row">
                  <span>Ngày cấp</span>
                  <span>
                    <CalendarOutlined style={{ marginRight: 6 }} />
                    {formattedIssuedDate}
                  </span>
                </div>
                {/* CertificatePublicDto hiện không có completionDate; nếu backend thêm thì hiển thị lại */}
                {credential.letterGrade && (
                  <div className="info-row">
                    <span>Điểm trung bình</span>
                    <Tag color="gold">{credential.letterGrade}</Tag>
                  </div>
                )}
                <div className="info-row">
                  <span>Trạng thái</span>
                  <Tag color={credential.status === "Issued" ? "green" : "orange"}>
                    {credential.status}
                  </Tag>
                </div>
                {credential.semesterName && (
                  <div className="info-row">
                    <span>Học kỳ</span>
                    <span>{credential.semesterName}</span>
                  </div>
                )}
                {credential.credentialHash && (
                  <div className="info-row">
                    <span>Hash xác thực</span>
                    <Tooltip title={credential.credentialHash}>
                      <Text code>{credential.credentialHash.slice(0, 12)}...</Text>
                    </Tooltip>
                  </div>
                )}
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card bordered={false} className="certificate-preview-card">
            <div className="certificate-preview" ref={certificateRef}>
              <div className="certificate-header">
                <div className="issuer-block">
                  <Text className="issuer-name">UAP Blockchain</Text>
                  <Text className="certificate-type">
                    {certificateLabels[credential.certificateType] || "Chứng chỉ"}
                  </Text>
                </div>
                <Badge
                  count="Đã xác thực on-chain"
                  style={{ backgroundColor: "#1a94fc" }}
                />
              </div>

              <div className="certificate-body">
                <Text className="caption">CHỨNG NHẬN RẰNG</Text>
                <Title level={1} className="recipient">
                  {displayName}
                </Title>
                <Paragraph className="description">
                  đã hoàn thành chương trình học
                </Paragraph>
                <Title level={2} className="program">
                  {certificateTitle}
                </Title>
                <Paragraph className="details">
                  Cấp ngày {formattedIssuedDate} · Mã sinh viên {credential.studentCode}
                </Paragraph>
              </div>

              <div className="certificate-footer">
                <div className="signature-block">
                  <div className="signature" />
                  <Text>Phòng Đào tạo</Text>
                </div>
                <div className="seal">FAP</div>
              </div>
            </div>

            <div className="certificate-actions">
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                onClick={handleDownloadCertificate}
              >
                Tải chứng chỉ PDF
              </Button>
              <Text type="secondary">
                * File PDF được xuất giống như mẫu chứng chỉ đang hiển thị.
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CertificateVerifyDetail;
