import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  Modal,
  notification,
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
  CloseCircleOutlined,
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
  type CredentialVerificationDto,
  revokeCredentialApi,
  verifyCredentialApi,
} from "../../../services/admin/credentials/api";
import { CREDENTIAL_MANAGEMENT_ADDRESS, getCredentialManagementContract } from "../../../blockchain/credential";
import { ensureCorrectNetwork, getBrowserProvider } from "../../../blockchain";
import "./CredentialDetail.scss";

const { Title, Text } = Typography;
const { TextArea } = Input;

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

const getEthersErrorMessage = (err: unknown) => {
  const anyErr = err as any;
  return (
    anyErr?.shortMessage ||
    anyErr?.reason ||
    anyErr?.data?.message ||
    anyErr?.info?.error?.message ||
    anyErr?.message ||
    "Không thể thực hiện giao dịch"
  );
};

const getErrorMessage = (err: unknown, fallback = "Có lỗi xảy ra") => {
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.detail ||
    anyErr?.response?.data?.message ||
    getEthersErrorMessage(err) ||
    fallback
  );
};

const shortenTxHash = (hash?: string | null) => {
  if (!hash) return "-";
  const h = String(hash);
  if (h.length <= 18) return h;
  return `${h.slice(0, 10)}...${h.slice(-8)}`;
};

const parseBigIntSafe = (value: unknown): bigint | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
    return BigInt(value);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return BigInt(trimmed);
    } catch {
      return null;
    }
  }
  return null;
};

// Hàm dịch message từ tiếng Anh sang tiếng Việt
const translateVerificationMessage = (message: string | null | undefined): string => {
  if (!message) return "";

  // Xử lý message có pattern "Certificate has been revoked. Reason: {reason}"
  if (message.includes("Certificate has been revoked")) {
    let translated = "Chứng chỉ đã bị thu hồi";
    if (message.includes("Reason:")) {
      const reasonMatch = message.match(/Reason:\s*(.+)/i);
      if (reasonMatch) {
        translated += `. Lý do: ${reasonMatch[1]}`;
      }
    } else if (message.includes("on ")) {
      // Xử lý "Certificate has been revoked on {date}"
      const dateMatch = message.match(/on\s+(.+)/i);
      if (dateMatch) {
        translated = `Chứng chỉ đã bị thu hồi vào ngày ${dateMatch[1]}`;
      }
    }
    return translated;
  }

  const translations: Record<string, string> = {
    "Certificate is valid and authentic": "Chứng chỉ hợp lệ và xác thực",
    "On-chain verification failed": "Xác minh on-chain thất bại",
    "On-chain record is revoked or expired": "Bản ghi on-chain đã bị thu hồi hoặc hết hạn",
    "Data does not match blockchain record (hash mismatch)": "Dữ liệu không khớp với bản ghi blockchain (hash không khớp)",
    "Error verifying certificate": "Lỗi khi xác minh chứng chỉ",
  };

  // Kiểm tra exact match
  if (translations[message]) {
    return translations[message];
  }

  // Kiểm tra partial match cho các message có thể chứa thông tin động
  for (const [key, value] of Object.entries(translations)) {
    if (message.includes(key)) {
      return message.replace(key, value);
    }
  }

  // Nếu không tìm thấy translation, trả về message gốc
  return message;
};

