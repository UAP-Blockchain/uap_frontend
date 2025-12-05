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
  message,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { CredentialRequestDto } from "../../../services/admin/credentials/api";
import {
  getCredentialRequestByIdApi,
  approveCredentialRequestApi,
  rejectCredentialRequestApi,
} from "../../../services/admin/credentials/api";
import {
  getCertificateTemplatesApi,
  type CertificateTemplateDto,
} from "../../../services/admin/certificateTemplates/api";
import "./RequestDetail.scss";

const { Text } = Typography;
const { Option } = Select;

const CredentialRequestDetailAdmin: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<CredentialRequestDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
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
    const d = dayjs(value);
    return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : value;
  };

  const getStatusTag = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "pending":
        return <Tag color="gold">Đang chờ</Tag>;
      case "approved":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>
        );
      case "rejected":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    try {
      const values = await form.validateFields();
      setProcessing(true);
      await approveCredentialRequestApi(request.id, {
        action: "Approve",
        templateId: values.templateId,
        adminNotes: values.adminNotes,
      } as any);
      message.success("Đã phê duyệt và cấp chứng chỉ cho đơn này.");
      setApproveModalVisible(false);
      form.resetFields();
      loadRequest();
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(
          error?.response?.data?.detail || "Không thể phê duyệt đơn yêu cầu"
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const openApproveModal = () => {
    form.resetFields();
    setApproveModalVisible(true);
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

  const disabledActions = !request || request.status !== "Pending" || processing;

  return (
    <div className="credential-request-detail-page">
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
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            disabled={disabledActions}
            loading={processing && request?.status === "Pending"}
            onClick={openApproveModal}
          >
            Duyệt
          </Button>
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
                {formatDate((request as any).requestDate || (request as any).createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xử lý">
                {formatDate(request.processedDate)}
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

      <Modal
        title="Xác nhận phê duyệt đơn yêu cầu"
        open={approveModalVisible}
        onOk={handleApprove}
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
