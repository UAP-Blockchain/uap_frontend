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
  Popconfirm,
  Row,
  Col,
  Statistic,
  TimePicker,
  InputNumber,
  Badge,
  Progress,
  
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  UserOutlined,
  CalendarOutlined,
  FilterOutlined,
  TeamOutlined,
  
  CheckCircleOutlined,
  HomeOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Class, ClassSchedule } from "../../../models/Class";
import dayjs from "dayjs";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ClassesManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      classCode: "BC101",
      className: "Blockchain Development",
      courseCode: "CS401",
      courseName: "Advanced Blockchain Programming",
      description:
        "Khóa học về phát triển ứng dụng blockchain và smart contract",
      teacherId: "1",
      teacherName: "Nguyễn Ngọc Lâm",
      studentIds: ["1", "2", "4"],
      maxStudents: 50,
      credits: 3,
      schedule: [
        {
          dayOfWeek: "monday",
          startTime: "08:00",
          endTime: "10:00",
          room: "A301",
        },
        {
          dayOfWeek: "wednesday",
          startTime: "14:00",
          endTime: "16:00",
          room: "A301",
        },
      ],
      startDate: "2024-02-01",
      endDate: "2024-05-30",
      semester: "Spring 2024",
      academicYear: "2023-2024",
      status: "active",
      room: "A301",
      department: "Công nghệ thông tin",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      classCode: "SC102",
      className: "Smart Contract Programming",
      courseCode: "CS402",
      courseName: "Smart Contract Development",
      description: "Khóa học về lập trình smart contract với Solidity",
      teacherId: "2",
      teacherName: "Trần Văn An",
      studentIds: ["1", "3"],
      maxStudents: 40,
      credits: 4,
      schedule: [
        {
          dayOfWeek: "tuesday",
          startTime: "10:00",
          endTime: "12:00",
          room: "B201",
        },
        {
          dayOfWeek: "friday",
          startTime: "08:00",
          endTime: "10:00",
          room: "B201",
        },
      ],
      startDate: "2024-02-01",
      endDate: "2024-05-30",
      semester: "Spring 2024",
      academicYear: "2023-2024",
      status: "active",
      room: "B201",
      department: "Công nghệ thông tin",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      classCode: "CE103",
      className: "Cryptocurrency Economics",
      courseCode: "EC301",
      courseName: "Digital Currency and Economics",
      description:
        "Khóa học về kinh tế học tiền điện tử và công nghệ blockchain",
      teacherId: "3",
      teacherName: "Lê Thị Bình",
      studentIds: ["2", "3", "4"],
      maxStudents: 60,
      credits: 3,
      schedule: [
        {
          dayOfWeek: "thursday",
          startTime: "14:00",
          endTime: "17:00",
          room: "C101",
        },
      ],
      startDate: "2024-02-01",
      endDate: "2024-05-30",
      semester: "Spring 2024",
      academicYear: "2023-2024",
      status: "active",
      room: "C101",
      department: "Kinh tế",
      createdAt: "2024-01-15T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      classCode: "DS104",
      className: "Distributed Systems",
      courseCode: "CS501",
      courseName: "Advanced Distributed Systems",
      description: "Khóa học về hệ thống phân tán và kiến trúc blockchain",
      teacherId: "4",
      teacherName: "Phạm Minh Đức",
      studentIds: ["1", "2", "3", "4"],
      maxStudents: 35,
      credits: 4,
      schedule: [
        {
          dayOfWeek: "monday",
          startTime: "14:00",
          endTime: "16:00",
          room: "D301",
        },
        {
          dayOfWeek: "wednesday",
          startTime: "10:00",
          endTime: "12:00",
          room: "D301",
        },
      ],
      startDate: "2024-01-15",
      endDate: "2024-04-30",
      semester: "Spring 2024",
      academicYear: "2023-2024",
      status: "completed",
      room: "D301",
      department: "Công nghệ thông tin",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-04-30T00:00:00Z",
    },
  ]);

  const [filteredClasses, setFilteredClasses] = useState<Class[]>(classes);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Mock teachers data
  const teachers = [
    { id: "1", name: "Nguyễn Ngọc Lâm" },
    { id: "2", name: "Trần Văn An" },
    { id: "3", name: "Lê Thị Bình" },
    { id: "4", name: "Phạm Minh Đức" },
  ];

  // Statistics
  const stats = {
    total: classes.length,
    active: classes.filter((c) => c.status === "active").length,
    completed: classes.filter((c) => c.status === "completed").length,
    totalStudents: classes.reduce((sum, c) => sum + c.studentIds.length, 0),
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    filterClasses(value, statusFilter, departmentFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    filterClasses(searchText, value, departmentFilter);
  };

  const handleDepartmentFilter = (value: string) => {
    setDepartmentFilter(value);
    filterClasses(searchText, statusFilter, value);
  };

  const filterClasses = (
    search: string,
    status: string,
    department: string
  ) => {
    let filtered = classes;

    if (search) {
      filtered = filtered.filter(
        (cls) =>
          cls.className.toLowerCase().includes(search.toLowerCase()) ||
          cls.classCode.toLowerCase().includes(search.toLowerCase()) ||
          cls.teacherName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      filtered = filtered.filter((cls) => cls.status === status);
    }

    if (department !== "all") {
      filtered = filtered.filter((cls) => cls.department === department);
    }

    setFilteredClasses(filtered);
  };

  const showModal = (cls?: Class) => {
    if (cls) {
      setEditingClass(cls);
      form.setFieldsValue({
        ...cls,
        dateRange: [dayjs(cls.startDate), dayjs(cls.endDate)],
        schedule: cls.schedule.map((s) => ({
          ...s,
          timeRange: [dayjs(s.startTime, "HH:mm"), dayjs(s.endTime, "HH:mm")],
        })),
      });
    } else {
      setEditingClass(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values: any) => {
      const schedule: ClassSchedule[] =
        values.schedule?.map((s: any) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.timeRange[0].format("HH:mm"),
          endTime: s.timeRange[1].format("HH:mm"),
          room: s.room,
        })) || [];

      const classData: Class = {
        id: editingClass?.id || Date.now().toString(),
        classCode: values.classCode,
        className: values.className,
        courseCode: values.courseCode,
        courseName: values.courseName,
        description: values.description,
        teacherId: values.teacherId,
        teacherName:
          teachers.find((t) => t.id === values.teacherId)?.name || "",
        studentIds: editingClass?.studentIds || [],
        maxStudents: values.maxStudents,
        credits: values.credits,
        schedule,
        startDate: values.dateRange[0].format("YYYY-MM-DD"),
        endDate: values.dateRange[1].format("YYYY-MM-DD"),
        semester: values.semester,
        academicYear: values.academicYear,
        status: values.status,
        room: values.room,
        department: values.department,
        createdAt: editingClass?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (editingClass) {
        setClasses((prev) =>
          prev.map((c) => (c.id === editingClass.id ? classData : c))
        );
        message.success("Cập nhật lớp học thành công!");
      } else {
        setClasses((prev) => [...prev, classData]);
        message.success("Thêm lớp học thành công!");
      }

      setIsModalVisible(false);
      filterClasses(searchText, statusFilter, departmentFilter);
    });
  };

  const handleDelete = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    filterClasses(searchText, statusFilter, departmentFilter);
    message.success("Xóa lớp học thành công!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "completed":
        return "blue";
      case "inactive":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Đang học";
      case "completed":
        return "Đã hoàn thành";
      case "inactive":
        return "Tạm dừng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getDayText = (day: string) => {
    const days: Record<string, string> = {
      monday: "T2",
      tuesday: "T3",
      wednesday: "T4",
      thursday: "T5",
      friday: "T6",
      saturday: "T7",
      sunday: "CN",
    };
    return days[day] || day;
  };

  const getCapacityColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return "#ff4d4f";
    if (ratio >= 0.7) return "#faad14";
    return "#52c41a";
  };

  const columns: ColumnsType<Class> = [
    {
      title: "Thông tin lớp học",
      key: "classInfo",
      width: 280,
      render: (_, record) => (
        <div className="class-info">
          <div className="class-header">
            <BookOutlined className="class-icon" />
            <div className="class-details">
              <div className="class-name">{record.className}</div>
              <div className="class-code">{record.classCode}</div>
              <div className="course-code">
                {record.courseCode} - {record.courseName}
              </div>
            </div>
          </div>
          <div className="class-description">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
      render: (teacherName) => (
        <div className="teacher-info">
          <UserOutlined className="teacher-icon" />
          <span>{teacherName}</span>
        </div>
      ),
    },
    {
      title: "Lịch học",
      dataIndex: "schedule",
      key: "schedule",
      width: 200,
      render: (schedule: ClassSchedule[]) => (
        <div className="schedule-info">
          {schedule.map((s, index) => (
            <div key={index} className="schedule-item">
              <Tag color="blue" size="small">
                {getDayText(s.dayOfWeek)}
              </Tag>
              <span className="time">
                {s.startTime}-{s.endTime}
              </span>
              {s.room && (
                <span className="room">
                  <HomeOutlined className="room-icon" />
                  {s.room}
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Sinh viên",
      key: "students",
      width: 120,
      render: (_, record) => (
        <div className="student-capacity">
          <div className="capacity-numbers">
            <TeamOutlined className="capacity-icon" />
            <span>
              {record.studentIds.length}/{record.maxStudents}
            </span>
          </div>
          <Progress
            percent={(record.studentIds.length / record.maxStudents) * 100}
            size="small"
            strokeColor={getCapacityColor(
              record.studentIds.length,
              record.maxStudents
            )}
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
      render: (credits) => (
        <Tag color="purple" icon={<TrophyOutlined />}>
          {credits}
        </Tag>
      ),
    },
    {
      title: "Kỳ học",
      key: "semester",
      width: 120,
      render: (_, record) => (
        <div className="semester-info">
          <div className="semester">{record.semester}</div>
          <div className="academic-year">{record.academicYear}</div>
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
              ? "processing"
              : status === "completed"
              ? "success"
              : "error"
          }
          text={getStatusText(status)}
        />
      ),
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 150,
      render: (_, record) => (
        <div className="duration-info">
          <div className="date-item">
            <CalendarOutlined className="date-icon" />
            <span>
              {new Date(record.startDate).toLocaleDateString("vi-VN")}
            </span>
          </div>
          <div className="date-item">
            <span>
              đến {new Date(record.endDate).toLocaleDateString("vi-VN")}
            </span>
          </div>
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
            title="Bạn có chắc chắn muốn xóa lớp học này?"
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
    <div className="classes-management">
      <div className="page-header">
        <h1>Quản lý Lớp học</h1>
        <p>Quản lý thông tin lớp học và khóa học trong hệ thống blockchain</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng lớp học"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: "#ff6b35" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Đã hoàn thành"
              value={stats.completed}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="Tổng sinh viên"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="classes-table-card">
        <div className="table-header">
          <div className="filters">
            <Search
              placeholder="Tìm kiếm theo tên lớp, mã lớp, giảng viên..."
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
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="inactive">Tạm dừng</Option>
              <Option value="cancelled">Đã hủy</Option>
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
            Thêm lớp học
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredClasses}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lớp học`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      <Modal
        title={editingClass ? "Chỉnh sửa lớp học" : "Thêm lớp học mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={editingClass ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "active", credits: 3, maxStudents: 50 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="classCode"
                label="Mã lớp học"
                rules={[
                  { required: true, message: "Vui lòng nhập mã lớp học!" },
                ]}
              >
                <Input placeholder="Nhập mã lớp học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="className"
                label="Tên lớp học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên lớp học!" },
                ]}
              >
                <Input placeholder="Nhập tên lớp học" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="courseCode"
                label="Mã khóa học"
                rules={[
                  { required: true, message: "Vui lòng nhập mã khóa học!" },
                ]}
              >
                <Input placeholder="Nhập mã khóa học" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="courseName"
                label="Tên khóa học"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khóa học!" },
                ]}
              >
                <Input placeholder="Nhập tên khóa học" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Nhập mô tả lớp học" rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="teacherId"
                label="Giảng viên"
                rules={[
                  { required: true, message: "Vui lòng chọn giảng viên!" },
                ]}
              >
                <Select placeholder="Chọn giảng viên">
                  {teachers.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxStudents"
                label="Sĩ số tối đa"
                rules={[
                  { required: true, message: "Vui lòng nhập sĩ số tối đa!" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={200}
                  placeholder="Nhập sĩ số tối đa"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="credits"
                label="Số tín chỉ"
                rules={[
                  { required: true, message: "Vui lòng nhập số tín chỉ!" },
                ]}
              >
                <InputNumber
                  min={1}
                  max={10}
                  placeholder="Nhập số tín chỉ"
                  style={{ width: "100%" }}
                />
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
              <Form.Item name="room" label="Phòng học">
                <Input placeholder="Nhập phòng học" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="semester"
                label="Kỳ học"
                rules={[{ required: true, message: "Vui lòng nhập kỳ học!" }]}
              >
                <Select placeholder="Chọn kỳ học">
                  <Option value="Spring 2024">Spring 2024</Option>
                  <Option value="Summer 2024">Summer 2024</Option>
                  <Option value="Fall 2024">Fall 2024</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="academicYear"
                label="Năm học"
                rules={[{ required: true, message: "Vui lòng nhập năm học!" }]}
              >
                <Select placeholder="Chọn năm học">
                  <Option value="2023-2024">2023-2024</Option>
                  <Option value="2024-2025">2024-2025</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  { required: true, message: "Vui lòng chọn trạng thái!" },
                ]}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Đang học</Option>
                  <Option value="inactive">Tạm dừng</Option>
                  <Option value="completed">Đã hoàn thành</Option>
                  <Option value="cancelled">Đã hủy</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="dateRange"
            label="Thời gian học"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian học!" },
            ]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.List name="schedule">
            {(fields, { add, remove }) => (
              <div className="schedule-form">
                <div className="schedule-header">
                  <label>Lịch học</label>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    Thêm lịch học
                  </Button>
                </div>
                {fields.map((field) => (
                  <div key={field.key} className="schedule-item-form">
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...field}
                          name={[field.name, "dayOfWeek"]}
                          rules={[{ required: true, message: "Chọn thứ!" }]}
                        >
                          <Select placeholder="Chọn thứ">
                            <Option value="monday">Thứ 2</Option>
                            <Option value="tuesday">Thứ 3</Option>
                            <Option value="wednesday">Thứ 4</Option>
                            <Option value="thursday">Thứ 5</Option>
                            <Option value="friday">Thứ 6</Option>
                            <Option value="saturday">Thứ 7</Option>
                            <Option value="sunday">Chủ nhật</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...field}
                          name={[field.name, "timeRange"]}
                          rules={[{ required: true, message: "Chọn giờ học!" }]}
                        >
                          <TimePicker.RangePicker
                            format="HH:mm"
                            placeholder={["Giờ bắt đầu", "Giờ kết thúc"]}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, "room"]}>
                          <Input placeholder="Phòng học" />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassesManagement;
