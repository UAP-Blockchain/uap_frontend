import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Switch,
  DatePicker,
  Divider,
  message,
  Modal,
  List,
  Tag,
  Badge,
  Descriptions,
  Alert,
  Space,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  SaveOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
  LogoutOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  DeleteOutlined,
  LockOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./Profile.scss";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const Profile: React.FC = () => {
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Mock user data
  const userData = {
    fullName: "Nguyễn Văn Hoàng",
    studentId: "SE171234",
    email: "hoang.nguyen@student.fpt.edu.vn",
    phone: "+84 123 456 789",
    dateOfBirth: "2000-03-15",
    address: "123 Lê Văn Việt, Quận 9, TP.HCM",
    major: "Software Engineering",
    year: "4th Year",
    gpa: "3.85",
    joinDate: "2021-09-01",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang",
  };

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    credentialUpdates: true,
    securityAlerts: true,
    marketingEmails: false,
  });

  const loginSessions = [
    {
      id: "session_1",
      device: "Chrome on Windows 10",
      location: "Ho Chi Minh City, Vietnam",
      ip: "192.168.1.100",
      lastActive: "2024-09-12T14:30:00Z",
      isCurrent: true,
    },
    {
      id: "session_2",
      device: "Mobile App on iPhone",
      location: "Ho Chi Minh City, Vietnam",
      ip: "192.168.1.101",
      lastActive: "2024-09-12T08:15:00Z",
      isCurrent: false,
    },
    {
      id: "session_3",
      device: "Safari on MacBook",
      location: "Da Nang, Vietnam",
      ip: "192.168.2.50",
      lastActive: "2024-09-11T22:45:00Z",
      isCurrent: false,
    },
  ];

  const handlePersonalInfoSave = async (values: Record<string, string>) => {
    try {
      console.log("Saving personal info:", values);
      message.success("Personal information updated successfully!");
      setEditingPersonal(false);
    } catch {
      message.error("Failed to update personal information");
    }
  };

  const handlePasswordChange = async (values: Record<string, string>) => {
    try {
      console.log("Changing password:", values);
      message.success("Password changed successfully!");
      setShowPasswordModal(false);
      passwordForm.resetFields();
    } catch {
      message.error("Failed to change password");
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
    message.success(`${key} ${value ? "enabled" : "disabled"}`);
  };

  const handleLogoutSession = () => {
    Modal.confirm({
      title: "End Session",
      content: "Are you sure you want to end this session?",
      okText: "End Session",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        message.success("Session ended successfully");
      },
    });
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  const uploadProps: UploadProps = {
    name: "avatar",
    listType: "picture-card",
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must be smaller than 2MB!");
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        message.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
      return false;
    },
  };

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          👤 Profile Management
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}
        >
          Manage your personal information and security settings
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card className="profile-overview-card">
            <div className="profile-header">
              <div className="avatar-section">
                <Badge count={<CameraOutlined />} offset={[-10, 35]}>
                  <Upload {...uploadProps}>
                    <Avatar
                      size={100}
                      src={profileImage || userData.avatar}
                      icon={<UserOutlined />}
                      className="profile-avatar"
                    />
                  </Upload>
                </Badge>
              </div>
              <div className="profile-info">
                <Title
                  level={3}
                  style={{ margin: "16px 0 4px", textAlign: "center" }}
                >
                  {userData.fullName}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {userData.studentId}
                </Text>
                <div style={{ textAlign: "center" }}>
                  <Tag color="blue">{userData.major}</Tag>
                  <Tag color="green">{userData.year}</Tag>
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">
                <Text copyable>{userData.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <Text copyable>{userData.phone}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="GPA">
                <Tag color="gold">{userData.gpa}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {dayjs(userData.joinDate).format("MMMM YYYY")}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Row gutter={[0, 24]}>
            {/* Personal Information */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <IdcardOutlined style={{ color: "#1890ff" }} />
                    <span>Personal Information</span>
                  </Space>
                }
                extra={
                  <Button
                    type={editingPersonal ? "default" : "primary"}
                    icon={editingPersonal ? <SaveOutlined /> : <EditOutlined />}
                    onClick={() => {
                      if (editingPersonal) {
                        personalForm.submit();
                      } else {
                        setEditingPersonal(true);
                      }
                    }}
                  >
                    {editingPersonal ? "Save Changes" : "Edit Info"}
                  </Button>
                }
              >
                <Form
                  form={personalForm}
                  layout="vertical"
                  onFinish={handlePersonalInfoSave}
                  initialValues={{
                    fullName: userData.fullName,
                    email: userData.email,
                    phone: userData.phone,
                    dateOfBirth: dayjs(userData.dateOfBirth),
                    address: userData.address,
                  }}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Full Name" name="fullName">
                        <Input
                          prefix={<UserOutlined />}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Email" name="email">
                        <Input
                          prefix={<MailOutlined />}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Phone Number" name="phone">
                        <Input
                          prefix={<PhoneOutlined />}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Date of Birth" name="dateOfBirth">
                        <DatePicker
                          style={{ width: "100%" }}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Address" name="address">
                        <Input
                          prefix={<EnvironmentOutlined />}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>

            {/* Security Settings */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <SafetyCertificateOutlined style={{ color: "#52c41a" }} />
                    <span>Security Settings</span>
                  </Space>
                }
              >
                <Row gutter={[0, 16]}>
                  <Col xs={24}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                      }}
                    >
                      <div>
                        <Text strong>Password</Text>
                        <br />
                        <Text type="secondary">Last changed 3 months ago</Text>
                      </div>
                      <Button
                        icon={<LockOutlined />}
                        onClick={() => setShowPasswordModal(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  </Col>

                  <Col xs={24}>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                      }}
                    >
                      <div>
                        <Text strong>Two-Factor Authentication</Text>
                        <br />
                        <Text type="secondary">
                          Add an extra layer of security
                        </Text>
                      </div>
                      <Switch
                        defaultChecked
                        onChange={(checked) =>
                          message.success(
                            `2FA ${checked ? "enabled" : "disabled"}`
                          )
                        }
                      />
                    </div>
                  </Col>

                  <Col xs={24}>
                    <Divider style={{ margin: "12px 0" }} />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                      }}
                    >
                      <Text strong>Active Sessions</Text>
                      <Text type="secondary">
                        {loginSessions.length} active sessions
                      </Text>
                    </div>

                    <List
                      dataSource={loginSessions}
                      renderItem={(session) => (
                        <List.Item
                          actions={[
                            session.isCurrent ? (
                              <Tag color="green">Current</Tag>
                            ) : (
                              <Button
                                type="text"
                                danger
                                icon={<LogoutOutlined />}
                                onClick={handleLogoutSession}
                              >
                                End Session
                              </Button>
                            ),
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                icon={
                                  session.isCurrent ? (
                                    <UserOutlined />
                                  ) : (
                                    <PhoneOutlined />
                                  )
                                }
                              />
                            }
                            title={session.device}
                            description={
                              <div>
                                <Text type="secondary">
                                  {session.location} • {session.ip}
                                </Text>
                                <br />
                                <Text type="secondary">
                                  Last active:{" "}
                                  {dayjs(session.lastActive).fromNow()}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Notification Settings */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <BellOutlined style={{ color: "#722ed1" }} />
                    <span>Notification Preferences</span>
                  </Space>
                }
              >
                <Row gutter={[0, 16]}>
                  {Object.entries(notifications).map(([key, value]) => (
                    <Col xs={24} key={key}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                        }}
                      >
                        <div>
                          <Text strong>
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Text>
                          <br />
                          <Text type="secondary">
                            {key === "emailNotifications" &&
                              "Receive updates via email"}
                            {key === "smsNotifications" &&
                              "Get SMS alerts for important updates"}
                            {key === "pushNotifications" &&
                              "Browser push notifications"}
                            {key === "credentialUpdates" &&
                              "New credentials and status changes"}
                            {key === "securityAlerts" &&
                              "Login attempts and security issues"}
                            {key === "marketingEmails" &&
                              "Product updates and newsletters"}
                          </Text>
                        </div>
                        <Switch
                          checked={value}
                          onChange={(checked) =>
                            handleNotificationChange(key, checked)
                          }
                        />
                      </div>
                      {key !== "marketingEmails" && (
                        <Divider style={{ margin: "8px 0" }} />
                      )}
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>

            {/* Account Management */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <SettingOutlined style={{ color: "#fa541c" }} />
                    <span>Account Management</span>
                  </Space>
                }
              >
                <Alert
                  message="Danger Zone"
                  description="These actions are permanent and cannot be undone."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => passwordForm.submit()}
          >
            Change Password
          </Button>,
        ]}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter a new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your new password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        title="Delete Account"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => {
              message.success("Account deletion request submitted");
              setShowDeleteModal(false);
            }}
          >
            Delete Account
          </Button>,
        ]}
      >
        <Alert
          message="This action cannot be undone!"
          description="Deleting your account will permanently remove all your data, credentials, and access to the platform."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Paragraph>
          If you're sure you want to delete your account, please type your email
          address to confirm:
        </Paragraph>
        <Input placeholder="Enter your email address" />
      </Modal>
    </div>
  );
};

export default Profile;
