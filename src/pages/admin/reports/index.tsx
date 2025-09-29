import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Select,
  Button,
  Space,
  Timeline,
  Tag,
  Progress,
  Tooltip,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Avatar,
} from "antd";
import {
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  SafetyOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  AuditOutlined,
  SecurityScanOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ActivityLog, SystemLog } from "../../../models/ActivityLog";
import "./index.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const ReportsManagement: React.FC = () => {
  // Mock activity logs
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      userId: "admin1",
      userName: "Admin System",
      userRole: "admin",
      action: "issue",
      resource: "credential",
      resourceId: "1",
      resourceName: "Bachelor Degree - SE170107",
      details: "Cấp bằng cử nhân cho sinh viên Nguyễn Phi Hùng",
      metadata: {
        ipAddress: "192.168.1.100",
        userAgent: "Chrome/120.0.0.0",
        location: "Ho Chi Minh City",
      },
      severity: "medium",
      timestamp: "2024-12-22T10:30:00Z",
      blockchainHash: "0x1234567890abcdef...",
    },
    {
      id: "2",
      userId: "teacher1",
      userName: "Nguyễn Ngọc Lâm",
      userRole: "teacher",
      action: "update",
      resource: "grade",
      resourceId: "student1_course1",
      resourceName: "Blockchain Programming - SE170107",
      details: "Cập nhật điểm môn Blockchain Programming cho sinh viên SE170107",
      metadata: {
        ipAddress: "192.168.1.101",
        oldValue: { grade: "B" },
        newValue: { grade: "A" },
      },
      severity: "low",
      timestamp: "2024-12-22T09:15:00Z",
      blockchainHash: "0xabcdef1234567890...",
    },
    {
      id: "3",
      userId: "admin1",
      userName: "Admin System",
      userRole: "admin",
      action: "revoke",
      resource: "credential",
      resourceId: "4",
      resourceName: "Outstanding Student Award - SE170117",
      details: "Thu hồi giải thưởng sinh viên xuất sắc do phát hiện trùng lặp",
      metadata: {
        ipAddress: "192.168.1.100",
      },
      severity: "high",
      timestamp: "2024-12-22T08:45:00Z",
      blockchainHash: "0x9876543210fedcba...",
    },
    {
      id: "4",
      userId: "student1",
      userName: "Nguyễn Phi Hùng",
      userRole: "student",
      action: "view",
      resource: "credential",
      resourceId: "1",
      resourceName: "Bachelor Degree",
      details: "Xem thông tin bằng cấp và tải QR code xác thực",
      metadata: {
        ipAddress: "192.168.1.102",
        userAgent: "Mobile Safari",
      },
      severity: "low",
      timestamp: "2024-12-22T08:00:00Z",
    },
    {
      id: "5",
      userId: "teacher2",
      userName: "Trần Văn An",
      userRole: "teacher",
      action: "create",
      resource: "class",
      resourceId: "class5",
      resourceName: "Advanced Database Systems",
      details: "Tạo lớp học mới Advanced Database Systems cho học kỳ Spring 2024",
      metadata: {
        ipAddress: "192.168.1.103",
      },
      severity: "medium",
      timestamp: "2024-12-21T16:30:00Z",
    },
  ]);

  // Mock system logs
  const [systemLogs] = useState<SystemLog[]>([
    {
      id: "1",
      level: "info",
      message: "Blockchain transaction confirmed",
      service: "blockchain",
      details: { transactionHash: "0x1234567890abcdef...", blockNumber: 12345 },
      timestamp: "2024-12-22T10:30:15Z",
      userId: "admin1",
      requestId: "req-001",
    },
    {
      id: "2",
      level: "warn",
      message: "High number of failed login attempts detected",
      service: "auth",
      details: { ipAddress: "192.168.1.200", attempts: 5 },
      timestamp: "2024-12-22T10:25:00Z",
      requestId: "req-002",
    },
    {
      id: "3",
      level: "error",
      message: "Database connection timeout",
      service: "database",
      details: { connectionPool: "main", timeout: 30000 },
      timestamp: "2024-12-22T10:20:00Z",
      requestId: "req-003",
    },
    {
      id: "4",
      level: "info",
      message: "Credential verification successful",
      service: "api",
      details: { credentialId: "1", verificationTime: 150 },
      timestamp: "2024-12-22T10:15:00Z",
      userId: "public",
      requestId: "req-004",
    },
  ]);

  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>(activityLogs);
  const [filteredSystemLogs, setFilteredSystemLogs] = useState<SystemLog[]>(systemLogs);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportForm] = Form.useForm();
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedResource, setSelectedResource] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedLogLevel, setSelectedLogLevel] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");

  // Statistics
  const stats = {
    totalLogs: activityLogs.length,
    todayLogs: activityLogs.filter(log => 
      new Date(log.timestamp).toDateString() === new Date().toDateString()
    ).length,
    criticalAlerts: activityLogs.filter(log => log.severity === "critical").length,
    systemErrors: systemLogs.filter(log => log.level === "error").length,
    credentialsIssued: activityLogs.filter(log => 
      log.action === "issue" && log.resource === "credential"
    ).length,
    credentialsRevoked: activityLogs.filter(log => 
      log.action === "revoke" && log.resource === "credential"
    ).length,
    activeUsers: new Set(activityLogs.map(log => log.userId)).size,
    blockchainTxs: activityLogs.filter(log => log.blockchainHash).length,
  };

  // Activity distribution
  const activityDistribution = {
    credential: activityLogs.filter(log => log.resource === "credential").length,
    grade: activityLogs.filter(log => log.resource === "grade").length,
    student: activityLogs.filter(log => log.resource === "student").length,
    teacher: activityLogs.filter(log => log.resource === "teacher").length,
    class: activityLogs.filter(log => log.resource === "class").length,
    attendance: activityLogs.filter(log => log.resource === "attendance").length,
  };

  const handleDateRangeChange = (dates: any) => {
    setSelectedDateRange(dates);
    applyFilters(dates, selectedAction, selectedResource, selectedSeverity);
  };

  const handleActionFilter = (value: string) => {
    setSelectedAction(value);
    applyFilters(selectedDateRange, value, selectedResource, selectedSeverity);
  };

  const handleResourceFilter = (value: string) => {
    setSelectedResource(value);
    applyFilters(selectedDateRange, selectedAction, value, selectedSeverity);
  };

  const handleSeverityFilter = (value: string) => {
    setSelectedSeverity(value);
    applyFilters(selectedDateRange, selectedAction, selectedResource, value);
  };

  const handleSystemLogFilters = (level: string, service: string) => {
    setSelectedLogLevel(level);
    setSelectedService(service);
    
    let filtered = systemLogs;
    
    if (level !== "all") {
      filtered = filtered.filter(log => log.level === level);
    }
    
    if (service !== "all") {
      filtered = filtered.filter(log => log.service === service);
    }
    
    setFilteredSystemLogs(filtered);
  };

  const applyFilters = (dateRange: any, action: string, resource: string, severity: string) => {
    let filtered = activityLogs;

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate.toDate() && logDate <= endDate.toDate();
      });
    }

    if (action !== "all") {
      filtered = filtered.filter(log => log.action === action);
    }

    if (resource !== "all") {
      filtered = filtered.filter(log => log.resource === resource);
    }

    if (severity !== "all") {
      filtered = filtered.filter(log => log.severity === severity);
    }

    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "green";
      case "medium": return "orange";
      case "high": return "red";
      case "critical": return "purple";
      default: return "default";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "info": return "blue";
      case "warn": return "orange";
      case "error": return "red";
      case "debug": return "gray";
      default: return "default";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create": return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "update": return <EditOutlined style={{ color: "#1890ff" }} />;
      case "delete": return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "issue": return <TrophyOutlined style={{ color: "#faad14" }} />;
      case "revoke": return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "view": return <EyeOutlined style={{ color: "#722ed1" }} />;
      case "login": return <UserOutlined style={{ color: "#52c41a" }} />;
      case "logout": return <UserOutlined style={{ color: "#ff4d4f" }} />;
      default: return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "student": return <UserOutlined />;
      case "teacher": return <TeamOutlined />;
      case "class": return <BookOutlined />;
      case "credential": return <SafetyOutlined />;
      case "grade": return <FileTextOutlined />;
      case "attendance": return <CheckCircleOutlined />;
      default: return <FileTextOutlined />;
    }
  };

  const handleExport = () => {
    exportForm.validateFields().then((values) => {
      // Mock export functionality
      message.success(`Đang xuất báo cáo ${values.reportType}...`);
      setIsExportModalVisible(false);
      
      // Simulate file generation
      setTimeout(() => {
        message.success("Báo cáo đã được tạo thành công!");
      }, 2000);
    });
  };

  const activityColumns: ColumnsType<ActivityLog> = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
      render: (timestamp) => (
        <div className="timestamp">
          <ClockCircleOutlined style={{ marginRight: 4, color: "#1890ff" }} />
          {new Date(timestamp).toLocaleString("vi-VN")}
        </div>
      ),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: "Người dùng",
      key: "user",
      width: 150,
      render: (_, record) => (
        <div className="user-info">
          <Avatar size="small" icon={<UserOutlined />} />
          <div className="user-details">
            <div className="user-name">{record.userName}</div>
            <Tag color={record.userRole === "admin" ? "red" : record.userRole === "teacher" ? "blue" : "green"}>
              {record.userRole.toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div className="action-info">
          {getActionIcon(record.action)}
          <span style={{ marginLeft: 8 }}>{record.action.toUpperCase()}</span>
        </div>
      ),
    },
    {
      title: "Tài nguyên",
      key: "resource",
      width: 120,
      render: (_, record) => (
        <div className="resource-info">
          {getResourceIcon(record.resource)}
          <span style={{ marginLeft: 8 }}>{record.resource.toUpperCase()}</span>
        </div>
      ),
    },
    {
      title: "Chi tiết",
      dataIndex: "details",
      key: "details",
      ellipsis: true,
      render: (details) => (
        <Tooltip title={details}>
          {details}
        </Tooltip>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Blockchain",
      dataIndex: "blockchainHash",
      key: "blockchainHash",
      width: 100,
      render: (hash) => (
        hash ? (
          <Tooltip title={hash}>
            <Tag color="blue" icon={<SafetyOutlined />}>
              ON-CHAIN
            </Tag>
          </Tooltip>
        ) : (
          <Tag color="default">OFF-CHAIN</Tag>
        )
      ),
    },
  ];

  const systemLogColumns: ColumnsType<SystemLog> = [
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 120,
      render: (timestamp) => (
        <div className="timestamp">
          <ClockCircleOutlined style={{ marginRight: 4, color: "#1890ff" }} />
          {new Date(timestamp).toLocaleString("vi-VN")}
        </div>
      ),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: "Mức độ",
      dataIndex: "level",
      key: "level",
      width: 80,
      render: (level) => (
        <Tag color={getLogLevelColor(level)}>
          {level.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Dịch vụ",
      dataIndex: "service",
      key: "service",
      width: 100,
      render: (service) => (
        <Tag color="cyan">
          {service.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Thông điệp",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
    },
    {
      title: "Chi tiết",
      dataIndex: "details",
      key: "details",
      width: 150,
      render: (details) => (
        details ? (
          <Tooltip title={JSON.stringify(details, null, 2)}>
            <Button type="link" size="small" icon={<EyeOutlined />}>
              Xem chi tiết
            </Button>
          </Tooltip>
        ) : null
      ),
    },
  ];

  return (
    <div className="reports-management">
      <div className="page-header">
        <h1>Báo cáo & Giám sát</h1>
        <p>Theo dõi hoạt động hệ thống và tạo báo cáo</p>
      </div>

      {/* Statistics Overview */}
      <Row gutter={[16, 16]} className="stats-overview">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng hoạt động"
              value={stats.totalLogs}
              prefix={<AuditOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Hôm nay"
              value={stats.todayLogs}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Cảnh báo nghiêm trọng"
              value={stats.criticalAlerts}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Lỗi hệ thống"
              value={stats.systemErrors}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Distribution */}
      <Row gutter={[16, 16]} className="activity-distribution">
        <Col xs={24} lg={12}>
          <Card title="Phân bố hoạt động theo tài nguyên" className="distribution-card">
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div className="activity-item">
                  <SafetyOutlined style={{ color: "#ff6b35" }} />
                  <span>Chứng chỉ: {activityDistribution.credential}</span>
                  <Progress
                    percent={(activityDistribution.credential / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#ff6b35"
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="activity-item">
                  <FileTextOutlined style={{ color: "#52c41a" }} />
                  <span>Điểm: {activityDistribution.grade}</span>
                  <Progress
                    percent={(activityDistribution.grade / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="activity-item">
                  <UserOutlined style={{ color: "#1890ff" }} />
                  <span>Sinh viên: {activityDistribution.student}</span>
                  <Progress
                    percent={(activityDistribution.student / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="activity-item">
                  <TeamOutlined style={{ color: "#722ed1" }} />
                  <span>Giảng viên: {activityDistribution.teacher}</span>
                  <Progress
                    percent={(activityDistribution.teacher / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#722ed1"
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="activity-item">
                  <BookOutlined style={{ color: "#faad14" }} />
                  <span>Lớp học: {activityDistribution.class}</span>
                  <Progress
                    percent={(activityDistribution.class / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#faad14"
                    showInfo={false}
                  />
                </div>
              </Col>
              <Col span={12}>
                <div className="activity-item">
                  <CheckCircleOutlined style={{ color: "#13c2c2" }} />
                  <span>Điểm danh: {activityDistribution.attendance}</span>
                  <Progress
                    percent={(activityDistribution.attendance / stats.totalLogs) * 100}
                    size="small"
                    strokeColor="#13c2c2"
                    showInfo={false}
                  />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê chứng chỉ" className="credential-stats-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Đã cấp"
                  value={stats.credentialsIssued}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Đã thu hồi"
                  value={stats.credentialsRevoked}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: "#ff4d4f" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Người dùng hoạt động"
                  value={stats.activeUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Giao dịch Blockchain"
                  value={stats.blockchainTxs}
                  prefix={<SecurityScanOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Logs and Reports */}
      <Card className="logs-card">
        <Tabs defaultActiveKey="activity" size="large">
          <TabPane tab="Nhật ký hoạt động" key="activity">
            <div className="filters-section">
              <Space wrap size="middle">
                <RangePicker
                  placeholder={["Từ ngày", "Đến ngày"]}
                  onChange={handleDateRangeChange}
                  style={{ width: 240 }}
                />
                <Select
                  placeholder="Hành động"
                  style={{ width: 120 }}
                  value={selectedAction}
                  onChange={handleActionFilter}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="create">Tạo</Option>
                  <Option value="update">Cập nhật</Option>
                  <Option value="delete">Xóa</Option>
                  <Option value="issue">Cấp</Option>
                  <Option value="revoke">Thu hồi</Option>
                  <Option value="view">Xem</Option>
                </Select>
                <Select
                  placeholder="Tài nguyên"
                  style={{ width: 120 }}
                  value={selectedResource}
                  onChange={handleResourceFilter}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="student">Sinh viên</Option>
                  <Option value="teacher">Giảng viên</Option>
                  <Option value="class">Lớp học</Option>
                  <Option value="credential">Chứng chỉ</Option>
                  <Option value="grade">Điểm</Option>
                  <Option value="attendance">Điểm danh</Option>
                </Select>
                <Select
                  placeholder="Mức độ"
                  style={{ width: 120 }}
                  value={selectedSeverity}
                  onChange={handleSeverityFilter}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="low">Thấp</Option>
                  <Option value="medium">Trung bình</Option>
                  <Option value="high">Cao</Option>
                  <Option value="critical">Nghiêm trọng</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => setIsExportModalVisible(true)}
                >
                  Xuất báo cáo
                </Button>
              </Space>
            </div>

            <Table
              columns={activityColumns}
              dataSource={filteredLogs}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} hoạt động`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="Nhật ký hệ thống" key="system">
            <div className="filters-section">
              <Space wrap size="middle">
                <Select
                  placeholder="Mức độ"
                  style={{ width: 120 }}
                  value={selectedLogLevel}
                  onChange={(value) => handleSystemLogFilters(value, selectedService)}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="info">Info</Option>
                  <Option value="warn">Warning</Option>
                  <Option value="error">Error</Option>
                  <Option value="debug">Debug</Option>
                </Select>
                <Select
                  placeholder="Dịch vụ"
                  style={{ width: 120 }}
                  value={selectedService}
                  onChange={(value) => handleSystemLogFilters(selectedLogLevel, value)}
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="auth">Auth</Option>
                  <Option value="blockchain">Blockchain</Option>
                  <Option value="api">API</Option>
                  <Option value="database">Database</Option>
                </Select>
              </Space>
            </div>

            <Table
              columns={systemLogColumns}
              dataSource={filteredSystemLogs}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} log`,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane tab="Hoạt động gần đây" key="recent">
            <Timeline mode="left" className="recent-activity-timeline">
              {filteredLogs.slice(0, 10).map((log) => (
                <Timeline.Item
                  key={log.id}
                  dot={getActionIcon(log.action)}
                  color={getSeverityColor(log.severity)}
                >
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{log.userName}</strong>
                      <span className="timeline-time">
                        {new Date(log.timestamp).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="timeline-details">
                      {log.details}
                    </div>
                    <div className="timeline-meta">
                    <Tag color={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Tag>
                    <Tag>{log.resource}</Tag>
                    {log.blockchainHash && (
                      <Tag color="blue">
                        Blockchain
                      </Tag>
                    )}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>
        </Tabs>
      </Card>

      {/* Export Modal */}
      <Modal
        title="Xuất báo cáo"
        open={isExportModalVisible}
        onOk={handleExport}
        onCancel={() => setIsExportModalVisible(false)}
        okText="Xuất báo cáo"
        cancelText="Hủy"
      >
        <Form form={exportForm} layout="vertical">
          <Form.Item
            name="reportType"
            label="Loại báo cáo"
            rules={[{ required: true, message: "Vui lòng chọn loại báo cáo!" }]}
          >
            <Select placeholder="Chọn loại báo cáo">
              <Option value="activity">Báo cáo hoạt động</Option>
              <Option value="credentials">Báo cáo chứng chỉ</Option>
              <Option value="users">Báo cáo người dùng</Option>
              <Option value="system">Báo cáo hệ thống</Option>
              <Option value="security">Báo cáo bảo mật</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="Khoảng thời gian"
            rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian!" }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="format"
            label="Định dạng"
            rules={[{ required: true, message: "Vui lòng chọn định dạng!" }]}
          >
            <Select placeholder="Chọn định dạng">
              <Option value="pdf">PDF</Option>
              <Option value="excel">Excel</Option>
              <Option value="csv">CSV</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả báo cáo (tùy chọn)" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportsManagement;