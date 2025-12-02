import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  message,
  Tag,
  Row,
  Col,
  Badge,
  Tooltip,
  QRCode,
  InputNumber,
  Descriptions,
  Typography,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  TrophyOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  EyeOutlined,
  QrcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  SafetyOutlined,
  BlockOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type {
  CredentialDto,
  CredentialDetailDto,
  CredentialFormData,
  CredentialStats,
} from "../../../types/Credential";
import {
  fetchCredentialsApi,
  getCredentialByIdApi,
  createCredentialApi,
  revokeCredentialApi,
  getCredentialQRCodeApi,
  downloadCredentialPdfApi,
  approveCredentialApi,
  rejectCredentialApi,
} from "../../../services/admin/credentials/api";
import type { SemesterDto } from "../../../services/admin/semesters/api";
import type { SubjectDto } from "../../../services/admin/subjects/api";
import dayjs from "dayjs";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const CredentialsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<CredentialDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isRevokeModalVisible, setIsRevokeModalVisible] = useState(false);
  const [viewingCredential, setViewingCredential] = useState<CredentialDetailDto | null>(null);
  const [revokingCredential, setRevokingCredential] = useState<CredentialDto | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [form] = Form.useForm();
  const [revokeForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Statistics
  const stats: CredentialStats = {
    total: credentials.length,
    active: credentials.filter((c) => c.status === "Active" || c.status === "Issued").length,
    revoked: credentials.filter((c) => c.status === "Revoked").length,
    pending: credentials.filter((c) => c.status === "Pending").length,
    thisMonth: credentials.filter(
      (c) => c.issueDate && dayjs(c.issueDate).isValid() && dayjs(c.issueDate).isSame(dayjs(), "month")
    ).length,
    byType: {
      completion: credentials.filter((c) => c.certificateType === "Completion").length,
      subject: credentials.filter((c) => c.certificateType === "Subject").length,
      semester: credentials.filter((c) => c.certificateType === "Semester").length,
      roadmap: credentials.filter((c) => c.certificateType === "Roadmap").length,
    },
  };

  // Fetch credentials from API
  const fetchCredentials = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await fetchCredentialsApi({
        page,
        pageSize,
        searchTerm: searchText || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        certificateType: typeFilter !== "all" ? typeFilter : undefined,
      });

      const items = response.items || [];
      const normalizedItems = items.map((item: any) => ({
        ...item,
        issueDate: item.issueDate || item.issuedDate || item.completionDate || "",
      }));
      setCredentials(normalizedItems as CredentialDto[]);
      setPagination({
        current: response.page || page,
        pageSize: response.pageSize || pageSize,
        total: response.totalCount || 0,
      });
    } catch (error: any) {
      message.error(error?.response?.data?.detail || "Không thể tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials(pagination.current, pagination.pageSize);
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
  };

  const handleApplyFilters = () => {
    fetchCredentials(1, pagination.pageSize);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText !== undefined) {
        handleApplyFilters();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, typeFilter]);

  const showModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const showViewModal = async (credential: CredentialDto) => {
    setLoading(true);
    try {
      const detail = await getCredentialByIdApi(credential.id);
      const normalizedDetail = {
        ...detail,
        issueDate: detail.issueDate || (detail as any).issuedDate || detail.completionDate || "",
      } as CredentialDetailDto;
      setViewingCredential(normalizedDetail);
      
      // Fetch QR code
      const qrResponse = await getCredentialQRCodeApi(credential.id);
      setQrCodeData(qrResponse.qrCodeData);
      
      setIsViewModalVisible(true);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || "Không thể tải thông tin chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const showRevokeModal = (credential: CredentialDto) => {
    setRevokingCredential(credential);
    revokeForm.resetFields();
    setIsRevokeModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload: CredentialFormData = {
        studentId: values.studentId,
        certificateType: values.certificateType,
        subjectId: values.subjectId,
        semesterId: values.semesterId,
        roadmapId: values.roadmapId,
        completionDate: values.completionDate ? dayjs(values.completionDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        finalGrade: values.finalGrade,
        letterGrade: values.letterGrade,
        classification: values.classification,
      };

      await createCredentialApi(payload);
      message.success("Cấp chứng chỉ thành công! Đã ghi lên blockchain.");
      setIsModalVisible(false);
      form.resetFields();
      fetchCredentials(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error?.response?.data?.detail || "Không thể tạo chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    try {
      const values = await revokeForm.validateFields();
      if (revokingCredential) {
        setLoading(true);
        await revokeCredentialApi(revokingCredential.id, {
          reason: values.reason,
        });
        message.success("Thu hồi chứng chỉ thành công! Đã cập nhật trên blockchain.");
        setIsRevokeModalVisible(false);
        fetchCredentials(pagination.current, pagination.pageSize);
      }
    } catch (error: any) {
      message.error(error?.response?.data?.detail || "Không thể thu hồi chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (credentialId: string) => {
    try {
      setLoading(true);
      const blob = await downloadCredentialPdfApi(credentialId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `credential_${credentialId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("Đã tải xuống chứng chỉ");
    } catch (error: any) {
      message.error(error?.response?.data?.detail || "Không thể tải xuống chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "issued":
        return "success";
      case "revoked":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "issued":
        return "Có hiệu lực";
      case "revoked":
        return "Đã thu hồi";
      case "pending":
        return "Đang chờ";
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "completion":
        return <TrophyOutlined />;
      case "subject":
        return <SafetyOutlined />;
      case "semester":
        return <FileTextOutlined />;
      case "roadmap":
        return <CheckCircleOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "completion":
        return "gold";
      case "subject":
        return "blue";
      case "semester":
        return "green";
      case "roadmap":
        return "purple";
      default:
        return "default";
    }
  };

  const getTypeText = (type: string) => {
    switch (type.toLowerCase()) {
      case "completion":
        return "Hoàn thành";
      case "subject":
        return "Môn học";
      case "semester":
        return "Học kỳ";
      case "roadmap":
        return "Lộ trình";
      default:
        return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Đã sao chép vào clipboard!");
  };

  const formatDateDisplay = (date?: string | null, fallback: string = "Chưa cập nhật") => {
    if (!date) return fallback;
    const parsed = dayjs(date);
    return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallback;
  };

  const handleNavigateDetail = (credential: CredentialDto) => {
    navigate(`/admin/credentials/${credential.id}`);
  };

  const handleNavigateRequests = () => {
    navigate("/admin/credential-requests");
  };

  const columns: ColumnsType<CredentialDto> = [
    {
      title: "Chứng chỉ",
      key: "credential",
      width: 300,
      render: (_, record) => (
        <div 
          className="credential-info clickable"
          onClick={() => handleNavigateDetail(record)}
          style={{ cursor: "pointer" }}
        >
          <div className="credential-header">
            {getTypeIcon(record.certificateType)}
            <div className="credential-details">
              <div className="credential-title">
                {record.subjectName || record.semesterName || record.roadmapName || "Chứng chỉ hoàn thành"}
              </div>
              <div className="credential-description">
                {record.letterGrade && `Điểm: ${record.letterGrade}`}
                {record.finalGrade && ` (${record.finalGrade})`}
              </div>
              <Tag color={getTypeColor(record.certificateType)}>
                {getTypeText(record.certificateType)}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sinh viên",
      key: "student",
      width: 180,
      render: (_, record) => (
        <div className="student-info">
          <UserOutlined className="student-icon" />
          <div>
            <div className="student-name">{record.studentName}</div>
            <div className="student-code">{record.studentCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày cấp",
      dataIndex: "issueDate",
      key: "issueDate",
      width: 140,
      render: (_, record) => (
        <div className="issue-date">
          <CalendarOutlined className="date-icon" />
          {formatDateDisplay(record.issueDate, "Chưa cấp")}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      ),
    },
    {
      title: "Blockchain",
      key: "blockchain",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <div className="blockchain-info">
          <Tooltip title={`Hash: ${record.credentialHash}`}>
            <Button
              type="text"
              icon={<BlockOutlined />}
              size="small"
              onClick={() => copyToClipboard(record.credentialHash || "")}
            />
          </Tooltip>
          <Tooltip title="Xem QR Code">
            <Button
              type="text"
              icon={<QrcodeOutlined />}
              size="small"
              onClick={() => showViewModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Tải PDF">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleDownloadPdf(record.id)}
            />
          </Tooltip>
          {(record.status === "Active" || record.status === "Issued") && (
            <Tooltip title="Thu hồi">
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => showRevokeModal(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const perPage = pagination.pageSize || 10;
  const totalPages = Math.max(1, Math.ceil(pagination.total / perPage));
  const statusSummary = statusFilter === "all" ? "Tất cả" : getStatusText(statusFilter);
  const typeSummary = typeFilter === "all" ? "Tất cả" : getTypeText(typeFilter);

  return (
    <div className="credentials-management">
      <div className="page-header">
        <h1>Quản lý Chứng chỉ & Bằng cấp</h1>
        <p>Cấp phát và quản lý chứng chỉ trên blockchain</p>
      </div>

      <Card className="credentials-panel">
        <div className="overview-header">
          <div className="title-block">
            <span className="title-icon">
              <SafetyOutlined />
            </span>
            <div>
              <div className="eyebrow">Blockchain Credential Vault</div>
              <h2>Giám sát chứng chỉ</h2>
              <p className="subtitle">Cấp, xác thực và thu hồi chứng chỉ được ghi trên blockchain.</p>
            </div>
          </div>
          <div className="header-actions">
            <Button
              className="toggle-details-btn"
              onClick={handleNavigateRequests}
            >
              Danh sách đơn
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              size="middle"
              onClick={showModal}
            >
              Cấp chứng chỉ
            </Button>
          </div>
        </div>

        <div className="stats-compact">
          <div className="stat-chip total">
            <span className="value">{stats.total}</span>
            <span>Tổng chứng chỉ</span>
          </div>
          <div className="stat-chip issued">
            <span className="value">{stats.active}</span>
            <span>Có hiệu lực</span>
          </div>
          <div className="stat-chip pending">
            <span className="value">{stats.pending}</span>
            <span>Đang chờ</span>
          </div>
          <div className="stat-chip month">
            <span className="value">{stats.thisMonth}</span>
            <span>Trong tháng</span>
          </div>
        </div>

        <div className="stats-inline">
          <div className="stat-item completion">
            <div className="stat-icon-wrapper">
              <TrophyOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.byType.completion}</span>
              <span className="stat-label">Hoàn thành</span>
            </div>
          </div>
          <div className="stat-item subject">
            <div className="stat-icon-wrapper">
              <SafetyOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.byType.subject}</span>
              <span className="stat-label">Môn học</span>
            </div>
          </div>
          <div className="stat-item semester">
            <div className="stat-icon-wrapper">
              <FileTextOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.byType.semester}</span>
              <span className="stat-label">Học kỳ</span>
            </div>
          </div>
          <div className="stat-item roadmap">
            <div className="stat-icon-wrapper">
              <CheckCircleOutlined />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.byType.roadmap}</span>
              <span className="stat-label">Lộ trình</span>
            </div>
          </div>
        </div>

        <div className="filters-row">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Tên, mã sinh viên, chứng chỉ..."
                  allowClear
                  onSearch={handleSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  prefix={<SearchOutlined />}
                  style={{ width: "100%" }}
                />
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div className="filter-field status-select">
                <label>Trạng thái</label>
                <Select<string>
                  placeholder="Trạng thái"
                  style={{ width: "100%" }}
                  value={statusFilter}
                  onChange={handleStatusFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Active">Có hiệu lực</Option>
                  <Option value="Issued">Có hiệu lực</Option>
                  <Option value="Revoked">Đã thu hồi</Option>
                  <Option value="Pending">Đang chờ</Option>
                </Select>
              </div>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <div className="filter-field type-select">
                <label>Loại chứng chỉ</label>
                <Select<string>
                  placeholder="Loại"
                  style={{ width: "100%" }}
                  value={typeFilter}
                  onChange={handleTypeFilter}
                  suffixIcon={<FilterOutlined />}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="Completion">Hoàn thành</Option>
                  <Option value="Subject">Môn học</Option>
                  <Option value="Semester">Học kỳ</Option>
                  <Option value="Roadmap">Lộ trình</Option>
                </Select>
              </div>
            </Col>
          </Row>
          <div className="filter-summary">
            <span>
              Trạng thái: <strong>{statusSummary}</strong>
            </span>
            <span>
              Loại: <strong>{typeSummary}</strong>
            </span>
          </div>
          <div className="filter-meta text-right">
            {`Trang ${pagination.current} / ${totalPages} • ${pagination.total.toLocaleString()} chứng chỉ`}
          </div>
        </div>

        <div className="table-section">
          <div className="credentials-table">
            <Spin spinning={loading} tip="Đang tải dữ liệu...">
              <Table
                columns={columns}
                dataSource={credentials}
                rowKey="id"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  pageSizeOptions: ["5", "10", "20", "50"],
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} chứng chỉ`,
                  onChange: (page, pageSize) => {
                    fetchCredentials(page, pageSize);
                  },
                }}
                scroll={{ x: 1200 }}
                locale={{
                  emptyText: (
                    <div style={{ padding: "40px 0" }}>
                      <TrophyOutlined
                        style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                      />
                      <div style={{ color: "#999" }}>Chưa có chứng chỉ nào</div>
                      <div style={{ color: "#bfbfbf", fontSize: 12, marginTop: 8 }}>
                        Nhấn "Cấp chứng chỉ" để tạo chứng chỉ mới
                      </div>
                    </div>
                  ),
                }}
              />
            </Spin>
          </div>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title="Cấp chứng chỉ mới"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText="Cấp chứng chỉ"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Alert
          message="Lưu ý: Chứng chỉ sẽ được ghi lên blockchain và không thể xóa"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={form}
          layout="vertical"
          initialValues={{ certificateType: "Subject" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="certificateType"
                label="Loại chứng chỉ"
                rules={[
                  { required: true, message: "Vui lòng chọn loại chứng chỉ!" },
                ]}
              >
                <Select<string> placeholder="Chọn loại chứng chỉ">
                  <Option value="Completion">Hoàn thành</Option>
                  <Option value="Subject">Môn học</Option>
                  <Option value="Semester">Học kỳ</Option>
                  <Option value="Roadmap">Lộ trình</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="ID Sinh viên"
                rules={[
                  { required: true, message: "Vui lòng nhập ID sinh viên!" },
                ]}
              >
                <Input placeholder="Nhập ID sinh viên (GUID)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="subjectId" label="ID Môn học">
                <Input placeholder="ID môn học (tuỳ chọn)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="semesterId" label="ID Học kỳ">
                <Input placeholder="ID học kỳ (tuỳ chọn)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="roadmapId" label="ID Lộ trình">
                <Input placeholder="ID lộ trình (tuỳ chọn)" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="completionDate"
            label="Ngày hoàn thành"
            rules={[{ required: true, message: "Vui lòng chọn ngày hoàn thành!" }]}
          >
            <DatePicker
              placeholder="Chọn ngày hoàn thành"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="finalGrade" label="Điểm số">
                <InputNumber
                  min={0}
                  max={10}
                  step={0.1}
                  placeholder="Điểm số"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="letterGrade" label="Điểm chữ">
                <Input placeholder="A, B+, C..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="classification" label="Xếp loại">
                <Input placeholder="Xuất sắc, Giỏi..." />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="Chi tiết chứng chỉ"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {viewingCredential && (
          <div className="credential-detail">
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Descriptions title="Thông tin chứng chỉ" column={2} bordered>
                  <Descriptions.Item label="Loại" span={2}>
                    <Tag
                      color={getTypeColor(viewingCredential.certificateType)}
                      icon={getTypeIcon(viewingCredential.certificateType)}
                    >
                      {getTypeText(viewingCredential.certificateType)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Sinh viên">
                    {viewingCredential.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã SV">
                    {viewingCredential.studentCode}
                  </Descriptions.Item>
                  {viewingCredential.subjectName && (
                    <Descriptions.Item label="Môn học" span={2}>
                      {viewingCredential.subjectName}
                    </Descriptions.Item>
                  )}
                  {viewingCredential.semesterName && (
                    <Descriptions.Item label="Học kỳ" span={2}>
                      {viewingCredential.semesterName}
                    </Descriptions.Item>
                  )}
                  {viewingCredential.roadmapName && (
                    <Descriptions.Item label="Lộ trình" span={2}>
                      {viewingCredential.roadmapName}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Ngày cấp">
                    {formatDateDisplay(viewingCredential.issueDate, "Chưa cấp")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hoàn thành">
                    {formatDateDisplay(viewingCredential.completionDate, "Chưa hoàn thành")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={2}>
                    <Badge
                      status={getStatusColor(viewingCredential.status)}
                      text={getStatusText(viewingCredential.status)}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Credential Hash" span={2}>
                    <Text copyable={{ text: viewingCredential.credentialHash }}>
                      {viewingCredential.credentialHash}
                    </Text>
                  </Descriptions.Item>
                  {viewingCredential.blockchainTxHash && (
                    <Descriptions.Item label="Blockchain TX" span={2}>
                      <Text copyable={{ text: viewingCredential.blockchainTxHash }}>
                        {viewingCredential.blockchainTxHash}
                      </Text>
                    </Descriptions.Item>
                  )}
                  {viewingCredential.ipfsHash && (
                    <Descriptions.Item label="IPFS Hash" span={2}>
                      <Text copyable={{ text: viewingCredential.ipfsHash }}>
                        {viewingCredential.ipfsHash}
                      </Text>
                    </Descriptions.Item>
                  )}
                  {viewingCredential.status === "Revoked" && (
                    <>
                      <Descriptions.Item label="Lý do thu hồi" span={2}>
                        {viewingCredential.revocationReason}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày thu hồi">
                        {formatDateDisplay(viewingCredential.revokedAt, "Chưa xác định")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Người thu hồi">
                        {viewingCredential.revokedBy}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>

                {(viewingCredential.finalGrade || viewingCredential.letterGrade || viewingCredential.classification) && (
                  <Descriptions
                    title="Thông tin học tập"
                    column={2}
                    bordered
                    style={{ marginTop: 16 }}
                  >
                    {viewingCredential.finalGrade && (
                      <Descriptions.Item label="Điểm số">
                        {viewingCredential.finalGrade}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.letterGrade && (
                      <Descriptions.Item label="Điểm chữ">
                        {viewingCredential.letterGrade}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.classification && (
                      <Descriptions.Item label="Xếp loại" span={2}>
                        {viewingCredential.classification}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                )}
              </Col>
              <Col span={8}>
                <div className="qr-code-section">
                  <h4>QR Code xác thực</h4>
                  {qrCodeData ? (
                    <img 
                      src={qrCodeData} 
                      alt="QR Code" 
                      style={{ width: 200, height: 200 }}
                    />
                  ) : (
                    <QRCode
                      value={`${window.location.origin}/verify/${viewingCredential.id}`}
                      size={200}
                    />
                  )}
                  <p style={{ textAlign: "center", marginTop: 8, fontSize: "12px" }}>
                    Quét để xác thực chứng chỉ
                  </p>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    block
                    style={{ marginTop: 8 }}
                    onClick={() => handleDownloadPdf(viewingCredential.id)}
                  >
                    Tải PDF
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Revoke Modal */}
      <Modal
        title="Thu hồi chứng chỉ"
        open={isRevokeModalVisible}
        onOk={handleRevoke}
        onCancel={() => setIsRevokeModalVisible(false)}
        okText="Thu hồi"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <Alert
          message="Cảnh báo"
          description="Việc thu hồi chứng chỉ sẽ được ghi lên blockchain và không thể hoàn tác!"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={revokeForm} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do thu hồi"
            rules={[
              { required: true, message: "Vui lòng nhập lý do thu hồi!" },
            ]}
          >
            <TextArea
              placeholder="Nhập lý do thu hồi chứng chỉ..."
              rows={4}
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CredentialsManagement;
