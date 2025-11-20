import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StudentServices from "../../../services/student/api.service";
import AuthServices from "../../../services/auth/api.service";
import type { StudentDetailDto } from "../../../types/Student";
import type { ChangePasswordWithOtpRequest } from "../../../types/Auth";
import "./Profile.scss";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const Profile: React.FC = () => {
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentDetailDto | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Avatar từ public folder
  const tempAvatar = "/image/avatarEx.jpg";

  useEffect(() => {
    fetchStudentProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const data = await StudentServices.getCurrentStudentProfile();
      setStudentData(data);

      // Set form values với dữ liệu từ API
      personalForm.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
      });
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Không thể tải hồ sơ sinh viên";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoSave = async (values: Record<string, string>) => {
    try {
      // TODO: Implement update profile API when available
      // For now, just show success message
      console.log("Saving personal info:", values);
      message.success("Cập nhật thông tin cá nhân thành công!");
      setEditingPersonal(false);
      // Refresh profile data
      await fetchStudentProfile();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Cập nhật thông tin cá nhân thất bại";
      message.error(errorMessage);
    }
  };

  const handleSendOtp = async () => {
    if (!studentData?.email) {
      message.error("Không tìm thấy email của bạn");
      return;
    }

    try {
      setSendingOtp(true);
      await AuthServices.sendOtp({
        email: studentData.email,
        purpose: "ChangePassword",
      });
      setOtpSent(true);
      message.success(
        "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email."
      );
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message || err.message || "Gửi mã OTP thất bại";
      message.error(errorMessage);
    } finally {
      setSendingOtp(false);
    }
  };

  const handlePasswordChange = async (values: Record<string, string>) => {
    try {
      if (!values.otpCode) {
        message.error("Vui lòng nhập mã OTP");
        return;
      }

      const request: ChangePasswordWithOtpRequest = {
        otpCode: values.otpCode,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      };

      const response = await AuthServices.changePasswordWithOtp(request);

      if (response.success) {
        message.success("Đổi mật khẩu thành công!");
        setShowPasswordModal(false);
        setOtpSent(false);
        passwordForm.resetFields();
      } else {
        message.error(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const errorMessage =
        err.response?.data?.message || err.message || "Đổi mật khẩu thất bại";
      message.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="profile-page">
        <Card>
          <Text>Không có dữ liệu sinh viên</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          Quản lý hồ sơ
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 16, color: "rgba(255,255,255,0.8)" }}
        >
          Quản lý thông tin cá nhân và cài đặt bảo mật
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card className="profile-overview-card">
            <div className="profile-header">
              <div className="avatar-section">
                <Avatar
                  size={100}
                  src={tempAvatar}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
              </div>
              <div className="profile-info">
                <Title
                  level={3}
                  style={{ margin: "16px 0 4px", textAlign: "center" }}
                >
                  {studentData.fullName}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {studentData.studentCode}
                </Text>
                <div style={{ textAlign: "center" }}>
                  <Tag color={studentData.isActive ? "green" : "red"}>
                    {studentData.isActive ? "Hoạt động" : "Không hoạt động"}
                  </Tag>
                  {studentData.isGraduated && (
                    <Tag color="blue">Đã tốt nghiệp</Tag>
                  )}
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Email">
                <Text copyable>{studentData.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="GPA">
                <Tag color="gold">{studentData.gpa.toFixed(2)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày nhập học">
                {dayjs(studentData.enrollmentDate).format("MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số lớp">
                <Tag color="blue">{studentData.totalClasses}</Tag>
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
                    <IdcardOutlined style={{ color: "#1a94fc" }} />
                    <span>Thông tin cá nhân</span>
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
                    {editingPersonal ? "Lưu thay đổi" : "Chỉnh sửa"}
                  </Button>
                }
              >
                <Form
                  form={personalForm}
                  layout="vertical"
                  onFinish={handlePersonalInfoSave}
                  initialValues={{
                    fullName: studentData.fullName,
                    email: studentData.email,
                  }}
                >
                  <Row gutter={[16, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Họ và tên" name="fullName">
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
                      <Form.Item label="Số điện thoại" name="phone">
                        <Input
                          prefix={<PhoneOutlined />}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Ngày sinh" name="dateOfBirth">
                        <DatePicker
                          style={{ width: "100%" }}
                          disabled={!editingPersonal}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Địa chỉ" name="address">
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

            {/* Change Password */}
            <Col xs={24}>
              <Card
                title={
                  <Space>
                    <LockOutlined style={{ color: "#1a94fc" }} />
                    <span>Đổi mật khẩu</span>
                  </Space>
                }
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                  }}
                >
                  <div>
                    <Text strong>Mật khẩu</Text>
                    <br />
                    <Text type="secondary">
                      Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </Text>
                  </div>
                  <Button
                    type="primary"
                    icon={<LockOutlined />}
                    onClick={() => setShowPasswordModal(true)}
                  >
                    Đổi mật khẩu
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Change Password Modal */}
      <Modal
        title="Đổi mật khẩu"
        open={showPasswordModal}
        onCancel={() => {
          setShowPasswordModal(false);
          setOtpSent(false);
          passwordForm.resetFields();
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setShowPasswordModal(false);
              setOtpSent(false);
              passwordForm.resetFields();
            }}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => passwordForm.submit()}
            disabled={!otpSent}
          >
            Đổi mật khẩu
          </Button>,
        ]}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          {!otpSent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Text>
                Để đổi mật khẩu, bạn cần nhận mã OTP qua email. Nhấn nút bên
                dưới để gửi mã OTP.
              </Text>
              <br />
              <Button
                type="primary"
                onClick={handleSendOtp}
                loading={sendingOtp}
                style={{ marginTop: 16 }}
              >
                Gửi mã OTP
              </Button>
            </div>
          ) : (
            <>
              <Form.Item
                label="Mã OTP"
                name="otpCode"
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP" },
                  {
                    len: 6,
                    message: "Mã OTP phải có 6 chữ số",
                  },
                ]}
                extra={
                  <Button
                    type="link"
                    size="small"
                    onClick={handleSendOtp}
                    loading={sendingOtp}
                    style={{ padding: 0 }}
                  >
                    Gửi lại mã OTP
                  </Button>
                }
              >
                <Input
                  placeholder="Nhập mã OTP 6 chữ số"
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: "8px" }}
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu hiện tại"
                name="currentPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu hiện tại",
                  },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
