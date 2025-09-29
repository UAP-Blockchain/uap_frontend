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
  Badge,
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
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Teacher, TeacherFormData } from "../../../models/Teacher";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

const TeachersManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: "1",
      teacherCode: "T001",
      fullName: "Nguyễn Ngọc Lâm",
      email: "lamnn15@fpt.edu.vn",
      phone: "0901234567",
      dateOfBirth: "1985-03-15",
      address: "TP. Hồ Chí Minh",
      department: "Công nghệ thông tin",
      position: "Giảng viên chính",
      title: "Mr",
      specialization: ["Blockchain", "Smart Contract", "Cryptocurrency"],
      classIds: ["1", "2"],
      hireDate: "2015-09-01",
      status: "active",
      walletAddress: "0x123d35Cc6634C0532925a3b8D35e3b65F8b67abc",
      yearsOfExperience: 12,
      qualifications: ["PhD Computer Science", "Blockchain Expert Certificate"],
      createdAt: "2015-09-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      teacherCode: "T002",
      fullName: "Trần Văn An",
      email: "antv@fpt.edu.vn",
      phone: "0912345678",
      dateOfBirth: "1982-07-22",
      address: "TP. Hồ Chí Minh",
      department: "Công nghệ thông tin",
      position: "Giảng viên cao cấp",
      title: "Dr",
      specialization: ["Software Engineering", "Web Development", "Database"],
      classIds: ["3", "4"],
      hireDate: "2012-02-01",
      status: "active",
      walletAddress: "0x456d35Cc6634C0532925a3b8D35e3b65F8b67def",
      yearsOfExperience: 15,
      qualifications: [
        "PhD Software Engineering",
        "AWS Certified Solutions Architect",
      ],
      createdAt: "2012-02-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      teacherCode: "T003",
      fullName: "Lê Thị Bình",
      email: "binhlt@fpt.edu.vn",
      phone: "0923456789",
      dateOfBirth: "1988-11-10",
      address: "TP. Hồ Chí Minh",
      department: "Kinh tế",
      position: "Giảng viên",
      title: "Ms",
      specialization: ["Economics", "Cryptocurrency", "Financial Technology"],
      classIds: ["5"],
      hireDate: "2018-08-15",
      status: "active",
      walletAddress: "0x789d35Cc6634C0532925a3b8D35e3b65F8b67ghi",
      yearsOfExperience: 8,
      qualifications: ["Master Economics", "CFA Certificate"],
      createdAt: "2018-08-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      teacherCode: "T004",
      fullName: "Phạm Minh Đức",
      email: "ducpm@fpt.edu.vn",
      phone: "0934567890",
      dateOfBirth: "1980-05-25",
      address: "TP. Hồ Chí Minh",
      department: "Công nghệ thông tin",
      position: "Trưởng khoa",
      title: "Prof",
      specialization: [
        "Distributed Systems",
        "Network Security",
        "Cloud Computing",
      ],
      classIds: ["6", "7", "8"],
      hireDate: "2010-01-01",
      status: "active",
      walletAddress: "0xabcd35Cc6634C0532925a3b8D35e3b65F8b67jkl",
      yearsOfExperience: 18,
      qualifications: [
        "PhD Computer Science",
        "CISSP Certificate",
        "Google Cloud Architect",
      ],
      createdAt: "2010-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
  ]);

  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(teachers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Statistics
  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === "active").length,
    retired: teachers.filter((t) => t.status === "retired").length,
    avgExperience:
      teachers.reduce((sum, t) => sum + (t.yearsOfExperience || 0), 0) /
      teachers.length,
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterTeachers(value, statusFilter, departmentFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterTeachers(searchText, value, departmentFilter);
  };

  const handleDepartmentFilter = (value: string) => {
    setDepartmentFilter(value);
    filterTeachers(searchText, statusFilter, value);
  };

  const filterTeachers = (
    search: string,
    status: string,
    department: string
  ) => {
    let filtered = teachers;

    if (search) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.fullName.toLowerCase().includes(search.toLowerCase()) ||
          teacher.teacherCode.toLowerCase().includes(search.toLowerCase()) ||
          teacher.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((teacher) => teacher.status === status);
    }

    if (department !== "all") {
      filtered = filtered.filter(
        (teacher) => teacher.department === department
      );
    }

    setFilteredTeachers(filtered);
  };

  const showModal = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      form.setFieldsValue({
        ...teacher,
        dateOfBirth: teacher.dateOfBirth
          ? new Date(teacher.dateOfBirth)
          : undefined,
      });
    } else {
      setEditingTeacher(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: TeacherFormData) => {
      const teacherData: Teacher = {
        id: editingTeacher?.id || Date.now().toString(),
        ...values,
        dateOfBirth: values.dateOfBirth?.toISOString().split("T")[0],
        classIds: editingTeacher?.classIds || [],
        hireDate:
          editingTeacher?.hireDate || new Date().toISOString().split("T")[0],
        walletAddress: editingTeacher?.walletAddress,
        yearsOfExperience: editingTeacher?.yearsOfExperience || 0,
        createdAt: editingTeacher?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingTeacher) {
        setTeachers((prev) =>
          prev.map((t) => (t.id === editingTeacher.id ? teacherData : t))
        );
        message.success("Cập nhật giảng viên thành công!");
      } else {
        setTeachers((prev) => [...prev, teacherData]);
        message.success("Thêm giảng viên thành công!");
      }

      setIsModalVisible(false);
      filterTeachers(searchText, statusFilter, departmentFilter);
    });
  };

  const handleDelete = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    filterTeachers(searchText, statusFilter, departmentFilter);
    message.success("Xóa giảng viên thành công!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "orange";
      case "retired":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang công tác";
      case "inactive":
        return "Tạm nghỉ";
      case "retired":
        return "Đã nghỉ hưu";
      default:
        return status;
    }
  };

  const getTitleColor = (title: string) => {
    switch (title) {
      case "Prof":
        return "red";
      case "Dr":
        return "purple";
      case "Mr":
        return "blue";
      case "Mrs":
        return "blue";
      case "Ms":
        return "blue";
      default:
        return "default";
    }
  };

  const columns: ColumnsType<Teacher> = [
    {
      title: "Giảng viên",
      key: "teacher",
      width: 280,
      render: (_, record) => (
        <div className="teacher-info">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            className="teacher-avatar"
          />
          <div className="teacher-details">
            <div className="teacher-name">
              <Tag color={getTitleColor(record.title)} size="small">
                {record.title}
              </Tag>
              {record.fullName}
            </div>
            <div className="teacher-code">{record.teacherCode}</div>
            <div className="teacher-position">{record.position}</div>
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
      title: "Khoa/Bộ môn",
      dataIndex: "department",
      key: "department",
      width: 150,
      render: (department) => (
        <Tag color="cyan" icon={<BookOutlined />}>
          {department}
        </Tag>
      ),
    },
    {
      title: "Chuyên môn",
      dataIndex: "specialization",
      key: "specialization",
      width: 200,
      render: (specialization: string[]) => (
        <div className="specialization-tags">
          {specialization.slice(0, 2).map((spec, index) => (
            <Tag key={index} color="geekblue" size="small">
              {spec}
            </Tag>
          ))}
          {specialization.length > 2 && (
            <Tag color="default" size="small">
              +{specialization.length - 2}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "yearsOfExperience",
      key: "yearsOfExperience",
      width: 100,
      align: "center",
      render: (years) => (
        <div className="experience">
          <TrophyOutlined className="experience-icon" />
          <span>{years} năm</span>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Badge
          status={
            status === "active"
              ? "success"
              : status === "retired"
              ? "default"
              : "warning"
          }
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: "Ngày vào làm",
      dataIndex: "hireDate",
      key: "hireDate",
      width: 120,
      render: (date) => (
        <div className="hire-date">
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
            title="Bạn có chắc chắn muốn xóa giảng viên này?"
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
    <div className="teachers-management">
      <div className="page-header">
        <h1>Quản lý Giảng viên</h1>
        <p>Quản lý thông tin giảng viên trong hệ thống blockchain</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng giảng viên"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang công tác"
              value={stats.active}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã nghỉ hưu"
              value={stats.retired}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Kinh nghiệm TB"
              value={`${stats.avgExperience.toFixed(1)} năm`}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="teachers-table-card">
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
              <Option value="active">Đang công tác</Option>
              <Option value="inactive">Tạm nghỉ</Option>
              <Option value="retired">Đã nghỉ hưu</Option>
            </Select>
            <Select
              placeholder="Khoa/Bộ môn"
              style={{ width: 180 }}
              value={departmentFilter}
              onChange={handleDepartmentFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">Tất cả</Option>
              <Option value="Công nghệ thông tin">Công nghệ thông tin</Option>
              <Option value="Kinh tế">Kinh tế</Option>
              <Option value="Toán học">Toán học</Option>
            </Select>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            size="large"
          >
            Thêm giảng viên
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giảng viên`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingTeacher ? "Chỉnh sửa giảng viên" : "Thêm giảng viên mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText={editingTeacher ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "active", title: "Mr" }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="teacherCode"
                label="Mã giảng viên"
                rules={[
                  { required: true, message: "Vui lòng nhập mã giảng viên!" },
                ]}
              >
                <Input placeholder="Nhập mã giảng viên" />
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
            <Col span={8}>
              <Form.Item
                name="title"
                label="Danh xưng"
                rules={[
                  { required: true, message: "Vui lòng chọn danh xưng!" },
                ]}
              >
                <Select placeholder="Chọn danh xưng">
                  <Option value="Mr">Mr</Option>
                  <Option value="Mrs">Mrs</Option>
                  <Option value="Ms">Ms</Option>
                  <Option value="Dr">Dr</Option>
                  <Option value="Prof">Prof</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
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
            <Col span={8}>
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
              <Form.Item
                name="department"
                label="Khoa/Bộ môn"
                rules={[
                  { required: true, message: "Vui lòng nhập khoa/bộ môn!" },
                ]}
              >
                <Input placeholder="Nhập khoa/bộ môn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Chức vụ"
                rules={[{ required: true, message: "Vui lòng nhập chức vụ!" }]}
              >
                <Input placeholder="Nhập chức vụ" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Chuyên môn"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên môn!" },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn chuyên môn"
                  style={{ width: "100%" }}
                >
                  <Option value="Blockchain">Blockchain</Option>
                  <Option value="Smart Contract">Smart Contract</Option>
                  <Option value="Cryptocurrency">Cryptocurrency</Option>
                  <Option value="Software Engineering">
                    Software Engineering
                  </Option>
                  <Option value="Web Development">Web Development</Option>
                  <Option value="Database">Database</Option>
                  <Option value="Network Security">Network Security</Option>
                  <Option value="Cloud Computing">Cloud Computing</Option>
                  <Option value="AI/ML">AI/ML</Option>
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
                  <Option value="active">Đang công tác</Option>
                  <Option value="inactive">Tạm nghỉ</Option>
                  <Option value="retired">Đã nghỉ hưu</Option>
                </Select>
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
              <Form.Item name="qualifications" label="Bằng cấp/Chứng chỉ">
                <Select
                  mode="tags"
                  placeholder="Nhập bằng cấp/chứng chỉ"
                  style={{ width: "100%" }}
                />
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

export default TeachersManagement;
