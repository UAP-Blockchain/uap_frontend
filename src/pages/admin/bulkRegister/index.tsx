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
  DatePicker,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
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
// Ant Design v5: use Tabs items and Select options API

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
      if (values.phoneNumber) newUser.phoneNumber = values.phoneNumber;
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
    const hideLoading = message.loading(
      `Registering ${users.length} users... This may take a moment.`,
      0
    );
    
    try {
      // Remove 'key' field before sending to API
      const request = {
        users: users.map(({ key, ...user }) => user),
      };
      
      console.log("Bulk Register Request (sanitized):", request);
      
      // Retry logic for timeout errors
      let retries = 2;
      let lastError: any;
      
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (attempt > 0) {
            message.info(`Retry attempt ${attempt}/${retries}...`);
          }
          
          const response = await AuthServices.bulkRegister(request);
          console.log("Bulk Register Response:", response);
          
          // Enrich results with all fields from original users list
          const enrichedResults = response.results.map((result: RegisterUserResponse) => {
            const originalUser = users.find(u => u.email === result.email);
            return {
              ...result,
              fullName: originalUser?.fullName || result.fullName,
              phoneNumber: originalUser?.phoneNumber || result.phoneNumber,
              studentCode: originalUser?.studentCode || result.studentCode,
              teacherCode: originalUser?.teacherCode || result.teacherCode,
              enrollmentDate: originalUser?.enrollmentDate || result.enrollmentDate,
              hireDate: originalUser?.hireDate || result.hireDate,
              specialization: originalUser?.specialization || result.specialization,
            };
          });
          
          setResult({
            ...response,
            results: enrichedResults,
          });
          hideLoading();

          if (response.statistics.success > 0) {
            toast.success(
              `Successfully registered ${response.statistics.success}/${response.statistics.total} users!`
            );
          }
          if (response.statistics.failed > 0) {
            toast.warning(`${response.statistics.failed} users failed to register!`);
          }
          return; // Success, exit function
        } catch (err: any) {
          lastError = err;
          
          // Check if it's a timeout error
          const isTimeout = 
            err.code === 'ECONNABORTED' || 
            err.message?.includes('timeout') ||
            err.message?.includes('exceeded');
          
          // If not timeout or last attempt, throw error
          if (!isTimeout || attempt === retries) {
            throw err;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
      
      // If we get here, all retries failed
      throw lastError;
    } catch (error: any) {
      hideLoading();
      console.error("Bulk Register Error:", error);
      console.error("Error Response:", error.response?.data);
      
      // Check if it's a timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error(
          `Request timeout. The server is taking too long to process ${users.length} users. ` +
          "Try registering fewer users at a time (e.g., 10-20 users per batch)."
        );
      } 
      // Check if we have error response with results (partial or full failure)
      else if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle both new format (statistics) and old format (successCount/failureCount)
        const stats = errorData.statistics || {
          total: errorData.totalRequested || 0,
          success: errorData.successCount || 0,
          failed: errorData.failureCount || 0,
        };
        
        // Enrich error results with all fields from original users list
        const enrichedResults = (errorData.results || []).map((result: RegisterUserResponse) => {
          const originalUser = users.find(u => u.email === result.email);
          return {
            ...result,
            fullName: originalUser?.fullName || result.fullName,
            phoneNumber: originalUser?.phoneNumber || result.phoneNumber,
            studentCode: originalUser?.studentCode || result.studentCode,
            teacherCode: originalUser?.teacherCode || result.teacherCode,
            enrollmentDate: originalUser?.enrollmentDate || result.enrollmentDate,
            hireDate: originalUser?.hireDate || result.hireDate,
            specialization: originalUser?.specialization || result.specialization,
          };
        });
        
        // Transform the response to match expected format
        const transformedResult: BulkRegisterResponse = {
          success: errorData.success !== false, // Keep success flag if exists
          message: errorData.message || 'Registration completed with errors',
          statistics: stats,
          results: enrichedResults,
        };
        
        setResult(transformedResult);
        
        // Show appropriate toast message
        if (stats.success > 0 && stats.failed > 0) {
          toast.warning(
            `Partially completed: ${stats.success}/${stats.total} users registered successfully. ` +
            `${stats.failed} failed. Check results table for details.`
          );
        } else if (stats.failed > 0) {
          toast.error(
            `All ${stats.failed} user(s) failed to register. Check results table for details.`
          );
        } else {
          toast.error(errorData.message || 'Registration failed');
        }
      }
      // Generic error without response data
      else {
        const errorMessage = error.message || "Failed to register users. Please try again!";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 100,
      render: (role: string) => (
        <Tag color={role === "Student" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    {
      title: "Code",
      key: "code",
      width: 100,
      render: (_: any, record: UserFormData) => (
        <span>{record.studentCode || record.teacherCode || '-'}</span>
      ),
    },
    {
      title: "Date",
      key: "date",
      width: 120,
      render: (_: any, record: UserFormData) => {
        const date = record.enrollmentDate || record.hireDate;
        return date ? dayjs(date).format('YYYY-MM-DD') : '-';
      },
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      fixed: 'right' as const,
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
      width: 200,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: "Role",
      dataIndex: "roleName",
      key: "roleName",
      width: 100,
    },
    {
      title: "Code",
      key: "code",
      width: 100,
      render: (_: any, record: RegisterUserResponse) => (
        <span>{record.studentCode || record.teacherCode || '-'}</span>
      ),
    },
    {
      title: "Date",
      key: "date",
      width: 120,
      render: (_: any, record: RegisterUserResponse) => {
        const date = record.enrollmentDate || record.hireDate;
        return date ? dayjs(date).format('YYYY-MM-DD') : '-';
      },
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: "Status",
      key: "status",
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: RegisterUserResponse) => (
        <Tag color={record.success ? "success" : "error"}>
          {record.success ? "Success" : "Failed"}
        </Tag>
      ),
    },
    {
      title: "Message",
      key: "message",
      width: 250,
      fixed: 'right' as const,
      render: (_: any, record: RegisterUserResponse) => {
        // Combine message and errors array
        const messages: string[] = [];
        
        if (record.message) {
          messages.push(record.message);
        }
        
        if (record.errors && Array.isArray(record.errors) && record.errors.length > 0) {
          messages.push(...record.errors);
        }
        
        return (
          <div>
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: index < messages.length - 1 ? 4 : 0 }}>
                {record.success ? (
                  <Text>{msg}</Text>
                ) : (
                  <Text type="danger">{msg}</Text>
                )}
              </div>
            ))}
          </div>
        );
      },
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

        <Tabs
          defaultActiveKey="manual"
          items={[
            {
              key: "manual",
              label: "Manual Input",
              children: (
                <>
                  <Form
                    form={form}
                    onFinish={handleAddUser}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      label="Role"
                      name="roleName"
                      rules={[
                        { required: true, message: "Please select a role!" },
                      ]}
                    >
                      <Select
                        placeholder="Select role"
                        options={[
                          { label: "Student", value: "Student" },
                          { label: "Teacher", value: "Teacher" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Full Name"
                      name="fullName"
                      rules={[
                        { required: true, message: "Please enter full name!" },
                      ]}
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

                    {/* Conditional fields based on role */}
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const role = getFieldValue("roleName");
                        if (role === "Student") {
                          return (
                            <>
                              <Form.Item label="Student Code" name="studentCode">
                                <Input placeholder="Enter student code" />
                              </Form.Item>
                              <Form.Item label="Enrollment Date" name="enrollmentDate">
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item label="Phone Number" name="phoneNumber">
                                <Input placeholder="Enter phone number" />
                              </Form.Item>
                            </>
                          );
                        }
                        if (role === "Teacher") {
                          return (
                            <>
                              <Form.Item label="Teacher Code" name="teacherCode">
                                <Input placeholder="Enter teacher code" />
                              </Form.Item>
                              <Form.Item label="Hire Date" name="hireDate">
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item label="Specialization" name="specialization">
                                <Input placeholder="e.g., Computer Science" />
                              </Form.Item>
                              <Form.Item label="Phone Number" name="phoneNumber">
                                <Input placeholder="Enter phone number" />
                              </Form.Item>
                            </>
                          );
                        }
                        return null;
                      }}
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
                    rowKey={(r) => r.key!}
                    scroll={{ x: 1200 }}
                  />

                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {users.length > 0 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setUsers([]);
                          message.success('Cleared all users from list');
                        }}
                        block
                      >
                        Remove All
                      </Button>
                    )}
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
                </>
              ),
            },
            {
              key: "upload",
              label: "Upload File",
              children: (
                <>
                  <Alert
                    message="Upload CSV/Excel File"
                    description="Upload a CSV or Excel file containing user information. The file should have columns: Email, Full Name, Password, Role (Student/Teacher), and optional fields based on role."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  <Card style={{ marginBottom: 16 }}>
                    <Title level={5}>File Format Requirements:</Title>
                    <ul>
                      <li><strong>Required columns:</strong> Email, FullName, Password, Role</li>
                      <li><strong>Student optional columns:</strong> StudentCode, EnrollmentDate</li>
                      <li><strong>Teacher optional columns:</strong> TeacherCode, HireDate, Specialization, PhoneNumber</li>
                      <li><strong>Role values:</strong> "Student" or "Teacher"</li>
                      <li><strong>Date formats supported:</strong> YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY (e.g., 2024-01-15, 1/15/2024, 15-01-2024)</li>
                      <li><strong>Phone formats supported:</strong> Any format will work - 0944056171, +84944056171, 84944056171 (spaces and dashes will be removed)</li>
                    </ul>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <Button 
                        type="link" 
                        onClick={() => {
                          // Download sample CSV template
                          const csvContent = "Email,FullName,Password,Role,StudentCode,EnrollmentDate,TeacherCode,HireDate,Specialization,PhoneNumber\n" +
                            "student1@example.com,John Doe,password123,Student,SE001,2024-01-15,,,\n" +
                            "teacher1@example.com,Jane Smith,password123,Teacher,,,TE001,2024-01-15,Computer Science,0123456789";
                          const blob = new Blob([csvContent], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'bulk_register_template.csv';
                          a.click();
                          window.URL.revokeObjectURL(url);
                          message.success('CSV Template downloaded!');
                        }}
                      >
                        Download CSV Template
                      </Button>
                      <Button 
                        type="link" 
                        onClick={() => {
                          // Create Excel template
                          const wb = XLSX.utils.book_new();
                          
                          // Create header and sample data
                          const wsData = [
                            ['Email', 'FullName', 'Password', 'Role', 'StudentCode', 'EnrollmentDate', 'TeacherCode', 'HireDate', 'Specialization', 'PhoneNumber'],
                            ['student1@example.com', 'John Doe', 'password123', 'Student', 'SE001', '2024-01-15', '', '', '', '0944056171'],
                            ['teacher1@example.com', 'Jane Smith', 'password123', 'Teacher', '', '', 'TE001', '2024-01-15', 'Computer Science', '0944036171']
                          ];
                          
                          const ws = XLSX.utils.aoa_to_sheet(wsData);
                          
                          // Set column widths
                          ws['!cols'] = [
                            { wch: 25 }, // Email
                            { wch: 20 }, // FullName
                            { wch: 15 }, // Password
                            { wch: 10 }, // Role
                            { wch: 12 }, // StudentCode
                            { wch: 15 }, // EnrollmentDate
                            { wch: 12 }, // TeacherCode
                            { wch: 15 }, // HireDate
                            { wch: 20 }, // Specialization
                            { wch: 15 }  // PhoneNumber
                          ];
                          
                          XLSX.utils.book_append_sheet(wb, ws, 'Users');
                          
                          // Generate Excel file
                          XLSX.writeFile(wb, 'bulk_register_template.xlsx');
                          message.success('Excel Template downloaded!');
                        }}
                      >
                        Download Excel Template
                      </Button>
                    </div>
                  </Card>

                  <Upload.Dragger
                    name="file"
                    accept=".csv,.xlsx,.xls"
                    maxCount={1}
                    beforeUpload={(file) => {
                      const isValidType = 
                        file.type === 'text/csv' || 
                        file.type === 'application/vnd.ms-excel' ||
                        file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                      
                      if (!isValidType) {
                        message.error('Please upload a CSV or Excel file!');
                        return Upload.LIST_IGNORE;
                      }

                      const reader = new FileReader();
                      
                      // Check if file is Excel or CSV
                      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
                      
                      if (isExcel) {
                        // Handle Excel files
                        reader.onload = (e) => {
                          try {
                            const data = new Uint8Array(e.target?.result as ArrayBuffer);
                            const workbook = XLSX.read(data, { type: 'array' });
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                              header: 1,
                              raw: false,
                              dateNF: 'yyyy-mm-dd'
                            }) as any[][];
                            
                            const headers = jsonData[0] as string[];
                            const importedUsers: UserFormData[] = [];
                            
                            for (let i = 1; i < jsonData.length; i++) {
                              const row = jsonData[i];
                              if (!row || row.length === 0) continue;
                              
                              const user: any = {};
                              headers.forEach((header, index) => {
                                if (row[index] !== undefined && row[index] !== null && row[index] !== '') {
                                  user[header.trim()] = row[index];
                                }
                              });

                              if (user.Email && user.FullName && user.Password && user.Role) {
                                const newUser: UserFormData = {
                                  email: String(user.Email).trim(),
                                  fullName: String(user.FullName).trim(),
                                  password: String(user.Password).trim(),
                                  roleName: String(user.Role).trim() as "Student" | "Teacher",
                                  key: `user-${Date.now()}-${Math.random()}-${i}`,
                                };

                                if (user.Role === "Student") {
                                  if (user.StudentCode) newUser.studentCode = String(user.StudentCode).trim();
                                  if (user.EnrollmentDate) {
                                    const dateValue = user.EnrollmentDate;
                                    let parsedDate: Date | null = null;
                                    
                                    // Check if it's a number (Excel serial date)
                                    if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
                                      // Excel date: days since 1900-01-01 (with 1900 leap year bug)
                                      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                                      parsedDate = new Date(excelEpoch.getTime() + Number(dateValue) * 86400000);
                                    } else {
                                      // String date formats
                                      const dateStr = String(dateValue).trim();
                                      
                                      if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                                        parsedDate = new Date(dateStr);
                                      } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                                        parsedDate = new Date(dateStr);
                                      } else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                                        const parts = dateStr.split('-');
                                        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                      }
                                    }
                                    
                                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                                      newUser.enrollmentDate = parsedDate.toISOString();
                                    }
                                  }
                                  // Handle phone number for Student too
                                  if (user.PhoneNumber) {
                                    let phone = String(user.PhoneNumber).trim();
                                    
                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }
                                    
                                    if (phone.includes('E') || phone.includes('e')) {
                                      phone = Number(phone).toFixed(0);
                                    }
                                    
                                    phone = phone.replace(/[\s\-()]/g, '');
                                    phone = phone.replace(/[^\d+]/g, '');
                                    
                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                } else if (user.Role === "Teacher") {
                                  if (user.TeacherCode) newUser.teacherCode = String(user.TeacherCode).trim();
                                  if (user.HireDate) {
                                    const dateValue = user.HireDate;
                                    let parsedDate: Date | null = null;
                                    
                                    // Check if it's a number (Excel serial date)
                                    if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
                                      // Excel date: days since 1900-01-01 (with 1900 leap year bug)
                                      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                                      parsedDate = new Date(excelEpoch.getTime() + Number(dateValue) * 86400000);
                                    } else {
                                      // String date formats
                                      const dateStr = String(dateValue).trim();
                                      
                                      if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                                        parsedDate = new Date(dateStr);
                                      } else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                                        parsedDate = new Date(dateStr);
                                      } else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                                        const parts = dateStr.split('-');
                                        parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                      }
                                    }
                                    
                                    if (parsedDate && !isNaN(parsedDate.getTime())) {
                                      newUser.hireDate = parsedDate.toISOString();
                                    }
                                  }
                                  if (user.Specialization) newUser.specialization = String(user.Specialization).trim();
                                  if (user.PhoneNumber) {
                                    let phone = String(user.PhoneNumber).trim();
                                    
                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }
                                    
                                    if (phone.includes('E') || phone.includes('e')) {
                                      phone = Number(phone).toFixed(0);
                                    }
                                    
                                    phone = phone.replace(/[\s\-()]/g, '');
                                    phone = phone.replace(/[^\d+]/g, '');
                                    
                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                }

                                importedUsers.push(newUser);
                              }
                            }

                            if (importedUsers.length > 0) {
                              setUsers([...users, ...importedUsers]);
                              message.success(`Successfully imported ${importedUsers.length} users from Excel!`);
                            } else {
                              message.warning('No valid users found in the Excel file!');
                            }
                          } catch (error) {
                            message.error('Failed to parse Excel file. Please check the format!');
                            console.error('Excel parse error:', error);
                          }
                        };
                        
                        reader.readAsArrayBuffer(file);
                      } else {
                        // Handle CSV files
                        reader.onload = (e) => {
                          try {
                            const text = e.target?.result as string;
                            const lines = text.split('\n');
                            const headers = lines[0].split(',').map(h => h.trim());
                            
                            const importedUsers: UserFormData[] = [];
                          
                          for (let i = 1; i < lines.length; i++) {
                            if (!lines[i].trim()) continue;
                            
                            const values = lines[i].split(',').map(v => v.trim());
                            const user: any = {};
                            
                            headers.forEach((header, index) => {
                              if (values[index]) {
                                user[header] = values[index];
                              }
                            });

                            if (user.Email && user.FullName && user.Password && user.Role) {
                              const newUser: UserFormData = {
                                email: user.Email,
                                fullName: user.FullName,
                                password: user.Password,
                                roleName: user.Role as "Student" | "Teacher",
                                key: `user-${Date.now()}-${Math.random()}-${i}`,
                              };

                              if (user.Role === "Student") {
                                if (user.StudentCode) newUser.studentCode = user.StudentCode;
                                if (user.EnrollmentDate) {
                                  // Handle multiple date formats
                                  const dateStr = String(user.EnrollmentDate).trim();
                                  let parsedDate: Date | null = null;
                                  
                                  // Try YYYY-MM-DD format
                                  if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                                    parsedDate = new Date(dateStr);
                                  }
                                  // Try MM/DD/YYYY or M/D/YYYY format
                                  else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                                    parsedDate = new Date(dateStr);
                                  }
                                  // Try DD-MM-YYYY format
                                  else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                                    const parts = dateStr.split('-');
                                    parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                  }
                                  
                                  if (parsedDate && !isNaN(parsedDate.getTime())) {
                                    newUser.enrollmentDate = parsedDate.toISOString();
                                  }
                                }
                                // Handle phone number for Student
                                if (user.PhoneNumber) {
                                  let phone = String(user.PhoneNumber).trim();
                                  
                                  if (phone.startsWith("'")) {
                                    phone = phone.substring(1);
                                  }
                                  
                                  if (phone.includes('E') || phone.includes('e')) {
                                    phone = Number(phone).toFixed(0);
                                  }
                                  
                                  phone = phone.replace(/[\s\-()]/g, '');
                                  phone = phone.replace(/[^\d+]/g, '');
                                  
                                  if (phone.length >= 10) {
                                    newUser.phoneNumber = phone;
                                  }
                                }
                              } else if (user.Role === "Teacher") {
                                if (user.TeacherCode) newUser.teacherCode = user.TeacherCode;
                                if (user.HireDate) {
                                  // Handle multiple date formats
                                  const dateStr = String(user.HireDate).trim();
                                  let parsedDate: Date | null = null;
                                  
                                  if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                                    parsedDate = new Date(dateStr);
                                  }
                                  else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                                    parsedDate = new Date(dateStr);
                                  }
                                  else if (dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                                    const parts = dateStr.split('-');
                                    parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                                  }
                                  
                                  if (parsedDate && !isNaN(parsedDate.getTime())) {
                                    newUser.hireDate = parsedDate.toISOString();
                                  }
                                }
                                if (user.Specialization) newUser.specialization = user.Specialization;
                                if (user.PhoneNumber) {
                                  // Clean phone number
                                  let phone = String(user.PhoneNumber).trim();
                                  
                                  // Remove leading apostrophe if exists (Excel text format marker)
                                  if (phone.startsWith("'")) {
                                    phone = phone.substring(1);
                                  }
                                  
                                  // Handle scientific notation (e.g., 8.4123456789E+10)
                                  if (phone.includes('E') || phone.includes('e')) {
                                    phone = Number(phone).toFixed(0);
                                  }
                                  
                                  // Remove all spaces, dashes, parentheses
                                  phone = phone.replace(/[\s\-()]/g, '');
                                  
                                  // Keep only digits and leading +
                                  phone = phone.replace(/[^\d+]/g, '');
                                  
                                  // Save as-is if valid length
                                  if (phone.length >= 10) {
                                    newUser.phoneNumber = phone;
                                  }
                                }
                              }

                              importedUsers.push(newUser);
                            }
                          }

                          if (importedUsers.length > 0) {
                            setUsers([...users, ...importedUsers]);
                            message.success(`Successfully imported ${importedUsers.length} users!`);
                          } else {
                            message.warning('No valid users found in the file!');
                          }
                        } catch (error) {
                          message.error('Failed to parse file. Please check the format!');
                          console.error('CSV parse error:', error);
                        }
                      };

                        reader.readAsText(file);
                      }
                      
                      return false; // Prevent auto upload
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <SaveOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Click or drag CSV/Excel file to this area</p>
                    <p className="ant-upload-hint">
                      Support for CSV (.csv) and Excel (.xlsx, .xls) files. 
                      The file will be parsed and users will be added to the list below.
                    </p>
                  </Upload.Dragger>

                  <Divider>Imported User List ({users.length})</Divider>

                  <Table
                    dataSource={users}
                    columns={userColumns}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    rowKey={(r) => r.key!}
                    scroll={{ x: 1200 }}
                  />

                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {users.length > 0 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setUsers([]);
                          message.success('Cleared all users from list');
                        }}
                        block
                      >
                        Remove All
                      </Button>
                    )}
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
                </>
              ),
            },
          ]}
        />

        {result && (
          <div style={{ marginTop: 24 }}>
            <Divider>Results</Divider>
            <Alert
              message={`Total: ${result.statistics.total} | Success: ${result.statistics.success} | Failed: ${result.statistics.failed}`}
              type={result.statistics.failed === 0 ? "success" : "warning"}
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={result.results}
              columns={resultColumns}
              pagination={{ pageSize: 10 }}
              rowKey={(record, index) => `${record.email}-${index}`}
              scroll={{ x: 1350 }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BulkRegister;
