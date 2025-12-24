import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Row,
  Col,
  message,
  Modal,
  Form,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type {
  CredentialRequestDto,
  GetCredentialRequestsRequest,
} from "../../../services/admin/credentials/api";
import {
  fetchCredentialRequestsApi,
  approveCredentialRequestApi,
  rejectCredentialRequestApi,
} from "../../../services/admin/credentials/api";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "./index.scss";

// Cấu hình dayjs UTC plugin
dayjs.extend(utc);

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

const CredentialRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CredentialRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectForm] = Form.useForm();

  const fetchRequests = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: GetCredentialRequestsRequest = {
        page,
        pageSize,
        searchTerm: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        certificateType: typeFilter !== "all" ? typeFilter : undefined,
      };

      const response = await fetchCredentialRequestsApi(params);
      setRequests(response.items || []);
      setPagination({
        current: response.page || page,
        pageSize: response.pageSize || pageSize,
        total: response.totalCount || 0,
      });
    } catch (error: any) {
      message.error(
        error?.response?.data?.detail || "Không thể tải danh sách đơn yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  // Gộp 2 useEffect thành 1 để tránh gọi API nhiều lần
  useEffect(() => {
    // Debounce cho search term
    const timer = setTimeout(
      () => {
        fetchRequests(1, pagination.pageSize);
      },
      searchTerm ? 500 : 0
    ); // Chỉ debounce khi có search term

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, typeFilter]);

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

  const formatDate = (value?: string) => {
    if (!value) return "-";
    // Parse UTC time từ ISO string và convert sang GMT+7 (+7 giờ)
    const d = dayjs.utc(value).utcOffset(7);
    return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : value;
  };

  const handleApprove = async (request: CredentialRequestDto) => {
    try {
      setProcessingId(request.id);
      await approveCredentialRequestApi(request.id, {
        action: "Approve",
        notes: "Approved by admin from request list",
      });
      message.success("Đã phê duyệt và cấp chứng chỉ cho đơn này.");
      fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(
        error?.response?.data?.detail || "Không thể phê duyệt đơn yêu cầu"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (requestId: string) => {
    setRejectingId(requestId);
    rejectForm.resetFields();
    setRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (!rejectingId) return;
      setProcessingId(rejectingId);
      await rejectCredentialRequestApi(rejectingId, {
        action: "Reject",
        notes: values.notes,
        rejectionReason: values.rejectionReason,
      });
      message.success("Đã từ chối đơn yêu cầu.");
      setRejectModalVisible(false);
      setRejectingId(null);
      fetchRequests(pagination.current, pagination.pageSize);
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error(
          error?.response?.data?.detail || "Không thể từ chối đơn yêu cầu"
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const columns: ColumnsType<CredentialRequestDto> = [
    {
      title: "Sinh viên",
      dataIndex: "studentName",
      key: "student",
      width: 220,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <UserOutlined />
          <div>
            <div>{record.studentName}</div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {record.studentCode}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại chứng chỉ",
      dataIndex: "certificateType",
      key: "certificateType",
      width: 160,
      render: (type: string) => {
        const t = type?.toLowerCase();
        switch (t) {
          case "completion":
            return <Tag color="gold">Hoàn thành</Tag>;
          case "subject":
            return <Tag color="blue">Môn học</Tag>;
          case "semester":
            return <Tag color="green">Học kỳ</Tag>;
          case "roadmap":
            return <Tag color="purple">Lộ trình</Tag>;
          default:
            return <Tag>{type}</Tag>;
        }
      },
    },
    {
      title: "Đối tượng",
      key: "target",
      width: 220,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          {record.subjectName && <div>Môn: {record.subjectName}</div>}
          {record.semesterName && <div>Học kỳ: {record.semesterName}</div>}
          {record.roadmapName && <div>Lộ trình: {record.roadmapName}</div>}
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Ngày xử lý",
      dataIndex: "processedAt",
      key: "processedAt",
      width: 180,
      render: (value?: string) => formatDate(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => getStatusTag(status),
    },
  ];

  return (
    <div className="credential-requests-page">
      <div className="page-hero">
        <div className="title-block">
          <span className="title-icon">
            <SafetyOutlined />
          </span>
          <div>
            <div className="eyebrow">Blockchain Credential Vault</div>
            <h2>Giám sát chứng chỉ</h2>
            <p className="subtitle">
              Cấp, xác thực và thu hồi chứng chỉ được ghi trên blockchain.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <div className="filters-row compact-layout">
          <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
            <Col xs={24} md={10}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Tìm theo tên, mã SV, loại chứng chỉ..."
                  allowClear
                  value={searchTerm}
                  prefix={<SearchOutlined />}
                  onSearch={(value) => setSearchTerm(value)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="large"
                  enterButton="Tìm kiếm"
                  style={{ width: "100%" }}
                />
              </div>
            </Col>
            <Col xs={12} md={7}>
              <div className="filter-field">
                <label>Trạng thái</label>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: "100%" }}
                  size="middle"
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">Tất cả trạng thái</Option>
                  <Option value="Pending">Đang chờ</Option>
                  <Option value="Approved">Đã duyệt</Option>
                  <Option value="Rejected">Đã từ chối</Option>
                </Select>
              </div>
            </Col>
            <Col xs={12} md={7}>
              <div className="filter-field">
                <label>Loại chứng chỉ</label>
                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  style={{ width: "100%" }}
                  size="middle"
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">Tất cả loại chứng chỉ</Option>
                  <Option value="Completion">Hoàn thành</Option>
                  <Option value="Subject">Môn học</Option>
                  <Option value="Semester">Học kỳ</Option>
                  <Option value="Roadmap">Lộ trình</Option>
                </Select>
              </div>
            </Col>
          </Row>
        </div>

        <Table
          className="custom-table"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={requests}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/credential-requests/${record.id}`),
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn yêu cầu`,
            onChange: (page, pageSize) => fetchRequests(page, pageSize),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Lý do từ chối đơn yêu cầu"
        open={rejectModalVisible}
        onOk={handleConfirmReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="rejectionReason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do từ chối" />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú thêm (không bắt buộc)">
            <Input.TextArea rows={3} placeholder="Ghi chú nội bộ" />
          </Form.Item>
          {rejectingId && (
            <Text type="secondary">
              Đang xử lý đơn: <code>{rejectingId}</code>
            </Text>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default CredentialRequestsPage;
