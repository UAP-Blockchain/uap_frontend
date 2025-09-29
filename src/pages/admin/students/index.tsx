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
  Avatar,
  Popconfirm,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BookOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Student, StudentFormData } from "../../../models/Student";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

const StudentsManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      studentCode: "SE170107",
      fullName: "Nguyễn Phi Hùng",
      email: "hungnpse170107@fpt.edu.com",
      phone: "0838858548",
      dateOfBirth: "2000-05-15",
      address: "TP. Hồ Chí Minh",
      classIds: ["1", "2"],
      enrollmentDate: "2021-09-01",
      status: "active",
      walletAddress: "0x742d35Cc6634C0532925a3b8D35e3b65F8b67d8d",
      gpa: 3.8,
      totalCredits: 120,
      major: "Software Engineering",
      year: 4,
      createdAt: "2021-09-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      studentCode: "SE170246",
      fullName: "Nguyễn Trung Nam",
      email: "namntse170246@fpt.edu.com",
      phone: "0944056171",
      dateOfBirth: "2000-03-22",
      address: "TP. Hồ Chí Minh",
      classIds: ["1", "3"],
      enrollmentDate: "2021-09-01",
      status: "active",
      walletAddress: "0x8ba1f109551bD432803012645Hac136c6b8a7b8d",
      gpa: 3.6,
      totalCredits: 115,
      major: "Software Engineering",
      year: 4,
      createdAt: "2021-09-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      studentCode: "SE170118",
      fullName: "Huỳnh Gia Bảo",
      email: "baohgse170118@fpt.edu.com",
      phone: "0933076153",
      dateOfBirth: "2000-08-10",
      address: "TP. Hồ Chí Minh",
      classIds: ["2", "3"],
      enrollmentDate: "2021-09-01",
      status: "active",
      walletAddress: "0x9cd2f109551bD432803012645Hac136c6b8a7c9e",
      gpa: 3.9,
      totalCredits: 125,
      major: "Information Systems",
      year: 4,
      createdAt: "2021-09-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      studentCode: "SE170117",
      fullName: "Nghiêm Văn Hoàng",
      email: "hoangnvse170117@fpt.edu.com",
      phone: "0989898408",
      dateOfBirth: "2000-12-05",
      address: "TP. Hồ Chí Minh",
      classIds: ["1", "2", "3"],
      enrollmentDate: "2021-09-01",
      status: "active",
      walletAddress: "0xabc3f109551bD432803012645Hac136c6b8a7d0f",
      gpa: 3.7,
      totalCredits: 118,
      major: "Software Engineering",
      year: 4,
      createdAt: "2021-09-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ]);

  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [majorFilter, setMajorFilter] = useState<string>("all");

  // Statistics
  const stats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    graduated: students.filter((s) => s.status === "graduated").length,
    avgGPA:
      students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length,
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterStudents(value, statusFilter, majorFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterStudents(searchText, value, majorFilter);
  };

  const handleMajorFilter = (value: string) => {
    setMajorFilter(value);
    filterStudents(searchText, statusFilter, value);
  };

  const filterStudents = (search: string, status: string, major: string) => {
    let filtered = students;

    if (search) {
      filtered = filtered.filter(
        (student) =>
          student.fullName.toLowerCase().includes(search.toLowerCase()) ||
          student.studentCode.toLowerCase().includes(search.toLowerCase()) ||
          student.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((student) => student.status === status);
    }

    if (major !== "all") {
      filtered = filtered.filter((student) => student.major === major);
    }

    setFilteredStudents(filtered);
  };

  const showModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      form.setFieldsValue({
        ...student,
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth)
          : undefined,
      });
    } else {
      setEditingStudent(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: StudentFormData) => {
      const studentData: Student = {
        id: editingStudent?.id || Date.now().toString(),
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString().split("T")[0],
        classIds: editingStudent?.classIds || [],
        enrollmentDate:
          editingStudent?.enrollmentDate ||
          new Date().toISOString().split("T")[0],
        walletAddress: editingStudent?.walletAddress,
        gpa: editingStudent?.gpa || 0,
        totalCredits: editingStudent?.totalCredits || 0,
        createdAt: editingStudent?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingStudent) {
        setStudents((prev) =>
          prev.map((s) => (s.id === editingStudent.id ? studentData : s))
        );
        message.success("Cập nhật sinh viên thành công!");
      } else {
        setStudents((prev) => [...prev, studentData]);
        message.success("Thêm sinh viên thành công!");
      }

      setIsModalVisible(false);
      filterStudents(searchText, statusFilter, majorFilter);
    });
  };

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    filterStudents(searchText, statusFilter, majorFilter);
    message.success("Xóa sinh viên thành công!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "graduated":
        return "blue";
      case "inactive":
        return "orange";
      case "suspended":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang học";
      case "graduated":
        return "Đã tốt nghiệp";
      case "inactive":
        return "Tạm nghỉ";
      case "suspended":
        return "Đình chỉ";
      default:
        return status;
    }
  };

  const columns: ColumnsType<Student> = [
    {
      title: "Sinh viên",
      key: "student",
      width: 250,
      render: (_, record) => (
        <div className="student-info">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            className="student-avatar"
          />
          <div className="student-details">
            <div className="student-name">{record.fullName}</div>
            <div className="student-code">{record.studentCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div className="contact-info">
          <div className="contact-item">
            <MailOutlined className="contact-icon" />
            <span>{record.email}</span>
          </div>
          <div className="contact-item">
            <PhoneOutlined className="contact-icon" />
            <span>{record.phone}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Chuyên ngành",
      dataIndex: "major",
      key: "major",
      width: 150,
      render: (major) => (
        <Tag color="blue" icon={<BookOutlined />}>
          {major}
        </Tag>
      ),
    },
    {
      title: "Năm học",
      dataIndex: "year",
      key: "year",
      width: 80,
      align: "center",
    },
    {
      title: "GPA",
      dataIndex: "gpa",
      key: "gpa",
      width: 80,
      align: "center",
      render: (gpa) => (
        <span
          className={`gpa ${
            gpa >= 3.5 ? "excellent" : gpa >= 3.0 ? "good" : "average"
          }`}
        >
          {gpa?.toFixed(1)}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày nhập học",
      dataIndex: "enrollmentDate",
      key: "enrollmentDate",
      width: 120,
      render: (date) => (
        <div className="enrollment-date">
          <CalendarOutlined className="date-icon" />
          {new Date(date).toLocaleDateString("vi-VN")}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sinh viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="students-management">
      <div className="page-header">
        <h1>Quản lý Sinh viên</h1>
        <p>Quản lý thông tin sinh viên trong hệ thống blockchain</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng sinh viên"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang học"
              value={stats.active}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã tốt nghiệp"
              value={stats.graduated}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="GPA trung bình"
              value={stats.avgGPA.toFixed(2)}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="students-table-card">
        <div className="table-header">
          <div className="filters">
            <Search
              placeholder="Tìm kiếm theo tên, mã số, email..."
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
              <Option value="active">Đang học</Option>
              <Option value="graduated">Đã tốt nghiệp</Option>
              <Option value="inactive">Tạm nghỉ</Option>
              <Option value="suspended">Đình chỉ</Option>
            </Select>
            <Select
              placeholder="Chuyên ngành"
              style={{ width: 180 }}
              value={majorFilter}
              onChange={handleMajorFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả</Option>
              <Option value="Software Engineering">Software Engineering</Option>
              <Option value="Information Systems">Information Systems</Option>
              <Option value="Computer Science">Computer Science</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Thêm sinh viên
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sinh viên`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title={editingStudent ? "Chỉnh sửa sinh viên" : "Thêm sinh viên mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingStudent ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "active", year: 1 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentCode"
                label="Mã sinh viên"
                rules={[
                  { required: true, message: "Vui lòng nhập mã sinh viên!" },
                ]}
              >
                <Input placeholder="Nhập mã sinh viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker
                  placeholder="Chọn ngày sinh"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="major"
                label="Chuyên ngành"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên ngành!" },
                ]}
              >
                <Select placeholder="Chọn chuyên ngành">
                  <Option value="Software Engineering">
                    Software Engineering
                  </Option>
                  <Option value="Information Systems">
                    Information Systems
                  </Option>
                  <Option value="Computer Science">Computer Science</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="year"
                label="Năm học"
                rules={[{ required: true, message: "Vui lòng chọn năm học!" }]}
              >
                <Select placeholder="Chọn năm học">
                  <Option value={1}>Năm 1</Option>
                  <Option value={2}>Năm 2</Option>
                  <Option value={3}>Năm 3</Option>
                  <Option value={4}>Năm 4</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Đang học</Option>
                  <Option value="inactive">Tạm nghỉ</Option>
                  <Option value="graduated">Đã tốt nghiệp</Option>
                  <Option value="suspended">Đình chỉ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea placeholder="Nhập địa chỉ" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentsManagement;
