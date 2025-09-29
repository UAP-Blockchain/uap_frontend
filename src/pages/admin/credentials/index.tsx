import React, { useState } from "react";
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
  Popconfirm,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  QRCode,
  InputNumber,
  Descriptions,
  Typography,
  Alert,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  
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
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Credential, CredentialFormData, CredentialStats } from "../../../models/Credential";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text, Link } = Typography;

const CredentialsManagement: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([
    {
      id: "1",
      credentialType: "degree",
      title: "Bachelor of Software Engineering",
      description: "Bằng cử nhân Công nghệ phần mềm",
      studentId: "1",
      studentName: "Nguyễn Phi Hùng",
      studentCode: "SE170107",
      issuerId: "admin1",
      issuerName: "Admin System",
      issueDate: "2024-06-15",
      status: "active",
      blockchainHash: "0x1234567890abcdef...",
      transactionHash: "0xabcdef1234567890...",
      ipfsHash: "QmX1Y2Z3...",
      metadata: {
        gpa: 3.8,
        credits: 140,
        academicYear: "2020-2024",
        course: "Software Engineering",
      },
      verificationUrl: "https://verify.fap-blockchain.edu.vn/credential/1",
      qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      createdAt: "2024-06-15T10:00:00Z",
      updatedAt: "2024-06-15T10:00:00Z",
    },
    {
      id: "2",
      credentialType: "certificate",
      title: "Blockchain Development Certificate",
      description: "Chứng chỉ phát triển Blockchain",
      studentId: "2",
      studentName: "Nguyễn Trung Nam",
      studentCode: "SE170246",
      issuerId: "teacher1",
      issuerName: "Nguyễn Ngọc Lâm",
      issueDate: "2024-05-20",
      status: "active",
      blockchainHash: "0x9876543210fedcba...",
      transactionHash: "0xfedcba0987654321...",
      metadata: {
        grade: "A",
        course: "Advanced Blockchain Programming",
        classId: "1",
        className: "BC101",
        semester: "Spring 2024",
      },
      verificationUrl: "https://verify.fap-blockchain.edu.vn/credential/2",
      createdAt: "2024-05-20T14:30:00Z",
      updatedAt: "2024-05-20T14:30:00Z",
    },
    {
      id: "3",
      credentialType: "transcript",
      title: "Academic Transcript - Spring 2024",
      description: "Bảng điểm học kỳ xuân 2024",
      studentId: "3",
      studentName: "Huỳnh Gia Bảo",
      studentCode: "SE170118",
      issuerId: "admin1",
      issuerName: "Academic Office",
      issueDate: "2024-06-01",
      status: "active",
      blockchainHash: "0x5555aaaa9999bbbb...",
      transactionHash: "0xbbbb9999aaaa5555...",
      metadata: {
        gpa: 3.9,
        credits: 18,
        semester: "Spring 2024",
        academicYear: "2023-2024",
      },
      verificationUrl: "https://verify.fap-blockchain.edu.vn/credential/3",
      createdAt: "2024-06-01T09:15:00Z",
      updatedAt: "2024-06-01T09:15:00Z",
    },
    {
      id: "4",
      credentialType: "achievement",
      title: "Outstanding Student Award",
      description: "Giải thưởng sinh viên xuất sắc",
      studentId: "4",
      studentName: "Nghiêm Văn Hoàng",
      studentCode: "SE170117",
      issuerId: "admin1",
      issuerName: "Admin System",
      issueDate: "2024-03-15",
      status: "revoked",
      blockchainHash: "0x7777cccc3333dddd...",
      transactionHash: "0xdddd3333cccc7777...",
      metadata: {
        gpa: 3.7,
        academicYear: "2023-2024",
      },
      revokedAt: "2024-04-01T10:00:00Z",
      revokedBy: "admin1",
      revokedReason: "Duplicate entry found",
      createdAt: "2024-03-15T16:45:00Z",
      updatedAt: "2024-04-01T10:00:00Z",
    },
  ]);

  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>(credentials);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isRevokeModalVisible, setIsRevokeModalVisible] = useState(false);
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);
  const [viewingCredential, setViewingCredential] = useState<Credential | null>(null);
  const [revokingCredential, setRevokingCredential] = useState<Credential | null>(null);
  const [form] = Form.useForm();
  const [revokeForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Mock students data
  const students = [
    { id: "1", name: "Nguyễn Phi Hùng", code: "SE170107" },
    { id: "2", name: "Nguyễn Trung Nam", code: "SE170246" },
    { id: "3", name: "Huỳnh Gia Bảo", code: "SE170118" },
    { id: "4", name: "Nghiêm Văn Hoàng", code: "SE170117" },
  ];

  // Statistics
  const stats: CredentialStats = {
    total: credentials.length,
    active: credentials.filter(c => c.status === "active").length,
    revoked: credentials.filter(c => c.status === "revoked").length,
    expired: credentials.filter(c => c.status === "expired").length,
    thisMonth: credentials.filter(c => 
      new Date(c.issueDate).getMonth() === new Date().getMonth()
    ).length,
    byType: {
      degree: credentials.filter(c => c.credentialType === "degree").length,
      certificate: credentials.filter(c => c.credentialType === "certificate").length,
      transcript: credentials.filter(c => c.credentialType === "transcript").length,
      achievement: credentials.filter(c => c.credentialType === "achievement").length,
    },
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterCredentials(value, statusFilter, typeFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterCredentials(searchText, value, typeFilter);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    filterCredentials(searchText, statusFilter, value);
  };

  const filterCredentials = (search: string, status: string, type: string) => {
    let filtered = credentials;

    if (search) {
      filtered = filtered.filter(credential =>
        credential.title.toLowerCase().includes(search.toLowerCase()) ||
        credential.studentName.toLowerCase().includes(search.toLowerCase()) ||
        credential.studentCode.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter(credential => credential.status === status);
    }

    if (type !== "all") {
      filtered = filtered.filter(credential => credential.credentialType === type);
    }

    setFilteredCredentials(filtered);
  };

  const showModal = (credential?: Credential) => {
    if (credential) {
      setEditingCredential(credential);
      form.setFieldsValue({
        ...credential,
        expiryDate: credential.expiryDate ? new Date(credential.expiryDate) : undefined,
      });
    } else {
      setEditingCredential(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showViewModal = (credential: Credential) => {
    setViewingCredential(credential);
    setIsViewModalVisible(true);
  };

  const showRevokeModal = (credential: Credential) => {
    setRevokingCredential(credential);
    revokeForm.resetFields();
    setIsRevokeModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: CredentialFormData) => {
      const student = students.find(s => s.id === values.studentId);
      const credentialData: Credential = {
        id: editingCredential?.id || Date.now().toString(),
        ...values,
        studentName: student?.name || "",
        studentCode: student?.code || "",
        issuerId: "admin1",
        issuerName: "Current Admin",
        issueDate: editingCredential?.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: values.expiryDate?.toISOString().split('T')[0],
        status: editingCredential?.status || "active",
        blockchainHash: editingCredential?.blockchainHash || `0x${Math.random().toString(16).substr(2, 20)}...`,
        transactionHash: editingCredential?.transactionHash || `0x${Math.random().toString(16).substr(2, 20)}...`,
        verificationUrl: `https://verify.fap-blockchain.edu.vn/credential/${editingCredential?.id || Date.now()}`,
        createdAt: editingCredential?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingCredential) {
        setCredentials(prev => prev.map(c => c.id === editingCredential.id ? credentialData : c));
        message.success("Cập nhật chứng chỉ thành công!");
      } else {
        setCredentials(prev => [...prev, credentialData]);
        message.success("Cấp chứng chỉ thành công! Đã ghi lên blockchain.");
      }

      setIsModalVisible(false);
      filterCredentials(searchText, statusFilter, typeFilter);
    });
  };

  const handleRevoke = () => {
    revokeForm.validateFields().then((values) => {
      if (revokingCredential) {
        const updatedCredential: Credential = {
          ...revokingCredential,
          status: "revoked",
          revokedAt: new Date().toISOString(),
          revokedBy: "admin1",
          revokedReason: values.reason,
          updatedAt: new Date().toISOString(),
        };

        setCredentials(prev => prev.map(c => c.id === revokingCredential.id ? updatedCredential : c));
        message.success("Thu hồi chứng chỉ thành công! Đã cập nhật trên blockchain.");
        setIsRevokeModalVisible(false);
        filterCredentials(searchText, statusFilter, typeFilter);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "revoked": return "error";
      case "expired": return "warning";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Có hiệu lực";
      case "revoked": return "Đã thu hồi";
      case "expired": return "Hết hạn";
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "degree": return <TrophyOutlined />;
      case "certificate": return <SafetyOutlined />;
      case "transcript": return <FileTextOutlined />;
      case "achievement": return <CheckCircleOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "degree": return "gold";
      case "certificate": return "blue";
      case "transcript": return "green";
      case "achievement": return "purple";
      default: return "default";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "degree": return "Bằng cấp";
      case "certificate": return "Chứng chỉ";
      case "transcript": return "Bảng điểm";
      case "achievement": return "Thành tích";
      default: return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Đã sao chép vào clipboard!");
  };

  const columns: ColumnsType<Credential> = [
    {
      title: "Chứng chỉ",
      key: "credential",
      width: 300,
      render: (_, record) => (
        <div className="credential-info">
          <div className="credential-header">
            {getTypeIcon(record.credentialType)}
            <div className="credential-details">
              <div className="credential-title">{record.title}</div>
              <div className="credential-description">{record.description}</div>
              <Tag color={getTypeColor(record.credentialType)} size="small">
                {getTypeText(record.credentialType)}
              </Tag>
            </div>
          </div>
        </div>
      )
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
      )
    },
    {
      title: "Người cấp",
      dataIndex: "issuerName",
      key: "issuerName",
      width: 120,
    },
    {
      title: "Ngày cấp",
      dataIndex: "issueDate",
      key: "issueDate",
      width: 120,
      render: (date) => (
        <div className="issue-date">
          <CalendarOutlined className="date-icon" />
          {new Date(date).toLocaleDateString("vi-VN")}
        </div>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge status={getStatusColor(status)} text={getStatusText(status)} />
      )
    },
    {
      title: "Blockchain",
      key: "blockchain",
      width: 100,
      render: (_, record) => (
        <div className="blockchain-info">
          <Tooltip title={`Hash: ${record.blockchainHash}`}>
            <Button
              type="text"
              icon={<BlockOutlined />}
              size="small"
              onClick={() => copyToClipboard(record.blockchainHash || "")}
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
      )
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
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
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
              disabled={record.status === "revoked"}
            />
          </Tooltip>
          {record.status === "active" && (
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
      )
    }
  ];

  return (
    <div className="credentials-management">
      <div className="page-header">
        <h1>Quản lý Chứng chỉ & Bằng cấp</h1>
        <p>Cấp phát và quản lý chứng chỉ trên blockchain</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng chứng chỉ"
              value={stats.total}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Có hiệu lực"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã thu hồi"
              value={stats.revoked}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tháng này"
              value={stats.thisMonth}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Credential Types Stats */}
      <Row gutter={[16, 16]} className="type-stats-row">
        <Col xs={12} sm={6}>
          <Card className="type-stat-card">
            <Statistic
              title="Bằng cấp"
              value={stats.byType.degree}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="type-stat-card">
            <Statistic
              title="Chứng chỉ"
              value={stats.byType.certificate}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="type-stat-card">
            <Statistic
              title="Bảng điểm"
              value={stats.byType.transcript}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="type-stat-card">
            <Statistic
              title="Thành tích"
              value={stats.byType.achievement}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="credentials-table-card">
        <div className="table-header">
          <div className="filters">
            <Search
              placeholder="Tìm kiếm theo tên, sinh viên..."
              allowClear
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 150 }}
              value={statusFilter}
              onChange={handleStatusFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả</Option>
              <Option value="active">Có hiệu lực</Option>
              <Option value="revoked">Đã thu hồi</Option>
              <Option value="expired">Hết hạn</Option>
            </Select>
            <Select
              placeholder="Loại chứng chỉ"
              style={{ width: 150 }}
              value={typeFilter}
              onChange={handleTypeFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả</Option>
              <Option value="degree">Bằng cấp</Option>
              <Option value="certificate">Chứng chỉ</Option>
              <Option value="transcript">Bảng điểm</Option>
              <Option value="achievement">Thành tích</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Cấp chứng chỉ
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCredentials}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chứng chỉ`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingCredential ? "Chỉnh sửa chứng chỉ" : "Cấp chứng chỉ mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText={editingCredential ? "Cập nhật" : "Cấp chứng chỉ"}
        cancelText="Hủy"
      >
        <Alert
          message="Lưu ý: Chứng chỉ sẽ được ghi lên blockchain và không thể xóa"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical" initialValues={{ credentialType: "certificate" }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="credentialType"
                label="Loại chứng chỉ"
                rules={[{ required: true, message: "Vui lòng chọn loại chứng chỉ!" }]}
              >
                <Select placeholder="Chọn loại chứng chỉ">
                  <Option value="degree">Bằng cấp</Option>
                  <Option value="certificate">Chứng chỉ</Option>
                  <Option value="transcript">Bảng điểm</Option>
                  <Option value="achievement">Thành tích</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Sinh viên"
                rules={[{ required: true, message: "Vui lòng chọn sinh viên!" }]}
              >
                <Select placeholder="Chọn sinh viên" showSearch>
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.code} - {student.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="title"
            label="Tiêu đề chứng chỉ"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
          >
            <Input placeholder="Nhập tiêu đề chứng chỉ" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea placeholder="Nhập mô tả chứng chỉ" rows={3} />
          </Form.Item>

          <Form.Item name="expiryDate" label="Ngày hết hạn">
            <DatePicker placeholder="Chọn ngày hết hạn" style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={["metadata", "gpa"]} label="GPA">
                <InputNumber
                  min={0}
                  max={4}
                  step={0.1}
                  placeholder="GPA"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["metadata", "credits"]} label="Số tín chỉ">
                <InputNumber min={0} placeholder="Số tín chỉ" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["metadata", "grade"]} label="Điểm">
                <Input placeholder="Điểm (A, B, C...)" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name={["metadata", "course"]} label="Khóa học">
                <Input placeholder="Tên khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name={["metadata", "semester"]} label="Học kỳ">
                <Input placeholder="Học kỳ" />
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
        width={800}
      >
        {viewingCredential && (
          <div className="credential-detail">
            <Row gutter={[24, 24]}>
              <Col span={16}>
                <Descriptions title="Thông tin chứng chỉ" column={2} bordered>
                  <Descriptions.Item label="Loại" span={2}>
                    <Tag color={getTypeColor(viewingCredential.credentialType)} icon={getTypeIcon(viewingCredential.credentialType)}>
                      {getTypeText(viewingCredential.credentialType)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiêu đề" span={2}>
                    {viewingCredential.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>
                    {viewingCredential.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="Sinh viên">
                    {viewingCredential.studentName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã SV">
                    {viewingCredential.studentCode}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người cấp">
                    {viewingCredential.issuerName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày cấp">
                    {new Date(viewingCredential.issueDate).toLocaleDateString("vi-VN")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái" span={2}>
                    <Badge status={getStatusColor(viewingCredential.status)} text={getStatusText(viewingCredential.status)} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Blockchain Hash" span={2}>
                    <Text copyable={{ text: viewingCredential.blockchainHash }}>
                      {viewingCredential.blockchainHash}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="URL xác thực" span={2}>
                    <Link href={viewingCredential.verificationUrl} target="_blank">
                      {viewingCredential.verificationUrl}
                    </Link>
                  </Descriptions.Item>
                  {viewingCredential.status === "revoked" && (
                    <>
                      <Descriptions.Item label="Lý do thu hồi" span={2}>
                        {viewingCredential.revokedReason}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày thu hồi">
                        {viewingCredential.revokedAt && new Date(viewingCredential.revokedAt).toLocaleDateString("vi-VN")}
                      </Descriptions.Item>
                      <Descriptions.Item label="Người thu hồi">
                        {viewingCredential.revokedBy}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>

                {viewingCredential.metadata && (
                  <Descriptions title="Thông tin học tập" column={2} bordered style={{ marginTop: 16 }}>
                    {viewingCredential.metadata.gpa && (
                      <Descriptions.Item label="GPA">
                        {viewingCredential.metadata.gpa}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.metadata.credits && (
                      <Descriptions.Item label="Tín chỉ">
                        {viewingCredential.metadata.credits}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.metadata.grade && (
                      <Descriptions.Item label="Điểm">
                        {viewingCredential.metadata.grade}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.metadata.course && (
                      <Descriptions.Item label="Khóa học">
                        {viewingCredential.metadata.course}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.metadata.semester && (
                      <Descriptions.Item label="Học kỳ">
                        {viewingCredential.metadata.semester}
                      </Descriptions.Item>
                    )}
                    {viewingCredential.metadata.academicYear && (
                      <Descriptions.Item label="Năm học">
                        {viewingCredential.metadata.academicYear}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                )}
              </Col>
              <Col span={8}>
                <div className="qr-code-section">
                  <h4>QR Code xác thực</h4>
                  <QRCode
                    value={viewingCredential.verificationUrl || ""}
                    size={200}
                  />
                  <p style={{ textAlign: "center", marginTop: 8, fontSize: "12px" }}>
                    Quét để xác thực chứng chỉ
                  </p>
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
            rules={[{ required: true, message: "Vui lòng nhập lý do thu hồi!" }]}
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