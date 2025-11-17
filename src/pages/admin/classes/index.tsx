import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Popconfirm,
  Tooltip,
} from "antd";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  CalendarOutlined,
  CompressOutlined,
  ExpandAltOutlined,
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./index.scss";
import type { ClassSummary, CreateClassRequest } from "../../../types/Class";
import type { SubjectDto } from "../../../types/Subject";
import type { TeacherOption } from "../../../types/Teacher";
import {
  createClassApi,
  fetchClassesApi,
  fetchSubjectsApi,
  fetchTeachersApi,
  getClassByIdApi,
  updateClassApi,
  deleteClassApi,
} from "../../../services/admin/classes/api";

const { Search } = Input;
const { Option } = Select;

const ClassesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [showDetails, setShowDetails] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSummary | null>(null);
  const [form] = Form.useForm<CreateClassRequest>();

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [classRes, subjectRes, teacherRes] = await Promise.all([
        fetchClassesApi(),
        fetchSubjectsApi(),
        fetchTeachersApi(),
      ]);
      setClasses(classRes);
      setSubjects(subjectRes);
      setTeachers(teacherRes);
    } catch {
      toast.error("Không thể tải dữ liệu lớp học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const semesterOptions = useMemo(() => {
    const semesters = Array.from(
      new Set(classes.map((cls) => cls.semesterName))
    );
    return semesters.sort((a, b) => a.localeCompare(b));
  }, [classes]);

  const stats = useMemo(() => {
    const total = classes.length;
    const totalStudents = classes.reduce(
      (sum, cls) => sum + (cls.totalStudents || 0),
      0
    );
    const totalSlots = classes.reduce(
      (sum, cls) => sum + (cls.totalSlots || 0),
      0
    );
    const totalEnrollments = classes.reduce(
      (sum, cls) => sum + (cls.totalEnrollments || 0),
      0
    );
    return {
      total,
      totalStudents,
      totalSlots,
      totalEnrollments,
    };
  }, [classes]);

  const statsCards = [
    {
      label: "Tổng lớp học",
      value: stats.total,
      accent: "total",
      icon: <BookOutlined />,
    },
    {
      label: "Tổng sinh viên",
      value: stats.totalStudents,
      accent: "students",
      icon: <UserOutlined />,
    },
    {
      label: "Đăng ký",
      value: stats.totalEnrollments,
      accent: "enrollments",
      icon: <CalendarOutlined />,
    },
    {
      label: "Số chỗ",
      value: stats.totalSlots,
      accent: "slots",
      icon: <BookOutlined />,
    },
  ];

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        searchText.trim() === "" ||
        cls.classCode.toLowerCase().includes(searchText.toLowerCase()) ||
        cls.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
        cls.teacherName.toLowerCase().includes(searchText.toLowerCase());
      const matchesSemester =
        semesterFilter === "all" || cls.semesterName === semesterFilter;
      return matchesSearch && matchesSemester;
    });
  }, [classes, searchText, semesterFilter]);

  const handleNavigateDetail = (classItem: ClassSummary) => {
    navigate(`/admin/classes/${classItem.classCode}?id=${classItem.id}`);
  };

  const columns: ColumnsType<ClassSummary> = [
    {
      title: "Lớp học",
      key: "classInfo",
      width: 220,
      render: (_, record) => (
        <div
          className="class-info clickable"
          onClick={() => handleNavigateDetail(record)}
          style={{ cursor: "pointer" }}
        >
          <div className="class-info__code">{record.classCode}</div>
          <div className="class-info__subject">
            {record.subjectCode} - {record.subjectName}
          </div>
        </div>
      ),
    },
    {
      title: "Giảng viên",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 150,
      render: (teacherName: string) => (
        <div className="teacher-info">
          <UserOutlined className="teacher-icon" />
          <span>{teacherName}</span>
        </div>
      ),
    },
    {
      title: "Kỳ học",
      dataIndex: "semesterName",
      key: "semesterName",
      width: 120,
      render: (semesterName: string) => (
        <Tag color="blue" className="semester-tag">
          {semesterName}
        </Tag>
      ),
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 80,
      align: "center",
      render: (credits: number) => (
        <span className="credit-value">{credits}</span>
      ),
    },
    {
      title: "Sĩ số",
      key: "capacity",
      width: 80,
      align: "center",
      render: (_, record) => (
        <span className="number-value">{record.totalStudents}</span>
      ),
    },
    {
      title: "Đăng ký",
      key: "enrollments",
      width: 90,
      align: "center",
      render: (_, record) => (
        <span className="number-value">{record.totalEnrollments}</span>
      ),
    },
    {
      title: "Chỗ trống",
      key: "slots",
      width: 90,
      align: "center",
      render: (_, record) => (
        <span className="number-value">{record.totalSlots}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="action-btn-edit"
            />
          </Tooltip>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lớp học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                className="action-btn-delete"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = async (classItem: ClassSummary) => {
    try {
      setLoading(true);
      const classDetail = await getClassByIdApi(classItem.id);
      setEditingClass(classDetail);

      // Find subject and teacher IDs from the current data
      const subject = subjects.find(
        (s) => s.subjectCode === classItem.subjectCode
      );
      const teacher = teachers.find(
        (t) => t.teacherCode === classItem.teacherCode
      );

      form.setFieldsValue({
        classCode: classDetail.classCode,
        subjectId: subject?.id,
        teacherId: teacher?.id,
      });
      setIsModalVisible(true);
    } catch {
      toast.error("Không thể tải thông tin lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteClassApi(id);
      toast.success("Xóa lớp học thành công");
      await loadInitialData();
    } catch {
      toast.error("Không thể xóa lớp học");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      if (editingClass) {
        await updateClassApi(editingClass.id, values);
        toast.success("Cập nhật lớp học thành công");
      } else {
        await createClassApi(values);
        toast.success("Tạo lớp học thành công");
      }

      setIsModalVisible(false);
      setEditingClass(null);
      form.resetFields();
      await loadInitialData();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(
          editingClass
            ? "Không thể cập nhật lớp học"
            : "Không thể tạo lớp học mới"
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingClass(null);
    form.resetFields();
  };

  return (
    <div className="classes-management">
      <Card className="classes-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <BookOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Lớp học</h2>
            </div>
          </div>
          <div className="header-actions">
            <Button
              className="toggle-details-btn"
              icon={showDetails ? <CompressOutlined /> : <ExpandAltOutlined />}
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Thu gọn" : "Chi tiết"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={() => {
                setEditingClass(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              Thêm lớp học
            </Button>
          </div>
        </div>

        {!showDetails && (
          <div className="stats-compact">
            {statsCards.map((stat) => (
              <div key={stat.label} className={`stat-chip ${stat.accent}`}>
                <span className="value">{stat.value}</span>
                <span className="label">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {showDetails && (
          <div className="stats-inline">
            {statsCards.map((stat) => (
              <div key={stat.label} className={`stat-item ${stat.accent}`}>
                <div className="stat-icon-wrapper">{stat.icon}</div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`filters-row ${!showDetails ? "compact-layout" : ""}`}>
          {showDetails && (
            <Row gutter={[16, 16]} className="filter-row-expanded">
              <Col xs={24} sm={12} md={8} lg={10}>
                <div className="filter-field">
                  <label>Tìm kiếm lớp học</label>
                  <Search
                    placeholder="Nhập mã lớp, môn học hoặc giảng viên..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={(value) => setSearchText(value)}
                    prefix={<SearchOutlined />}
                    size="large"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div className="filter-field">
                  <label>Kỳ học</label>
                  <Select
                    value={semesterFilter}
                    onChange={setSemesterFilter}
                    size="large"
                    className="semester-select"
                  >
                    <Option value="all">Tất cả</Option>
                    {semesterOptions.map((semester) => (
                      <Option key={semester} value={semester}>
                        {semester}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={8}>
                <div className="filter-meta">
                  <span>
                    Hiển thị: <strong>{filteredClasses.length}</strong> /{" "}
                    <strong>{classes.length}</strong>
                  </span>
                </div>
              </Col>
            </Row>
          )}

          {!showDetails && (
            <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
              <Col flex="1">
                <Select
                  value={semesterFilter}
                  onChange={setSemesterFilter}
                  size="small"
                  className="semester-select-compact"
                >
                  <Option value="all">Tất cả</Option>
                  {semesterOptions.map((semester) => (
                    <Option key={semester} value={semester}>
                      {semester}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col className="filter-meta-compact">
                <span>
                  {filteredClasses.length} / {classes.length}
                </span>
              </Col>
            </Row>
          )}
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredClasses}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 12,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
            }}
            scroll={{ x: 1000 }}
            size="small"
          />
        </div>
      </Card>

      <Modal
        title={editingClass ? "Chỉnh sửa lớp học" : "Tạo lớp học mới"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleModalCancel}
        okText={editingClass ? "Cập nhật" : "Tạo lớp"}
        cancelText="Hủy"
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            classCode: "",
            subjectId: undefined,
            teacherId: undefined,
          }}
        >
          <Form.Item
            name="classCode"
            label="Mã lớp học"
            rules={[{ required: true, message: "Vui lòng nhập mã lớp học" }]}
          >
            <Input placeholder="VD: AI401-A" />
          </Form.Item>

          <Form.Item
            name="subjectId"
            label="Môn học"
            rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
          >
            <Select
              placeholder="Chọn môn học"
              showSearch
              optionFilterProp="label"
            >
              {subjects.map((subject) => (
                <Option
                  key={subject.id}
                  value={subject.id}
                  label={`${subject.subjectCode} ${subject.subjectName}`}
                >
                  {subject.subjectCode} - {subject.subjectName} (
                  {subject.credits} tín chỉ)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="Giảng viên"
            rules={[{ required: true, message: "Vui lòng chọn giảng viên" }]}
          >
            <Select
              placeholder="Chọn giảng viên"
              showSearch
              optionFilterProp="label"
            >
              {teachers.map((teacher) => (
                <Option
                  key={teacher.id}
                  value={teacher.id}
                  label={`${teacher.teacherCode} ${teacher.fullName}`}
                >
                  {teacher.teacherCode} - {teacher.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassesManagement;
