import React, { useEffect, useState, useMemo } from "react";
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
  CompressOutlined,
  ExpandAltOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import type { CredentialListItem } from "../../../services/admin/credentials/api";
import {
  fetchCredentialsApi,
  createCredentialApi,
  type CreateCredentialRequest,
} from "../../../services/admin/credentials/api";
import { fetchUsersApi, type UserDto } from "../../../services/admin/users/api";
import {
  fetchSemestersApi,
  type SemesterDto,
} from "../../../services/admin/semesters/api";
import {
  fetchSubjectsApi,
  type SubjectDto,
} from "../../../services/admin/subjects/api";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { Text, Link } = Typography;

const CredentialsManagement: React.FC = () => {
  const [credentials, setCredentials] = useState<CredentialListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewingCredential, setViewingCredential] =
    useState<CredentialListItem | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [certificateTypeFilter, setCertificateTypeFilter] =
    useState<string>("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [creating, setCreating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Options for form
  const [students, setStudents] = useState<UserDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Load credentials
  const loadCredentials = async (page: number = 1, pageSize: number = 10) => {
    setLoading(true);
    try {
      const response = await fetchCredentialsApi({
        page,
        pageSize,
        searchTerm: searchText || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        certificateType:
          certificateTypeFilter !== "all" ? certificateTypeFilter : undefined,
      });
      setCredentials(response.items);
      setPagination({
        current: response.page,
        pageSize: response.pageSize,
        total: response.totalCount,
      });
    } catch (error) {
      console.error("Error loading credentials:", error);
      toast.error("Không thể tải danh sách chứng chỉ");
    } finally {
      setLoading(false);
    }
  };

  // Load form options
  const loadFormOptions = async () => {
    setLoadingOptions(true);
    try {
      const [studentsRes, semestersRes, subjectsRes] = await Promise.all([
        fetchUsersApi({ roleName: "Student", pageSize: 1000 }),
        fetchSemestersApi({ pageSize: 1000 }),
        fetchSubjectsApi({ pageSize: 1000 }),
      ]);
      setStudents(studentsRes.data || []);
      setSemesters(semestersRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error("Error loading form options:", error);
      toast.error("Không thể tải dữ liệu form");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    loadCredentials(pagination.current, pagination.pageSize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCredentials(1, pagination.pageSize);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText, statusFilter, certificateTypeFilter]);

  const showModal = () => {
    form.resetFields();
    setIsModalVisible(true);
    loadFormOptions();
  };

  const showViewModal = (credential: CredentialListItem) => {
    setViewingCredential(credential);
    setIsViewModalVisible(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);

      const payload: CreateCredentialRequest = {
        studentId: values.studentId,
        templateId: values.templateId,
        certificateType: values.certificateType,
        subjectId: values.subjectId,
        semesterId: values.semesterId,
        roadmapId: values.roadmapId,
        completionDate: values.completionDate
          ? dayjs(values.completionDate).toISOString()
          : new Date().toISOString(),
        finalGrade: values.finalGrade,
        letterGrade: values.letterGrade,
        classification: values.classification,
      };

      await createCredentialApi(payload);
      toast.success("Tạo chứng chỉ thành công");
      setIsModalVisible(false);
      form.resetFields();
      await loadCredentials(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error("Error creating credential:", error);
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể tạo chứng chỉ");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    loadCredentials(newPagination.current, newPagination.pageSize);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "success";
      case "pending":
        return "warning";
      case "revoked":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case "issued":
        return "Đã cấp";
      case "pending":
        return "Chờ xử lý";
      case "revoked":
        return "Đã thu hồi";
      default:
        return status || "N/A";
    }
  };

  const getCertificateTypeText = (type: string) => {
    switch (type) {
      case "SubjectCompletion":
        return "Hoàn thành môn học";
      case "SemesterCompletion":
        return "Hoàn thành học kỳ";
      case "RoadmapCompletion":
        return "Hoàn thành lộ trình";
      default:
        return type || "N/A";
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = pagination.total;
    const issued = credentials.filter(
      (c) => c.status?.toLowerCase() === "issued"
    ).length;
    const pending = credentials.filter(
      (c) => c.status?.toLowerCase() === "pending"
    ).length;
    const revoked = credentials.filter(
      (c) => c.status?.toLowerCase() === "revoked"
    ).length;
    const thisMonth = credentials.filter((c) => {
      const issuedDate = new Date(c.issuedDate);
      const now = new Date();
      return (
        issuedDate.getMonth() === now.getMonth() &&
        issuedDate.getFullYear() === now.getFullYear()
      );
    }).length;

    return { total, issued, pending, revoked, thisMonth };
  }, [credentials, pagination.total]);

  const statsCards = [
    {
      label: "Tổng chứng chỉ",
      value: stats.total,
      accent: "total",
      icon: <TrophyOutlined />,
    },
    {
      label: "Đã cấp",
      value: stats.issued,
      accent: "issued",
      icon: <CheckCircleOutlined />,
    },
    {
      label: "Chờ xử lý",
      value: stats.pending,
      accent: "pending",
      icon: <FileTextOutlined />,
    },
    {
      label: "Tháng này",
      value: stats.thisMonth,
      accent: "month",
      icon: <CalendarOutlined />,
    },
  ];

  const filteredCredentials = useMemo(() => {
    return credentials.filter((cred) => {
      const matchesSearch =
        searchText.trim() === "" ||
        cred.credentialId?.toLowerCase().includes(searchText.toLowerCase()) ||
        cred.studentName?.toLowerCase().includes(searchText.toLowerCase()) ||
        cred.studentCode?.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || cred.status === statusFilter;
      const matchesType =
        certificateTypeFilter === "all" ||
        cred.certificateType === certificateTypeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [credentials, searchText, statusFilter, certificateTypeFilter]);

  const columns: ColumnsType<CredentialListItem> = [
    {
      title: "Mã chứng chỉ",
      dataIndex: "credentialId",
      key: "credentialId",
      width: 180,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Loại",
      dataIndex: "certificateType",
      key: "certificateType",
      width: 150,
      render: (type) => <Tag color="blue">{getCertificateTypeText(type)}</Tag>,
    },
    {
      title: "Sinh viên",
      key: "student",
      width: 200,
      render: (_, record) => (
        <div className="student-info">
          <UserOutlined className="student-icon" />
          <div>
            <div className="student-name">{record.studentName || "N/A"}</div>
            <div className="student-code">{record.studentCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Học kỳ",
      dataIndex: "semesterName",
      key: "semesterName",
      width: 120,
      render: (text) => text || "-",
    },
    {
      title: "Điểm",
      key: "grade",
      width: 100,
      render: (_, record) => (
        <div>
          {record.finalGrade !== null && record.finalGrade !== undefined ? (
            <>
              <Text strong>{record.finalGrade}</Text>
              {record.letterGrade && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {record.letterGrade}
                </Tag>
              )}
            </>
          ) : (
            "-"
          )}
        </div>
      ),
    },
    {
      title: "Ngày cấp",
      dataIndex: "issuedDate",
      key: "issuedDate",
      width: 120,
      render: (date) => (
        <div className="issue-date">
          <CalendarOutlined className="date-icon" />
          {date ? dayjs(date).format("DD/MM/YYYY") : "-"}
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
      render: (_, record) => (
        <div className="blockchain-info">
          {record.isOnBlockchain ? (
            <Tooltip title="Đã lưu trên blockchain">
              <CheckCircleOutlined
                style={{ color: "#52c41a", fontSize: 18 }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Chưa lưu trên blockchain">
              <CloseCircleOutlined
                style={{ color: "#ff4d4f", fontSize: 18 }}
              />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showViewModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="credentials-management">
      <Card className="credentials-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <TrophyOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý chứng chỉ</h2>
              <span className="subtitle">
                Cấp phát và quản lý chứng chỉ trên blockchain
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Button
              className="toggle-details-btn"
              icon={showDetails ? <CompressOutlined /> : <ExpandAltOutlined />}
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Thu gọn" : "Chi tiết"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={showModal}
            >
              Tạo chứng chỉ
            </Button>
          </div>
        </div>

        <div className="stats-compact">
          {statsCards.map((stat) => (
            <div key={stat.label} className={`stat-chip ${stat.accent}`}>
              <span className="value">{stat.value}</span>
              <span className="label">{stat.label}</span>
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="stats-inline">
            {statsCards.map((stat) => (
              <div key={stat.label} className={`stat-item ${stat.accent}`}>
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className={`filters-row ${
            showDetails ? "expanded" : "compact-layout"
          }`}
        >
          <Row gutter={showDetails ? 16 : 12} align="middle">
            {showDetails && (
              <Col xs={24} md={12} className="filter-field search-field">
                <label>Tìm kiếm chứng chỉ</label>
                <Search
                  placeholder="Nhập mã chứng chỉ, tên sinh viên..."
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={(value) => setSearchText(value)}
                  prefix={<SearchOutlined />}
                  size="large"
                />
              </Col>
            )}
            <Col
              xs={showDetails ? 12 : 12}
              md={showDetails ? 6 : 12}
              className="filter-field status-field"
            >
              {showDetails && <label>Trạng thái</label>}
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                suffixIcon={<FilterOutlined />}
                size={showDetails ? "large" : "middle"}
                className="status-select"
              >
                <Option value="all">Tất cả</Option>
                <Option value="Issued">Đã cấp</Option>
                <Option value="Pending">Chờ xử lý</Option>
                <Option value="Revoked">Đã thu hồi</Option>
              </Select>
            </Col>
            <Col
              xs={showDetails ? 12 : 12}
              md={showDetails ? 6 : 12}
              className="filter-field type-field"
            >
              {showDetails && <label>Loại chứng chỉ</label>}
              <Select
                value={certificateTypeFilter}
                onChange={setCertificateTypeFilter}
                suffixIcon={<FilterOutlined />}
                size={showDetails ? "large" : "middle"}
                className="type-select"
              >
                <Option value="all">Tất cả</Option>
                <Option value="SubjectCompletion">Hoàn thành môn học</Option>
                <Option value="SemesterCompletion">Hoàn thành học kỳ</Option>
                <Option value="RoadmapCompletion">Hoàn thành lộ trình</Option>
              </Select>
            </Col>

            {showDetails && (
              <Col xs={24} className="filter-summary">
                <span>
                  Đã cấp: <strong>{stats.issued}</strong>
                </span>
                <span>
                  Chờ xử lý: <strong>{stats.pending}</strong>
                </span>
                <span>
                  Đã thu hồi: <strong>{stats.revoked}</strong>
                </span>
              </Col>
            )}

            {!showDetails && (
              <>
                <Col xs={12} className="filter-meta">
                  Đã cấp: <strong>{stats.issued}</strong>
                </Col>
                <Col xs={12} className="filter-meta text-right">
                  Chờ xử lý: <strong>{stats.pending}</strong>
                </Col>
              </>
            )}
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredCredentials}
            loading={loading}
            rowKey="id"
            className="credentials-table"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} chứng chỉ`,
              size: "small",
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="small"
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo chứng chỉ mới"
        open={isModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
        okText="Tạo chứng chỉ"
        cancelText="Hủy"
        confirmLoading={creating}
      >
        <Alert
          message="Lưu ý: Chứng chỉ sẽ được ghi lên blockchain và không thể xóa"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Spin spinning={loadingOptions}>
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              certificateType: "SubjectCompletion",
            }}
          >
            <Form.Item
              name="studentId"
              label="Sinh viên"
              rules={[{ required: true, message: "Vui lòng chọn sinh viên!" }]}
            >
              <Select
                placeholder="Chọn sinh viên"
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {students.map((student) => (
                  <Option
                    key={student.id}
                    value={student.id}
                  >{`${student.studentCode || ""} - ${student.fullName}`}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="certificateType"
              label="Loại chứng chỉ"
              rules={[
                { required: true, message: "Vui lòng chọn loại chứng chỉ!" },
              ]}
            >
              <Select placeholder="Chọn loại chứng chỉ">
                <Option value="SubjectCompletion">Hoàn thành môn học</Option>
                <Option value="SemesterCompletion">Hoàn thành học kỳ</Option>
                <Option value="RoadmapCompletion">Hoàn thành lộ trình</Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="subjectId" label="Môn học (tùy chọn)">
                  <Select
                    placeholder="Chọn môn học"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {subjects.map((subject) => (
                      <Option key={subject.id} value={subject.id}>
                        {subject.subjectCode} - {subject.subjectName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="semesterId" label="Học kỳ (tùy chọn)">
                  <Select
                    placeholder="Chọn học kỳ"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children as string)
                        ?.toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {semesters.map((semester) => (
                      <Option key={semester.id} value={semester.id}>
                        {semester.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="completionDate"
              label="Ngày hoàn thành"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hoàn thành!" },
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày hoàn thành"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="finalGrade" label="Điểm số (tùy chọn)">
                  <InputNumber
                    min={0}
                    max={10}
                    step={0.1}
                    placeholder="Điểm số"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="letterGrade" label="Điểm chữ (tùy chọn)">
                  <Input placeholder="Ví dụ: A, B+, C..." />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="classification" label="Xếp loại (tùy chọn)">
              <Input placeholder="Ví dụ: Xuất sắc, Giỏi, Khá..." />
            </Form.Item>
          </Form>
        </Spin>
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
        width={800}
      >
        {viewingCredential && (
          <div className="credential-detail">
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Descriptions title="Thông tin chứng chỉ" column={2} bordered>
                  <Descriptions.Item label="Mã chứng chỉ" span={2}>
                    <Text strong>{viewingCredential.credentialId}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại" span={2}>
                    <Tag color="blue">
                      {getCertificateTypeText(
                        viewingCredential.certificateType
                      )}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Sinh viên">
                    {viewingCredential.studentName || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã SV">
                    {viewingCredential.studentCode}
                  </Descriptions.Item>
                  {viewingCredential.subjectName && (
                    <Descriptions.Item label="Môn học">
                      {viewingCredential.subjectName}
                    </Descriptions.Item>
                  )}
                  {viewingCredential.semesterName && (
                    <Descriptions.Item label="Học kỳ">
                      {viewingCredential.semesterName}
                    </Descriptions.Item>
                  )}
                  {viewingCredential.finalGrade !== null &&
                    viewingCredential.finalGrade !== undefined && (
                      <Descriptions.Item label="Điểm số">
                        {viewingCredential.finalGrade}
                      </Descriptions.Item>
                    )}
                  {viewingCredential.letterGrade && (
                    <Descriptions.Item label="Điểm chữ">
                      {viewingCredential.letterGrade}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Ngày cấp">
                    {dayjs(viewingCredential.issuedDate).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                  </Descriptions.Item>
                  {viewingCredential.completionDate && (
                    <Descriptions.Item label="Ngày hoàn thành">
                      {dayjs(viewingCredential.completionDate).format(
                        "DD/MM/YYYY"
                      )}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Trạng thái" span={2}>
                    <Badge
                      status={getStatusColor(viewingCredential.status)}
                      text={getStatusText(viewingCredential.status)}
                    />
                  </Descriptions.Item>
                  {viewingCredential.verificationHash && (
                    <Descriptions.Item label="Mã xác thực" span={2}>
                      <Text copyable={{ text: viewingCredential.verificationHash }}>
                        {viewingCredential.verificationHash}
                      </Text>
                    </Descriptions.Item>
                  )}
                  {viewingCredential.shareableUrl && (
                    <Descriptions.Item label="URL chia sẻ" span={2}>
                      <Link href={viewingCredential.shareableUrl} target="_blank">
                        {viewingCredential.shareableUrl}
                      </Link>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Blockchain" span={2}>
                    {viewingCredential.isOnBlockchain ? (
                      <Tag color="green">
                        Đã lưu trên blockchain
                        {viewingCredential.blockchainTransactionHash && (
                          <Text code style={{ marginLeft: 8 }}>
                            {viewingCredential.blockchainTransactionHash.substring(
                              0,
                              20
                            )}
                            ...
                          </Text>
                        )}
                      </Tag>
                    ) : (
                      <Tag color="default">Chưa lưu trên blockchain</Tag>
                    )}
                  </Descriptions.Item>
                  {viewingCredential.viewCount !== undefined && (
                    <Descriptions.Item label="Lượt xem">
                      {viewingCredential.viewCount}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Col>
              <Col span={8}>
                <div className="qr-code-section">
                  <h4>QR Code xác thực</h4>
                  {viewingCredential.shareableUrl ? (
                    <QRCode value={viewingCredential.shareableUrl} size={200} />
                  ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                      <Text type="secondary">Không có URL chia sẻ</Text>
                    </div>
                  )}
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: 8,
                      fontSize: "12px",
                    }}
                  >
                    Quét để xác thực chứng chỉ
                  </p>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CredentialsManagement;
