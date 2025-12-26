import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Typography,
  Spin,
  Table,
  message,
  Modal,
  Form,
  Input,
  Select,
  notification,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Cấu hình dayjs UTC plugin
dayjs.extend(utc);
import type {
  CredentialRequestDto,
  CredentialDetailDto,
  CredentialRequestPreIssueVerifyDto,
} from "../../../services/admin/credentials/api";
import {
  getCredentialRequestByIdApi,
  approveCredentialRequestApi,
  rejectCredentialRequestApi,
  getCredentialRequestPreIssueVerifyApi,
} from "../../../services/admin/credentials/api";
import {
  getCertificateTemplatesApi,
  type CertificateTemplateDto,
} from "../../../services/admin/certificateTemplates/api";
import { getCredentialManagementContract } from "../../../blockchain/credential";
import { saveCredentialOnChainApi } from "../../../services/admin/credentials/api";
import { ethers } from "ethers";
import "./RequestDetail.scss";

const { Text } = Typography;
const { Option } = Select;

const CredentialRequestDetailAdmin: React.FC = () => {
  const [notificationApi, contextHolder] = notification.useNotification();
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CredentialRequestDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyData, setVerifyData] =
    useState<CredentialRequestPreIssueVerifyDto | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approvedCredential, setApprovedCredential] =
    useState<CredentialDetailDto | null>(null);
  const [isSigningOnChain, setIsSigningOnChain] = useState(false);
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState<CertificateTemplateDto[]>([]);

  const loadRequest = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      const data = await getCredentialRequestByIdApi(requestId);
      setRequest(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.detail || "Không thể tải chi tiết đơn yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadVerify = async () => {
    if (!requestId) return;
    setVerifyLoading(true);
    try {
      const data = await getCredentialRequestPreIssueVerifyApi(requestId);
      setVerifyData(data);
    } catch (error: any) {
      message.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Không thể tải dữ liệu xác minh trước khi cấp"
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await getCertificateTemplatesApi(undefined, false);
        setTemplates(data);
      } catch (error: any) {
        message.error(
          error?.response?.data?.detail || "Không thể tải danh sách template"
        );
      }
    };
    loadTemplates();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    // Parse UTC time từ ISO string và convert sang GMT+7 (+7 giờ)
    const d = dayjs.utc(value).utcOffset(7);
    return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : value;
  };

  const getStatusTag = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "pending":
        return <Tag color="gold">Đang chờ</Tag>;
      case "approved":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã duyệt
          </Tag>
        );
      case "rejected":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Đã từ chối
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleApproveOnChain = async () => {
    if (!request) return;
    try {
      const values = await form.validateFields();
      setProcessing(true);
      const approved = await approveCredentialRequestApi(request.id, {
        action: "Approve",
        templateId: values.templateId,
        adminNotes: values.adminNotes,
      } as any);
      setApprovedCredential(approved);
      notificationApi.success({
        message: "Phê duyệt nội bộ thành công (1/2)",
        description:
          "Đã phê duyệt đơn yêu cầu nội bộ. Tiếp theo, bấm “Ký & lưu on-chain” để hoàn tất.",
        placement: "topRight",
        duration: 4,
      });
      setApproveModalVisible(false);
      form.resetFields();
      loadRequest();
    } catch (error: unknown) {
      if ((error as any)?.errorFields) {
        return;
      }
      let errorMessage = "Không thể phê duyệt đơn yêu cầu";
      if (typeof error === "object" && error !== null) {
        const errObj = error as any;
        errorMessage =
          errObj?.response?.data?.detail ||
          errObj?.response?.data?.message ||
          errObj?.detail ||
          errObj?.message ||
          errorMessage;
      }
      notificationApi.error({
        message: "Phê duyệt thất bại",
        description: errorMessage,
        placement: "topRight",
        duration: 5,
      });
    } finally {
      setProcessing(false);
    }
  };
  const openApproveModalOnChain = () => {
    form.resetFields();
    setApproveModalVisible(true);
  };

  const handleSignOnChain = async () => {
    if (!approvedCredential) {
      message.error("Chưa có chứng chỉ đã duyệt để ký on-chain.");
      return;
    }
    try {
      setIsSigningOnChain(true);
      const payload = approvedCredential.onChainPayload as {
        studentWalletAddress: string;
        credentialType: string;
        credentialDataJson: string;
        expiresAtUnix: number;
        verificationHash: string;
      } | null;

      if (!payload) {
        throw new Error("Backend không gửi OnChainPayload cho credential.");
      }

      const contract = await getCredentialManagementContract();

      const expiresAtBigInt = BigInt(payload.expiresAtUnix ?? 0);

      let verificationHashBytes32 = ethers.ZeroHash;
      if (payload.verificationHash) {
        try {
          const binary = atob(payload.verificationHash);
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          if (bytes.length !== 32) {
            throw new Error(
              `VerificationHash không hợp lệ, độ dài ${bytes.length} thay vì 32 bytes`
            );
          }
          const hex =
            "0x" +
            Array.from(bytes)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
          verificationHashBytes32 = hex as `0x${string}`;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("Không decode được verificationHash base64:", e);
          throw new Error(
            "VerificationHash trong payload không hợp lệ, không thể ký on-chain."
          );
        }
      }

      const tx = await contract.issueCredential(
        payload.studentWalletAddress,
        payload.credentialType,
        payload.credentialDataJson,
        verificationHashBytes32,
        expiresAtBigInt
      );

      const receipt = await tx.wait();

      let blockchainCredentialId: string | undefined;
      try {
        const ev = contract.interface.getEvent("CredentialIssued");
        const topic = (ev as any)?.topicHash as string | undefined;

        if (topic) {
          for (const log of receipt.logs) {
            if (log.topics[0] === topic) {
              const parsed = contract.interface.parseLog({
                topics: log.topics,
                data: log.data,
              }) as any;
              const idValue = parsed?.args?.[0];
              if (idValue != null) {
                blockchainCredentialId = idValue.toString();
              }
              break;
            }
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Không parse được CredentialIssued event", e);
      }

      await saveCredentialOnChainApi(approvedCredential.id, {
        transactionHash: receipt.hash,
        blockchainCredentialId,
        blockNumber: receipt.blockNumber
          ? Number(receipt.blockNumber)
          : undefined,
        chainId: receipt.chainId ? Number(receipt.chainId) : undefined,
        contractAddress: (contract.target as any)?.toString?.(),
      });

      const txHash = receipt.hash || tx.hash;
      const shortTxHash = txHash
        ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
        : "-";

      notificationApi.success({
        message: "Hoàn tất ký & lưu on-chain (2/2)",
        description: `Đã phát hành chứng chỉ on-chain và lưu trạng thái vào hệ thống. Tx: ${shortTxHash}${
          blockchainCredentialId
            ? ` | CredentialId: ${blockchainCredentialId}`
            : ""
        }`,
        placement: "topRight",
        duration: 5,
      });

      setApprovedCredential(null);
      loadRequest();
    } catch (error: any) {
      message.error(
        error?.response?.data?.detail ||
          error?.message ||
          "Không thể ký và lưu on-chain chứng chỉ"
      );
    } finally {
      setIsSigningOnChain(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;
    try {
      setProcessing(true);
      const values = await form.validateFields();
      await rejectCredentialRequestApi(request.id, {
        action: "Reject",
        adminNotes: values.adminNotes,
      } as any);
      message.success("Đã từ chối đơn yêu cầu.");
      setRejectModalVisible(false);
      form.resetFields();
      loadRequest();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(
          error?.response?.data?.detail || "Không thể từ chối đơn yêu cầu"
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const disabledActions =
    !request || request.status !== "Pending" || processing;

  const attendanceAllVerified =
    (verifyData?.attendance?.length ?? 0) > 0 &&
    (verifyData?.attendance ?? []).every((x) => x.verified);

  const gradesAllVerified =
    (verifyData?.grades?.length ?? 0) > 0 &&
    (verifyData?.grades ?? []).every((x) => x.verified);

  const canProceedAfterVerify = attendanceAllVerified && gradesAllVerified;

  // Hàm dịch message từ tiếng Anh sang tiếng Việt
  const translateMessage = (message: string | null | undefined): string => {
    if (!message) return "";

    const translations: Record<string, string> = {
      "Pre-issue verification is currently supported for SubjectCompletion only.":
        "Xác minh trước khi cấp hiện chỉ hỗ trợ cho loại SubjectCompletion.",
      "Missing SubjectId on credential request.":
        "Thiếu SubjectId trong yêu cầu chứng chỉ.",
      "Cannot resolve a class for this request (student not enrolled or subject/semester mismatch).":
        "Không thể xác định lớp học cho yêu cầu này (sinh viên chưa đăng ký hoặc không khớp môn học/học kỳ).",
      "Could not verify attendance list.":
        "Không thể xác minh danh sách điểm danh.",
      "Could not verify grade list.": "Không thể xác minh danh sách điểm số.",
      "Class has no OnChainClassId": "Lớp học chưa có OnChainClassId",
      "Student has no wallet address": "Sinh viên chưa có địa chỉ ví",
      "Attendance has no OnChainRecordId": "Điểm danh chưa có OnChainRecordId",
      "Attendance has no OnChainTransactionHash":
        "Điểm danh chưa có OnChainTransactionHash",
      "Grade has no OnChainRecordId": "Điểm số chưa có OnChainRecordId",
      "Grade has no OnChainTransactionHash":
        "Điểm số chưa có OnChainTransactionHash",
      Verified: "Đã xác minh",
      "Not verified": "Chưa xác minh",
      OK: "Đã xác minh",
      FAIL: "Thất bại",
    };

    // Kiểm tra exact match trước
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

  return (
    <div className="credential-request-detail-page">
      {contextHolder}
      <div className="detail-header">
        <div className="header-left">
          <Button
            className="back-button"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
          <div className="header-title">
            <FileTextOutlined />
            <span>Chi tiết đơn yêu cầu chứng chỉ</span>
          </div>
        </div>
        <Space>
          {canProceedAfterVerify ? (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={disabledActions}
              loading={processing && request?.status === "Pending"}
              onClick={openApproveModalOnChain}
            >
              Duyệt nội bộ
            </Button>
          ) : null}

          {canProceedAfterVerify && approvedCredential ? (
            <Button
              type="primary"
              ghost
              icon={<CheckCircleOutlined />}
              disabled={isSigningOnChain}
              loading={isSigningOnChain}
              onClick={handleSignOnChain}
            >
              Ký & lưu on-chain
            </Button>
          ) : null}
          <Button
            danger
            icon={<CloseCircleOutlined />}
            disabled={disabledActions}
            loading={processing && request?.status === "Pending"}
            onClick={() => {
              form.resetFields();
              setRejectModalVisible(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          {request && (
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Trạng thái" span={2}>
                {getStatusTag(request.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Sinh viên">
                <Space>
                  <UserOutlined />
                  <span>{request.studentName}</span>
                </Space>
                <div style={{ fontSize: 12, color: "#888" }}>
                  Mã SV: {request.studentCode}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Loại chứng chỉ">
                {request.certificateType}
              </Descriptions.Item>
              {request.subjectName && (
                <Descriptions.Item label="Môn học" span={2}>
                  {request.subjectName}
                </Descriptions.Item>
              )}
              {request.semesterName && (
                <Descriptions.Item label="Học kỳ" span={2}>
                  {request.semesterName}
                </Descriptions.Item>
              )}
              {request.roadmapName && (
                <Descriptions.Item label="Lộ trình" span={2}>
                  {request.roadmapName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Ngày yêu cầu">
                {formatDate(request.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xử lý">
                {formatDate(request.processedAt)}
              </Descriptions.Item>
              {request.rejectionReason && (
                <Descriptions.Item label="Lý do từ chối" span={2}>
                  {request.rejectionReason}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Spin>
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Xác minh trước khi cấp (DB ↔ Blockchain)"
        extra={
          <Button onClick={loadVerify} loading={verifyLoading}>
            Tải xác minh
          </Button>
        }
      >
        <Spin spinning={verifyLoading}>
          {!verifyData ? (
            <Text type="secondary">
              Nhấn "Tải xác minh" để xem danh sách điểm danh/điểm số đã đối
              chiếu.
            </Text>
          ) : (
            <>
              <Space wrap style={{ marginBottom: 12 }}>
                {verifyData.classCode ? (
                  <Tag>Lớp: {verifyData.classCode}</Tag>
                ) : (
                  <Tag>Lớp: -</Tag>
                )}

                <Tag color={attendanceAllVerified ? "green" : "red"}>
                  Điểm danh:{" "}
                  {attendanceAllVerified ? "Đã xác minh" : "Chưa xác minh"}
                </Tag>
                <Tag color={gradesAllVerified ? "green" : "red"}>
                  Điểm số: {gradesAllVerified ? "Đã xác minh" : "Chưa xác minh"}
                </Tag>

                {verifyData.message ? (
                  <Tag color="gold">{translateMessage(verifyData.message)}</Tag>
                ) : null}
              </Space>

              <div style={{ marginBottom: 16 }}>
                <Text strong>Điểm danh</Text>
                <Table
                  size="small"
                  rowKey={(r) => r.attendance.id}
                  pagination={{ pageSize: 5 }}
                  dataSource={verifyData.attendance ?? []}
                  columns={[
                    {
                      title: "Ngày",
                      render: (_, r) =>
                        dayjs(r.attendance.date).format("DD/MM/YYYY"),
                    },
                    {
                      title: "Ca",
                      dataIndex: ["attendance", "timeSlotName"],
                    },
                    {
                      title: "Có mặt",
                      render: (_, r) =>
                        r.attendance.isPresent ? (
                          <Tag color="green">Có</Tag>
                        ) : (
                          <Tag color="red">Không</Tag>
                        ),
                    },
                    {
                      title: "Trạng thái",
                      render: (_, r) =>
                        r.verified ? (
                          <Tag color="green">Đã xác minh</Tag>
                        ) : (
                          <Tag color="red">Thất bại</Tag>
                        ),
                    },
                    {
                      title: "Thông báo",
                      dataIndex: "message",
                      ellipsis: true,
                      render: (message: string | null | undefined) =>
                        translateMessage(message),
                    },
                  ]}
                />
              </div>

              <div>
                <Text strong>Điểm số</Text>
                <Table
                  size="small"
                  rowKey={(r) => r.grade.id}
                  pagination={{ pageSize: 5 }}
                  dataSource={verifyData.grades ?? []}
                  columns={[
                    {
                      title: "Thành phần",
                      dataIndex: ["grade", "componentName"],
                    },
                    {
                      title: "Trọng số",
                      dataIndex: ["grade", "componentWeight"],
                    },
                    {
                      title: "Điểm",
                      dataIndex: ["grade", "score"],
                    },
                    {
                      title: "Xếp loại",
                      dataIndex: ["grade", "letterGrade"],
                    },
                    {
                      title: "Trạng thái",
                      render: (_, r) =>
                        r.verified ? (
                          <Tag color="green">Đã xác minh</Tag>
                        ) : (
                          <Tag color="red">Thất bại</Tag>
                        ),
                    },
                    {
                      title: "Thông báo",
                      dataIndex: "message",
                      ellipsis: true,
                      render: (message: string | null | undefined) =>
                        translateMessage(message),
                    },
                  ]}
                />
              </div>
            </>
          )}
        </Spin>
      </Card>

      <Modal
        title="Xác nhận phê duyệt đơn yêu cầu"
        open={approveModalVisible}
        onOk={handleApproveOnChain}
        onCancel={() => setApproveModalVisible(false)}
        okText="Duyệt"
        cancelText="Hủy"
        confirmLoading={processing}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="templateId"
            label="Template ID"
            rules={[{ required: true, message: "Vui lòng nhập templateId" }]}
          >
            <Select
              placeholder="Chọn template để phát hành chứng chỉ"
              showSearch
              optionFilterProp="children"
            >
              {templates.map((tpl) => (
                <Option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="adminNotes"
            label="Ghi chú"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú xử lý" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận từ chối đơn yêu cầu"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        confirmLoading={processing}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="adminNotes"
            label="Ghi chú của admin"
            rules={[{ required: true, message: "Vui lòng nhập ghi chú" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập ghi chú từ chối" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CredentialRequestDetailAdmin;
