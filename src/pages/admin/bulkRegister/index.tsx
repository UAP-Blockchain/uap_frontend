import {
  DeleteOutlined,
  SaveOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Result,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRoleAccess } from "../../../hooks/useRoleAccess";
import type { RootState } from "../../../redux/store";
import AuthServices from "../../../services/auth/api.service";
import type {
  BulkRegisterResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from "../../../types/Auth";
import "./index.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface UserFormData extends RegisterUserRequest {
  key?: string;
}

const BulkRegister: React.FC = () => {
  const [users, setUsers] = useState<UserFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkRegisterResponse | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isAdmin, userProfile } = useRoleAccess();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Check authentication and admin role on mount
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      toast.error("Please login to access this page");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (!isAdmin()) {
      toast.error("Only Admin users can bulk register users");
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 2000);
    }
  }, [isAuthenticated, accessToken, isAdmin, navigate]);

  const handleAddUser = (values: any) => {
    const newUser: UserFormData = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      roleName: values.roleName as "Student" | "Teacher",
      key: `user-${Date.now()}-${Math.random()}`,
    };

    if (values.roleName === "Student") {
      if (values.studentCode) newUser.studentCode = values.studentCode;
      if (values.enrollmentDate) {
        newUser.enrollmentDate = dayjs(values.enrollmentDate).toISOString();
      }
    } else if (values.roleName === "Teacher") {
      if (values.teacherCode) newUser.teacherCode = values.teacherCode;
      if (values.hireDate) {
        newUser.hireDate = dayjs(values.hireDate).toISOString();
      }
      if (values.specialization) newUser.specialization = values.specialization;
      if (values.phoneNumber) newUser.phoneNumber = values.phoneNumber;
    }

    setUsers([...users, newUser]);
    form.resetFields();
    message.success("User added to list!");
  };

  const handleRemoveUser = (key: string) => {
    setUsers(users.filter((u) => u.key !== key));
  };

  const handleBulkRegister = async () => {
    if (users.length === 0) {
      message.warning("Please add at least one user!");
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        users: users.map(({ key, ...user }) => user),
      };

      const response = await AuthServices.bulkRegister(request);
      setResult(response);

      if (response.successCount > 0) {
        toast.success(
          `Successfully registered ${response.successCount}/${response.totalRequested} users!`
        );
      }
      if (response.failureCount > 0) {
        toast.warning(`${response.failureCount} users failed to register!`);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to register users. Please try again!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const userColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      render: (role: string) => (
        <Tag color={role === "Student" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: UserFormData) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveUser(record.key!)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const resultColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: RegisterUserResponse) => (
        <Tag color={record.success ? "success" : "error"}>
          {record.success ? "Success" : "Failed"}
        </Tag>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
    },
  ];

  // Show error if not authenticated
  if (!isAuthenticated || !accessToken) {
    return (
      <div className="bulk-register-container">
        <Card>
          <Result
            status="403"
            title="Authentication Required"
            subTitle="Please login to access this page"
            extra={
              <Button type="primary" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Show error if not admin
  if (!isAdmin()) {
    return (
      <div className="bulk-register-container">
        <Card>
          <Result
            status="403"
            title="Access Denied"
            subTitle="Only Admin users can bulk register users"
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="bulk-register-container">
      <Card>
        <div className="bulk-register-header">
          <Title level={2}>
            <UserAddOutlined /> Bulk Register Users
          </Title>
        </div>

        <Alert
          message="Admin Only"
          description={`You are logged in as ${userProfile?.fullName} (${userProfile?.role}). Only Admin users can bulk register users.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Tabs defaultActiveKey="manual">
          <TabPane tab="Manual Input" key="manual">
            <Form
              form={form}
              onFinish={handleAddUser}
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="Role"
                name="roleName"
                rules={[{ required: true, message: "Please select a role!" }]}
              >
                <Select placeholder="Select role">
                  <Option value="Student">Student</Option>
                  <Option value="Teacher">Teacher</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Please enter full name!" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email!" },
                  { type: "email", message: "Invalid email format!" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button type="dashed" htmlType="submit" block>
                  Add to List
                </Button>
              </Form.Item>
            </Form>

            <Divider>User List ({users.length})</Divider>

            <Table
              dataSource={users}
              columns={userColumns}
              pagination={false}
              size="small"
            />

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleBulkRegister}
                loading={isLoading}
                disabled={users.length === 0}
                block
                size="large"
              >
                Register All ({users.length} users)
              </Button>
            </div>
          </TabPane>

          <TabPane tab="Upload File" key="upload" disabled>
            <Alert
              message="File upload feature is under development"
              type="info"
            />
          </TabPane>
        </Tabs>

        {result && (
          <div style={{ marginTop: 24 }}>
            <Divider>Results</Divider>
            <Alert
              message={`Total: ${result.totalRequested} | Success: ${result.successCount} | Failed: ${result.failureCount}`}
              type={result.failureCount === 0 ? "success" : "warning"}
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={result.results}
              columns={resultColumns}
              pagination={{ pageSize: 10 }}
              rowKey={(record, index) => `${record.email}-${index}`}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BulkRegister;
