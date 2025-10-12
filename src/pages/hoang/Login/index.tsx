import React, { useState, useEffect } from "react";
import { Button, Checkbox, Form, Input, Typography } from "antd";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import "./index.scss";
import AuthServices from "../../../services/auth/api.service";
import { setAuthData } from "../../../redux/features/authSlice";
import { clearAllCookies, setCookie } from "../../../utils/cookie";

interface LoginForm {
  username: string;
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
      const res = await AuthServices.login(values);

      setCookie("token", res.accessToken);
      setCookie("refreshToken", res.refreshToken);
      dispatch(setAuthData(res));

      toast.success("Login successful!");
      setIsNavigating(true);
      console.log("Login successful:", res.userProfile.roleCode);

      // Redirect based on role
      if (res.userProfile.roleCode === "R1") {
        navigate("/admin");
      } else if (res.userProfile.roleCode === "R2") {
        navigate("/hr");
      } else if (res.userProfile.roleCode === "R3") {
        navigate("/manager");
      } else {
        navigate("/");
      }

      setTimeout(() => {
        setIsLoading(false);
        setIsNavigating(false);
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed!");
      setIsLoading(false);
      setIsNavigating(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-form">
          <Title level={1} className="login-title">
            Get Started Now
          </Title>
          <Text className="login-subtitle">
            Enter your credentials to access your account
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
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Enter your username"
                disabled={isLoading || isNavigating}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Enter your password"
                disabled={isLoading || isNavigating}
              />
            </Form.Item>

            <div className="login-links">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="login-checkbox">
                  I agree to the Terms & Privacy
                </Checkbox>
              </Form.Item>
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
                  ? "Logging in..."
                  : isNavigating
                  ? "Redirecting..."
                  : "Login"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
      <div className="login-right">
        <div className="fap-logo">
          FAP
          <br />
          Blockchain
        </div>
      </div>
    </div>
  );
};

export default Login;