const CredentialDetail: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const navigate = useNavigate();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [credential, setCredential] = useState<CredentialDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(true);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState<CredentialVerificationDto | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isRevokingDb, setIsRevokingDb] = useState(false);
  const [isRevokingOnChain, setIsRevokingOnChain] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [revokeDbSaved, setRevokeDbSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<HTMLDivElement | null>(null);

  const fetchDetail = async () => {
    if (!credentialId) {
      setError("Thiếu mã chứng chỉ");
      setLoading(false);
      return;
    }

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

  useEffect(() => {
    void fetchDetail();
  }, [credentialId]);

  useEffect(() => {
    if (!credential) {
      return;
    }

    let active = true;
    setQrLoading(true);

    const fallbackUrl = (credential as any).shareableUrl || "";

    void getCredentialQRCodeApi(credential.id)
      .then((qr) => {
        if (!active) return;
        // Ưu tiên qrCodeData từ backend, nếu không có thì dùng shareableUrl
        const value = qr.qrCodeData || fallbackUrl;
        setQrCodeData(value);
      })
      .catch(() => {
        if (!active) return;
        setQrCodeData(fallbackUrl);
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

  useEffect(() => {
    if (!credential) {
      return;
    }

    let active = true;
    setVerifyLoading(true);
    setVerifyError(null);

    const credentialNumber = ((credential as any).credentialId || "") as string;
    const verificationHash = ((credential as any).verificationHash || "") as string;

    void verifyCredentialApi({
      credentialNumber: credentialNumber || undefined,
      verificationHash: verificationHash || undefined,
    })
      .then((res) => {
        if (!active) return;
        setVerifyResult(res);
      })
      .catch((err) => {
        if (!active) return;
        const messageText =
          (err as { response?: { data?: { detail?: string; message?: string } } })
            ?.response?.data?.detail ||
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          "Không thể xác thực chứng chỉ";
        setVerifyError(messageText);
        setVerifyResult(null);
      })
      .finally(() => {
        if (active) {
          setVerifyLoading(false);
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
      notificationApi.success({ message: "Đã tải xuống chứng chỉ", placement: "topRight" });
    } catch (err) {
      notificationApi.error({
        message: "Không thể tải xuống chứng chỉ",
        description:
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          "Không thể tải xuống chứng chỉ",
        placement: "topRight",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRevokeModal = () => {
    const status = (credential?.status || "").toLowerCase();
    if (status === "revoked") {
      notificationApi.info({
        message: "Chứng chỉ đã bị thu hồi",
        description: "Trạng thái hiện tại là Revoked nên không thể thu hồi thêm.",
        placement: "topRight",
      });
      return;
    }
    setRevocationReason("");
    setRevokeDbSaved(false);
    setRevokeModalOpen(true);
  };

  const handleRevokeDbOnly = async () => {
    if (!credential) return;

    const status = (credential.status || "").toLowerCase();
    if (status === "revoked") {
      notificationApi.info({
        message: "Chứng chỉ đã bị thu hồi",
        description: "Trạng thái hiện tại là Revoked.",
        placement: "topRight",
      });
      return;
    }

    const reason = (revocationReason || "").trim();
    if (!reason) {
      notificationApi.error({ message: "Vui lòng nhập lý do thu hồi.", placement: "topRight" });
      return;
    }

    setIsRevokingDb(true);
    try {
      await revokeCredentialApi(credential.id, { revocationReason: reason });
      setRevokeDbSaved(true);
      notificationApi.success({
        message: "Thu hồi DB thành công (1/2)",
        description: "Đã thu hồi trên hệ thống (DB). Tiếp theo bấm 'Ký on-chain' để MetaMask ký giao dịch.",
        placement: "topRight",
        duration: 4,
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Không thể thu hồi chứng chỉ");
      notificationApi.error({ message: "Thu hồi DB thất bại", description: msg, placement: "topRight" });
    } finally {
      setIsRevokingDb(false);
    }
  };

  const handleRevokeOnChain = async () => {
    if (!credential) return;

    if (!revokeDbSaved) {
      notificationApi.warning({ message: "Vui lòng bấm 'Thu hồi (DB)' trước.", placement: "topRight" });
      return;
    }

    const status = (credential.status || "").toLowerCase();
    if (status === "revoked") {
      notificationApi.info({
        message: "Chứng chỉ đã bị thu hồi",
        description: "Trạng thái hiện tại là Revoked.",
        placement: "topRight",
      });
      return;
    }

    const isOnBlockchain = !!(credential as any).isOnBlockchain;
    const blockchainCredentialId = (credential as any).blockchainCredentialId;

    if (!isOnBlockchain || blockchainCredentialId === null || blockchainCredentialId === undefined) {
      notificationApi.error({
        message: "Không thể thu hồi on-chain",
        description:
          "Đã thu hồi trên hệ thống (DB) nhưng không thể thu hồi on-chain vì chứng chỉ chưa có BlockchainCredentialId.",
        placement: "topRight",
      });
      return;
    }

    setIsRevokingOnChain(true);
    try {
      // Preflight: ensure MetaMask is on the expected chain (default Quorum chainId 1337)
      const expectedChainIdHex = import.meta.env.VITE_CHAIN_ID_HEX || "0x539";
      await ensureCorrectNetwork(expectedChainIdHex);

      // Preflight: ensure contract exists on current network
      const provider = await getBrowserProvider();
      const code = await provider.getCode(CREDENTIAL_MANAGEMENT_ADDRESS);
      if (!code || code === "0x") {
        notificationApi.error({
          message: "Không tìm thấy contract trên mạng hiện tại",
          description: `Không tìm thấy CredentialManagement tại ${CREDENTIAL_MANAGEMENT_ADDRESS}. Kiểm tra lại mạng MetaMask và VITE_CREDENTIAL_MANAGEMENT_ADDRESS.`,
          placement: "topRight",
          duration: 6,
        });
        return;
      }

      const credentialIdBigInt = parseBigIntSafe(blockchainCredentialId);
      if (credentialIdBigInt === null) {
        notificationApi.error({
          message: "BlockchainCredentialId không hợp lệ",
          description: `Giá trị: ${String(blockchainCredentialId)}`,
          placement: "topRight",
        });
        return;
      }

      const contract = await getCredentialManagementContract();

      // Preflight: simulate to surface authorization/revert errors (prevents "click but no MetaMask")
      try {
        await contract.revokeCredential.staticCall(credentialIdBigInt);
      } catch (err) {
        const msg = getEthersErrorMessage(err);
        notificationApi.error({
          message: "Không thể thu hồi on-chain (mô phỏng thất bại)",
          description: `${msg}. (Gợi ý: ví hiện tại có thể không có quyền thu hồi; hãy đổi sang ví quản trị/issuer đã deploy hoặc được cấp quyền trên contract.)`,
          placement: "topRight",
          duration: 6,
        });
        return;
      }

      const tx = await contract.revokeCredential(credentialIdBigInt);
      notificationApi.info({
        message: "Đã gửi giao dịch thu hồi on-chain",
        description: `Tx: ${shortenTxHash(tx.hash)}`,
        placement: "topRight",
        duration: 4,
      });

      const receipt = await tx.wait();
      if ((receipt as any)?.status === 0) {
        throw new Error("Giao dịch thu hồi on-chain thất bại (receipt.status=0)");
      }

      notificationApi.success({
        message: "Thu hồi thành công (2/2)",
        description: `Đã cập nhật DB và đã thu hồi trên blockchain. Tx: ${shortenTxHash(receipt?.hash || tx.hash)}`,
        placement: "topRight",
        duration: 4,
      });
      setRevokeModalOpen(false);
      await fetchDetail();
    } catch (err) {
      const msg = getErrorMessage(err, "Không thể thu hồi chứng chỉ");
      notificationApi.error({
        message: "Thu hồi on-chain thất bại",
        description: `${msg}. (Lưu ý: DB có thể đã cập nhật thu hồi, nhưng giao dịch on-chain có thể chưa thành công.)`,
        placement: "topRight",
        duration: 6,
      });
    } finally {
      setIsRevokingOnChain(false);
    }
  };

  const copyToClipboard = async (value?: string | null, success = "Đã sao chép") => {
    if (!value) {
      notificationApi.warning({ message: "Không có giá trị để sao chép", placement: "topRight" });
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      notificationApi.success({ message: success, placement: "topRight" });
    } catch {
      notificationApi.error({ message: "Không thể sao chép vào clipboard", placement: "topRight" });
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

  const rawQr = (qrCodeData || "") as string;
  const shareableUrl = ((credential as any).shareableUrl || "") as string;
  const qrValue = (
    rawQr && rawQr.length <= 300 ? rawQr : ""
  ) || shareableUrl.trim();

  const handleDownloadQr = () => {
    if (!qrValue || !qrRef.current) {
      notificationApi.warning({ message: "Không có mã QR để tải xuống", placement: "topRight" });
      return;
    }

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) {
      notificationApi.error({ message: "Không tìm thấy hình ảnh QR để tải xuống", placement: "topRight" });
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${(credential as any).credentialId || credential.id || "qr-code"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-credential-detail">
      {notificationContextHolder}
      <Modal
        open={revokeModalOpen}
        title="Thu hồi chứng chỉ"
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              if (!isRevokingDb && !isRevokingOnChain) {
                setRevokeModalOpen(false);
              }
            }}
            disabled={isRevokingDb || isRevokingOnChain}
          >
            Hủy
          </Button>,
          !revokeDbSaved ? (
            <Button
              key="revoke-db"
              danger
              type="primary"
              loading={isRevokingDb}
              disabled={isRevokingOnChain}
              onClick={handleRevokeDbOnly}
            >
              Thu hồi (DB)
            </Button>
          ) : (
            <Button
              key="revoke-chain"
              type="primary"
              ghost
              danger
              loading={isRevokingOnChain}
              disabled={isRevokingDb}
              onClick={handleRevokeOnChain}
            >
              Ký on-chain
            </Button>
          ),
        ]}
        onCancel={() => {
          if (!isRevokingDb && !isRevokingOnChain) {
            setRevokeModalOpen(false);
          }
        }}
      >
        <div style={{ marginBottom: 8 }}>
          Nhập lý do thu hồi (bắt buộc). Hệ thống sẽ lưu DB trước, sau đó bạn bấm "Ký on-chain" để MetaMask ký giao dịch thu hồi.
        </div>
        <TextArea
          rows={3}
          placeholder="Ví dụ: Phát hiện giả mạo / sai dữ liệu / yêu cầu thu hồi..."
          value={revocationReason}
          onChange={(e) => setRevocationReason(e.target.value)}
        />
      </Modal>

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
                <Descriptions.Item label="Mã chứng chỉ" span={2}>
                  <Space align="center">
                    {(credential as any).credentialId || credential.id}
                    <Tooltip title="Sao chép mã chứng chỉ">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard((credential as any).credentialId)}
                      />
                    </Tooltip>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cấp" span={1}>
                  <Space>
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
                      <Text>{(credential as any).verificationHash}</Text>
                      <Tooltip title="Sao chép Verification hash">
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard((credential as any).verificationHash)}
                        />
                      </Tooltip>
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

              {verifyLoading ? (
                <Spin size="small" />
              ) : verifyResult ? (
                <Alert
                  type={verifyResult.isValid ? "success" : "error"}
                  showIcon
                  message={
                    verifyResult.isValid
                      ? "Xác thực: Hợp lệ"
                      : "Xác thực: Không hợp lệ"
                  }
                  description={translateVerificationMessage(verifyResult.message)}
                />
              ) : verifyError ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Không thể xác thực"
                  description={translateVerificationMessage(verifyError)}
                />
              ) : null}

              {verifyResult && !verifyResult.isValid && (
                (credential.status || "").toLowerCase() !== "revoked"
              ) && (
                <Button
                  danger
                  type="primary"
                  icon={<CloseCircleOutlined />}
                  onClick={handleOpenRevokeModal}
                  loading={isRevokingDb || isRevokingOnChain}
                  disabled={actionLoading || loading}
                >
                  Thu hồi
                </Button>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={6}>
          <Card className="credential-qr-card" bordered={false}>
            <div className="qr-preview" ref={qrRef}>
              {qrLoading ? (
                <Spin />
              ) : qrValue ? (
                <QRCode value={qrValue} size={200} />
              ) : (
                <Alert
                  type="warning"
                  message="Không thể tạo mã QR vì không có liên kết xác thực."
                  showIcon
                />
              )}
            </div>
            <Text type="secondary" className="qr-helper">
              Quét mã để xác thực chứng chỉ
            </Text>
            <div className="qr-actions">
              <Space size={12}>
                <Button
                  type="primary"
                  onClick={handleDownloadQr}
                  disabled={qrLoading || !qrValue}
                >
                  Tải mã QR
                </Button>
                {(credential as any).shareableUrl && (
                  <Button
                    type="default"
                    icon={<LinkOutlined />}
                    onClick={() =>
                      copyToClipboard(
                        (credential as any).shareableUrl,
                        "Đã sao chép liên kết xác thực",
                      )
                    }
                  >
                    Liên kết xác thực
                  </Button>
                )}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CredentialDetail;