import React, { useState, useEffect } from "react";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import "./index.scss";
import AuthServices from "../../services/auth/api.service";
import { setAuthData } from "../../redux/features/authSlice";
import { clearAllCookies, setCookie } from "../../utils/cookie";
import { mapBackendRoleToCode, ROLE_CODES } from "../../constants/roles";
import type { LoginRequest } from "../../Types/Auth";

interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm<LoginForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing auth cookies when loading the login page
    clearAllCookies();
  }, []);

  const onFinish = async (values: LoginForm) => {
    if (isLoading || isNavigating) return;

    setIsLoading(true);
    try {
      // Prepare login request
      const loginRequest: LoginRequest = {
        email: values.email,
        password: values.password,
      };

      // Call API
      const response = await AuthServices.login(loginRequest);

      // Store tokens
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      if (values.remember) {
        setCookie("token", response.accessToken, 30); // 30 days
        setCookie("refreshToken", response.refreshToken, 30);
      } else {
        setCookie("token", response.accessToken, 1); // 1 day
        setCookie("refreshToken", response.refreshToken, 1);
      }

      // Map backend role to frontend role code
      const roleCode = mapBackendRoleToCode(response.role);

      // Prepare user profile
      const userProfile = {
        email: values.email,
        fullName: response.fullName,
        role: response.role, // Backend role name
        roleCode: roleCode, // Frontend role code
      };

      // Update Redux store
      dispatch(
        setAuthData({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          userProfile,
        })
      );

      toast.success("Đăng nhập thành công!");
      setIsNavigating(true);

      // Small delay to ensure Redux state is updated before redirect
      setTimeout(() => {
        // Redirect based on role
        if (roleCode === ROLE_CODES.ADMIN) {
          navigate("/admin", { replace: true });
        } else if (roleCode === ROLE_CODES.TEACHER) {
          navigate("/teacher", { replace: true });
        } else if (roleCode === ROLE_CODES.STUDENT) {
          navigate("/student-portal", { replace: true });
        } else {
          navigate("/", { replace: true });
        }

        setTimeout(() => {
          setIsLoading(false);
          setIsNavigating(false);
        }, 300);
      }, 100);
    } catch (error: unknown) {
      console.error("Login error:", error);

      // Extract error message from API response
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Đăng nhập thất bại! Vui lòng kiểm tra thông tin đăng nhập.";

      toast.error(errorMessage);
      setIsLoading(false);
      setIsNavigating(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <Title level={1} className="login-title">
            Bắt đầu ngay
          </Title>
          <Text className="login-subtitle">
            Nhập thông tin đăng nhập để truy cập tài khoản
          </Text>

          <Form
            name="login"
            form={form}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            size="large"
            style={{ width: "100%" }}
            className="login-form-container"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Vui lòng nhập email hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Nhập email của bạn"
                disabled={isLoading || isNavigating}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Nhập mật khẩu của bạn"
                disabled={isLoading || isNavigating}
              />
            </Form.Item>

            <div className="login-links">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="login-checkbox">
                  Tôi đồng ý với Điều khoản & Quyền riêng tư
                </Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                loading={isLoading || isNavigating}
                block
              >
                {isLoading
                  ? "Đang đăng nhập..."
                  : isNavigating
                  ? "Đang chuyển hướng..."
                  : "Đăng nhập"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="login-right">
        <div className="fap-logo">
          UAP
          <br />
          Blockchain
        </div>
      </div>
    </div>
  );
};

export default Login;
