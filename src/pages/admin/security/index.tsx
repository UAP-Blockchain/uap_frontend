import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Select,
  message,
  Tag,
  Alert,
  Tabs,
  List,
  Avatar,
  Badge,
  Tooltip,
  Progress,
  Timeline,
  Descriptions,
  Popconfirm,
} from "antd";
import {
  SecurityScanOutlined,
  UserOutlined,
 
  WarningOutlined,
  LockOutlined,
  UnlockOutlined,
  SettingOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  MobileOutlined,
  DesktopOutlined,
  SafetyOutlined,
  KeyOutlined,
  AuditOutlined,
  BellOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { User, LoginSession, SecuritySettings, SecurityAlert } from "../../../models/Security";
import "./index.scss";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const SecurityManagement: React.FC = () => {
  // Mock users data
  const [users] = useState<User[]>([
    {
      id: "1",
      username: "admin",
      email: "admin@fap-blockchain.edu.vn",
      fullName: "System Administrator",
      role: "admin",
      status: "active",
      mfaEnabled: true,
      lastLogin: "2024-12-22T10:30:00Z",
      loginAttempts: 0,
      passwordChangedAt: "2024-11-01T00:00:00Z",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-12-22T10:30:00Z",
    },
    {
      id: "2",
      username: "lamnn15",
      email: "lamnn15@fpt.edu.vn",
      fullName: "Nguyễn Ngọc Lâm",
      role: "teacher",
      status: "active",
      mfaEnabled: true,
      lastLogin: "2024-12-22T09:15:00Z",
      loginAttempts: 0,
      passwordChangedAt: "2024-10-15T00:00:00Z",
      createdAt: "2024-02-01T00:00:00Z",
      updatedAt: "2024-12-22T09:15:00Z",
    },
    {
      id: "3",
      username: "hungnp.se170107",
      email: "hungnpse170107@fpt.edu.com",
      fullName: "Nguyễn Phi Hùng",
      role: "student",
      status: "active",
      mfaEnabled: false,
      lastLogin: "2024-12-22T08:00:00Z",
      loginAttempts: 0,
      passwordChangedAt: "2024-09-01T00:00:00Z",
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-12-22T08:00:00Z",
    },
    {
      id: "4",
      username: "namnt.se170246",
      email: "namntse170246@fpt.edu.com",
      fullName: "Nguyễn Trung Nam",
      role: "student",
      status: "locked",
      mfaEnabled: false,
      lastLogin: "2024-12-21T20:00:00Z",
      loginAttempts: 5,
      lockoutUntil: "2024-12-22T14:00:00Z",
      passwordChangedAt: "2024-08-01T00:00:00Z",
      createdAt: "2024-03-01T00:00:00Z",
      updatedAt: "2024-12-21T20:00:00Z",
    },
  ]);

  // Mock login sessions
  const [loginSessions] = useState<LoginSession[]>([
    {
      id: "1",
      userId: "1",
      userName: "System Administrator",
      userRole: "admin",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      location: "Ho Chi Minh City, Vietnam",
      loginTime: "2024-12-22T10:30:00Z",
      lastActivity: "2024-12-22T11:45:00Z",
      expiresAt: "2024-12-22T18:30:00Z",
      status: "active",
      mfaVerified: true,
    },
    {
      id: "2",
      userId: "2",
      userName: "Nguyễn Ngọc Lâm",
      userRole: "teacher",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      location: "Ho Chi Minh City, Vietnam",
      loginTime: "2024-12-22T09:15:00Z",
      lastActivity: "2024-12-22T11:30:00Z",
      expiresAt: "2024-12-22T17:15:00Z",
      status: "active",
      mfaVerified: true,
    },
    {
      id: "3",
      userId: "3",
      userName: "Nguyễn Phi Hùng",
      userRole: "student",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      location: "Ho Chi Minh City, Vietnam",
      loginTime: "2024-12-22T08:00:00Z",
      lastActivity: "2024-12-22T10:00:00Z",
      expiresAt: "2024-12-22T16:00:00Z",
      status: "expired",
      mfaVerified: false,
    },
  ]);

  // Mock security alerts
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([
    {
      id: "1",
      type: "failed_login",
      severity: "medium",
      title: "Nhiều lần đăng nhập thất bại",
      description: "Người dùng namnt.se170246 đã thử đăng nhập sai 5 lần liên tiếp",
      userId: "4",
      userName: "Nguyễn Trung Nam",
      ipAddress: "192.168.1.200",
      metadata: { attempts: 5, timespan: "10 minutes" },
      status: "new",
      createdAt: "2024-12-21T20:00:00Z",
      updatedAt: "2024-12-21T20:00:00Z",
    },
    {
      id: "2",
      type: "suspicious_activity",
      severity: "high",
      title: "Truy cập từ địa chỉ IP lạ",
      description: "Người dùng admin đăng nhập từ địa chỉ IP chưa từng thấy",
      userId: "1",
      userName: "System Administrator",
      ipAddress: "203.113.XXX.XXX",
      metadata: { location: "Unknown Location", previousIPs: ["192.168.1.100"] },
      status: "investigating",
      assignedTo: "security_team",
      createdAt: "2024-12-22T07:00:00Z",
      updatedAt: "2024-12-22T08:00:00Z",
    },
    {
      id: "3",
      type: "policy_violation",
      severity: "low",
      title: "Mật khẩu yếu được phát hiện",
      description: "Sinh viên hungnp.se170107 đang sử dụng mật khẩu không đáp ứng chính sách bảo mật",
      userId: "3",
      userName: "Nguyễn Phi Hùng",
      metadata: { passwordStrength: "weak", lastChanged: "2024-09-01" },
      status: "resolved",
      resolvedBy: "system",
      resolvedAt: "2024-12-22T09:00:00Z",
      notes: "Đã yêu cầu người dùng thay đổi mật khẩu",
      createdAt: "2024-12-22T06:00:00Z",
      updatedAt: "2024-12-22T09:00:00Z",
    },
  ]);

  // Mock security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    id: "1",
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90,
      preventReuse: 5,
    },
    sessionPolicy: {
      maxDuration: 480, // 8 hours
      inactivityTimeout: 30,
      maxConcurrentSessions: 3,
    },
    mfaPolicy: {
      required: true,
      allowedMethods: ["totp", "email"],
      backupCodes: true,
    },
    loginPolicy: {
      maxAttempts: 5,
      lockoutDuration: 30,
      captchaThreshold: 3,
    },
    auditPolicy: {
      retentionPeriod: 365,
      logLevel: "detailed",
      realTimeAlerts: true,
    },
    updatedBy: "admin",
    updatedAt: "2024-12-01T00:00:00Z",
  });

  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isAlertModalVisible, setIsAlertModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [settingsForm] = Form.useForm();
  const [alertForm] = Form.useForm();

  // Statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "active").length,
    lockedUsers: users.filter(u => u.status === "locked").length,
    mfaEnabled: users.filter(u => u.mfaEnabled).length,
    activeSessions: loginSessions.filter(s => s.status === "active").length,
    newAlerts: securityAlerts.filter(a => a.status === "new").length,
    criticalAlerts: securityAlerts.filter(a => a.severity === "critical").length,
    passwordExpired: users.filter(u => {
      const passwordAge = (new Date().getTime() - new Date(u.passwordChangedAt).getTime()) / (1000 * 60 * 60 * 24);
      return passwordAge > securitySettings.passwordPolicy.maxAge;
    }).length,
  };

  const handleUnlockUser = (userId: string) => {
    message.success(`Đã mở khóa người dùng ${userId}`);
  };

  const handleTerminateSession = (sessionId: string) => {
    message.success(`Đã kết thúc phiên đăng nhập ${sessionId}`);
  };

  const handleUpdateSettings = () => {
    settingsForm.validateFields().then((values) => {
      setSecuritySettings({ ...securitySettings, ...values });
      message.success("Cập nhật cài đặt bảo mật thành công!");
      setIsSettingsModalVisible(false);
    });
  };

  const handleAlertAction = () => {
    alertForm.validateFields().then((values) => {
      if (selectedAlert) {
        const updatedAlert = {
          ...selectedAlert,
          status: values.status,
          assignedTo: values.assignedTo,
          notes: values.notes,
          resolvedBy: values.status === "resolved" ? "admin" : undefined,
          resolvedAt: values.status === "resolved" ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString(),
        };

        setSecurityAlerts(prev => prev.map(alert => 
          alert.id === selectedAlert.id ? updatedAlert : alert
        ));

        message.success("Cập nhật cảnh báo thành công!");
        setIsAlertModalVisible(false);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "inactive": return "default";
      case "suspended": return "warning";
      case "locked": return "error";
      default: return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Hoạt động";
      case "inactive": return "Không hoạt động";
      case "suspended": return "Tạm ngưng";
      case "locked": return "Bị khóa";
      default: return status;
    }
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low": return <CheckCircleOutlined />;
      case "medium": return <ExclamationCircleOutlined />;
      case "high": return <WarningOutlined />;
      case "critical": return <CloseCircleOutlined />;
      default: return <ExclamationCircleOutlined />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "failed_login": return <LockOutlined />;
      case "suspicious_activity": return <EyeOutlined />;
      case "data_breach": return <SecurityScanOutlined />;
      case "system_error": return <ExclamationCircleOutlined />;
      case "policy_violation": return <WarningOutlined />;
      default: return <ExclamationCircleOutlined />;
    }
  };

  const getUserAgent = (userAgent: string) => {
    if (userAgent.includes("Mobile") || userAgent.includes("iPhone")) {
      return { icon: <MobileOutlined />, text: "Mobile" };
    } else if (userAgent.includes("Macintosh")) {
      return { icon: <DesktopOutlined />, text: "Mac" };
    } else {
      return { icon: <DesktopOutlined />, text: "Desktop" };
    }
  };

  const userColumns: ColumnsType<User> = [
    {
      title: "Người dùng",
      key: "user",
      width: 200,
      render: (_, record) => (
        <div className="user-info">
          <Avatar icon={<UserOutlined />} />
          <div className="user-details">
            <div className="user-name">{record.fullName}</div>
            <div className="username">@{record.username}</div>
            <div className="email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => (
        <Tag color={role === "admin" ? "red" : role === "teacher" ? "blue" : "green"}>
          {role.toUpperCase()}
        </Tag>
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
      title: "MFA",
      dataIndex: "mfaEnabled",
      key: "mfaEnabled",
      width: 80,
      render: (enabled) => (
        <Tag color={enabled ? "green" : "red"} icon={enabled ? <CheckCircleOutlined /> : <WarningOutlined />}>
          {enabled ? "Bật" : "Tắt"}
        </Tag>
      ),
    },
    {
      title: "Lần đăng nhập cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
      width: 150,
      render: (lastLogin) => (
        lastLogin ? (
          <div className="last-login">
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {new Date(lastLogin).toLocaleString("vi-VN")}
          </div>
        ) : (
          <span style={{ color: "#999" }}>Chưa đăng nhập</span>
        )
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          {record.status === "locked" && (
            <Tooltip title="Mở khóa">
              <Button
                type="primary"
                size="small"
                icon={<UnlockOutlined />}
                onClick={() => handleUnlockUser(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const sessionColumns: ColumnsType<LoginSession> = [
    {
      title: "Người dùng",
      key: "user",
      width: 180,
      render: (_, record) => (
        <div className="session-user">
          <Avatar size="small" icon={<UserOutlined />} />
          <div>
            <div className="user-name">{record.userName}</div>
            <Tag size="small" color={record.userRole === "admin" ? "red" : record.userRole === "teacher" ? "blue" : "green"}>
              {record.userRole.toUpperCase()}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Thiết bị",
      key: "device",
      width: 120,
      render: (_, record) => {
        const device = getUserAgent(record.userAgent);
        return (
          <div className="device-info">
            {device.icon}
            <span style={{ marginLeft: 8 }}>{device.text}</span>
          </div>
        );
      },
    },
    {
      title: "Địa chỉ IP",
      dataIndex: "ipAddress",
      key: "ipAddress",
      width: 120,
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 150,
      render: (location) => (
        <div className="location">
          <GlobalOutlined style={{ marginRight: 4 }} />
          {location}
        </div>
      ),
    },
    {
      title: "Thời gian đăng nhập",
      dataIndex: "loginTime",
      key: "loginTime",
      width: 150,
      render: (loginTime) => (
        <div className="login-time">
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(loginTime).toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Badge 
          status={status === "active" ? "success" : status === "expired" ? "warning" : "error"} 
          text={status === "active" ? "Hoạt động" : status === "expired" ? "Hết hạn" : "Kết thúc"} 
        />
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        record.status === "active" && (
          <Popconfirm
            title="Kết thúc phiên đăng nhập?"
            onConfirm={() => handleTerminateSession(record.id)}
            okText="Đồng ý"
            cancelText="Hủy"
          >
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
            >
              Kết thúc
            </Button>
          </Popconfirm>
        )
      ),
    },
  ];

  const alertColumns: ColumnsType<SecurityAlert> = [
    {
      title: "Loại cảnh báo",
      key: "type",
      width: 150,
      render: (_, record) => (
        <div className="alert-type">
          {getAlertTypeIcon(record.type)}
          <span style={{ marginLeft: 8 }}>{record.title}</span>
        </div>
      ),
    },
    {
      title: "Mức độ",
      dataIndex: "severity",
      key: "severity",
      width: 100,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (createdAt) => (
        <div className="alert-time">
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {new Date(createdAt).toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colors = {
          new: "red",
          investigating: "orange",
          resolved: "green",
          false_positive: "gray",
        };
        const texts = {
          new: "Mới",
          investigating: "Đang xử lý",
          resolved: "Đã giải quyết",
          false_positive: "Báo động giả",
        };
        return <Tag color={colors[status as keyof typeof colors]}>{texts[status as keyof typeof texts]}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedAlert(record);
            alertForm.setFieldsValue(record);
            setIsAlertModalVisible(true);
          }}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <div className="security-management">
      <div className="page-header">
        <h1>Bảo mật & Xác thực</h1>
        <p>Quản lý bảo mật hệ thống và xác thực người dùng</p>
      </div>

      {/* Security Statistics */}
      <Row gutter={[16, 16]} className="security-stats">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang hoạt động"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Bị khóa"
              value={stats.lockedUsers}
              prefix={<LockOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã bật MFA"
              value={stats.mfaEnabled}
              prefix={<ShieldOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="security-stats">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Phiên hoạt động"
              value={stats.activeSessions}
              prefix={<GlobalOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Cảnh báo mới"
              value={stats.newAlerts}
              prefix={<BellOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Cảnh báo nghiêm trọng"
              value={stats.criticalAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Mật khẩu hết hạn"
              value={stats.passwordExpired}
              prefix={<KeyOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="security-content-card">
        <div className="security-header">
          <h2>Quản lý Bảo mật</h2>
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => {
              settingsForm.setFieldsValue(securitySettings);
              setIsSettingsModalVisible(true);
            }}
          >
            Cài đặt bảo mật
          </Button>
        </div>

        <Tabs defaultActiveKey="users" size="large">
          <TabPane tab="Người dùng" key="users">
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} người dùng`,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane tab="Phiên đăng nhập" key="sessions">
            <Table
              columns={sessionColumns}
              dataSource={loginSessions}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} phiên`,
              }}
              scroll={{ x: 1000 }}
            />
          </TabPane>

          <TabPane tab="Cảnh báo bảo mật" key="alerts">
            <Table
              columns={alertColumns}
              dataSource={securityAlerts}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} cảnh báo`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>

          <TabPane tab="Chính sách bảo mật" key="policies">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Chính sách mật khẩu" className="policy-card">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Độ dài tối thiểu">
                      {securitySettings.passwordPolicy.minLength} ký tự
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu chữ hoa">
                      {securitySettings.passwordPolicy.requireUppercase ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu chữ thường">
                      {securitySettings.passwordPolicy.requireLowercase ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu số">
                      {securitySettings.passwordPolicy.requireNumbers ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Yêu cầu ký tự đặc biệt">
                      {securitySettings.passwordPolicy.requireSpecialChars ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời hạn mật khẩu">
                      {securitySettings.passwordPolicy.maxAge} ngày
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Chính sách phiên" className="policy-card">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Thời gian tối đa">
                      {securitySettings.sessionPolicy.maxDuration} phút
                    </Descriptions.Item>
                    <Descriptions.Item label="Timeout không hoạt động">
                      {securitySettings.sessionPolicy.inactivityTimeout} phút
                    </Descriptions.Item>
                    <Descriptions.Item label="Số phiên đồng thời">
                      {securitySettings.sessionPolicy.maxConcurrentSessions}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Chính sách MFA" className="policy-card">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Bắt buộc MFA">
                      {securitySettings.mfaPolicy.required ? "Có" : "Không"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phương thức cho phép">
                      {securitySettings.mfaPolicy.allowedMethods.join(", ")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã dự phòng">
                      {securitySettings.mfaPolicy.backupCodes ? "Có" : "Không"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Chính sách đăng nhập" className="policy-card">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Số lần thử tối đa">
                      {securitySettings.loginPolicy.maxAttempts}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thời gian khóa">
                      {securitySettings.loginPolicy.lockoutDuration} phút
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngưỡng CAPTCHA">
                      {securitySettings.loginPolicy.captchaThreshold} lần
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Security Settings Modal */}
      <Modal
        title="Cài đặt bảo mật"
        open={isSettingsModalVisible}
        onOk={handleUpdateSettings}
        onCancel={() => setIsSettingsModalVisible(false)}
        width={800}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={settingsForm} layout="vertical">
          <h4>Chính sách mật khẩu</h4>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["passwordPolicy", "minLength"]}
                label="Độ dài tối thiểu"
              >
                <InputNumber min={6} max={20} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["passwordPolicy", "maxAge"]}
                label="Thời hạn (ngày)"
              >
                <InputNumber min={30} max={365} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={["passwordPolicy", "requireUppercase"]}
                label="Yêu cầu chữ hoa"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={["passwordPolicy", "requireNumbers"]}
                label="Yêu cầu số"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <h4 style={{ marginTop: 24 }}>Chính sách phiên</h4>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["sessionPolicy", "maxDuration"]}
                label="Thời gian tối đa (phút)"
              >
                <InputNumber min={60} max={1440} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["sessionPolicy", "inactivityTimeout"]}
                label="Timeout (phút)"
              >
                <InputNumber min={5} max={120} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["sessionPolicy", "maxConcurrentSessions"]}
                label="Phiên đồng thời"
              >
                <InputNumber min={1} max={10} />
              </Form.Item>
            </Col>
          </Row>

          <h4 style={{ marginTop: 24 }}>Chính sách đăng nhập</h4>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={["loginPolicy", "maxAttempts"]}
                label="Số lần thử tối đa"
              >
                <InputNumber min={3} max={10} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["loginPolicy", "lockoutDuration"]}
                label="Thời gian khóa (phút)"
              >
                <InputNumber min={5} max={1440} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={["loginPolicy", "captchaThreshold"]}
                label="Ngưỡng CAPTCHA"
              >
                <InputNumber min={1} max={5} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Alert Detail Modal */}
      <Modal
        title="Chi tiết cảnh báo bảo mật"
        open={isAlertModalVisible}
        onOk={handleAlertAction}
        onCancel={() => setIsAlertModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        {selectedAlert && (
          <div>
            <Alert
              message={selectedAlert.title}
              description={selectedAlert.description}
              type={selectedAlert.severity === "critical" || selectedAlert.severity === "high" ? "error" : "warning"}
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Loại cảnh báo">
                {selectedAlert.type}
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ">
                <Tag color={getSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người dùng">
                {selectedAlert.userName}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                {selectedAlert.ipAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian" span={2}>
                {new Date(selectedAlert.createdAt).toLocaleString("vi-VN")}
              </Descriptions.Item>
            </Descriptions>

            <Form form={alertForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select>
                      <Option value="new">Mới</Option>
                      <Option value="investigating">Đang xử lý</Option>
                      <Option value="resolved">Đã giải quyết</Option>
                      <Option value="false_positive">Báo động giả</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="assignedTo" label="Phân công cho">
                    <Input placeholder="Nhập tên người xử lý" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Nhập ghi chú xử lý..." />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SecurityManagement;