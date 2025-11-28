import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Select,
  Typography,
  Row,
  Col,
  Tag,
  Table,
  Avatar,
  Space,
  Empty,
  Spin,
  Input,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  getTeacherClassesApi,
  getClassByIdApi,
  type TeachingClass,
  type ClassDetail,
  type ClassStudent,
} from "../../../services/teacher/grading/api";
import "./index.scss";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const TeacherTeachingClasses: React.FC = () => {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loadingClasses, setLoadingClasses] = useState<boolean>(false);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [searchText, setSearchText] = useState("");

  const loadTeacherClasses = async () => {
    setLoadingClasses(true);
    try {
      const classList = await getTeacherClassesApi();
      setClasses(classList);
      if (classList.length > 0) {
        setSelectedClassId((prev) => prev || classList[0].classId);
      } else {
        setSelectedClassId("");
      }
    } catch (error) {
      console.error("Failed to load teacher classes:", error);
      message.error("Không thể tải danh sách lớp giảng dạy");
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadClassDetail = async (classId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await getClassByIdApi(classId);
      setClassDetail(detail);
    } catch (error) {
      console.error("Failed to load class detail:", error);
      message.error("Không thể tải thông tin lớp");
      setClassDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    void loadTeacherClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      void loadClassDetail(selectedClassId);
    } else {
      setClassDetail(null);
    }
  }, [selectedClassId]);

  const selectedClassSummary = useMemo(
    () => classes.find((cls) => cls.classId === selectedClassId),
    [classes, selectedClassId]
  );

  const studentData = useMemo(() => {
    if (!classDetail?.students) return [];
    if (!searchText.trim()) {
      return classDetail.students;
    }
    const term = searchText.toLowerCase();
    return classDetail.students.filter(
      (student) =>
        student.fullName.toLowerCase().includes(term) ||
        student.studentCode.toLowerCase().includes(term)
    );
  }, [classDetail, searchText]);

  const columns: ColumnsType<ClassStudent> = [
    {
      title: "STT",
      key: "index",
      width: 80,
      align: "center",
      render: (_: unknown, __: ClassStudent, index: number) => index + 1,
    },
    {
      title: "Sinh viên",
      key: "student",
      render: (_, student) => (
        <div className="student-info">
          <Avatar icon={<UserOutlined />} size="large" />
          <div className="student-info__meta">
            <div className="name">{student.fullName}</div>
            <div className="code">{student.studentCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email?: string) => email || "—",
    },
  ];

  const totalStudents =
    classDetail?.students?.length ??
    selectedClassSummary?.totalStudents ??
    0;

  const slots = selectedClassSummary?.totalSlots ?? 0;

  return (
    <div className="teacher-teaching-classes">
      <div className="page-header">
        <div>
          <p className="eyebrow">Teacher Portal</p>
          <Title level={2}>Lớp giảng dạy</Title>
          <Text type="secondary">
            Quản lý các lớp đang phụ trách và danh sách sinh viên đăng ký
          </Text>
        </div>
        <Tag color="blue" className="header-tag">
          {classes.length} lớp
        </Tag>
      </div>

      <Card className="class-selector-card">
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text strong>Chọn lớp giảng dạy</Text>
          <Select
            placeholder="Chọn lớp"
            value={selectedClassId || undefined}
            onChange={setSelectedClassId}
            loading={loadingClasses}
            showSearch
            optionFilterProp="data-label"
            className="selector-control"
          >
            {classes.map((cls) => {
              const label = `${cls.classCode} • ${cls.subjectName} • ${cls.semesterName}`;
              return (
                <Option key={cls.classId} value={cls.classId} data-label={label}>
                  <div className="option-meta">
                    <span className="option-code">{cls.classCode}</span>
                    <span className="option-name">{cls.subjectName}</span>
                    <span className="option-semester">{cls.semesterName}</span>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Space>
      </Card>

      {!loadingClasses && classes.length === 0 && (
        <Empty
          description="Bạn chưa được phân công lớp nào"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {selectedClassSummary && (
        <Spin spinning={loadingDetail}>
          <Row gutter={[16, 16]} className="class-overview">
            <Col xs={24} md={12} lg={8}>
              <Card>
                <div className="card-heading">
                  <BookOutlined className="card-icon" />
                  <div>
                    <p className="eyebrow">Thông tin lớp</p>
                    <h3>{selectedClassSummary.classCode}</h3>
                  </div>
                </div>
                <ul className="info-list">
                  <li>
                    <span>Môn học</span>
                    <strong>
                      {selectedClassSummary.subjectCode} -{" "}
                      {selectedClassSummary.subjectName}
                    </strong>
                  </li>
                  <li>
                    <span>Tín chỉ</span>
                    <strong>{selectedClassSummary.credits || 0}</strong>
                  </li>
                  <li>
                    <span>Kỳ học</span>
                    <strong>{selectedClassSummary.semesterName}</strong>
                  </li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Card>
                <div className="card-heading">
                  <CalendarOutlined className="card-icon" />
                  <div>
                    <p className="eyebrow">Giảng viên phụ trách</p>
                    <h3>{selectedClassSummary.teacherName || "Giảng viên"}</h3>
                  </div>
                </div>
                <ul className="info-list">
                  <li>
                    <span>Mã GV</span>
                    <strong>{selectedClassSummary.teacherCode || "—"}</strong>
                  </li>
                  <li>
                    <span>Email</span>
                    <strong>{selectedClassSummary.teacherEmail || "—"}</strong>
                  </li>
                  <li>
                    <span>Điện thoại</span>
                    <strong>{selectedClassSummary.teacherPhone || "—"}</strong>
                  </li>
                </ul>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="stats-card">
                <div className="card-heading">
                  <TeamOutlined className="card-icon" />
                  <div>
                    <p className="eyebrow">Sĩ số lớp</p>
                    <h3>{totalStudents} sinh viên</h3>
                  </div>
                </div>
                <div className="stats-grid">
                  <div>
                    <p>Đăng ký</p>
                    <strong>{selectedClassSummary.currentEnrollment ?? totalStudents}</strong>
                  </div>
                  <div>
                    <p>Chỉ tiêu</p>
                    <strong>{slots}</strong>
                  </div>
                  <div>
                    <p>Còn trống</p>
                    <strong>{Math.max(slots - totalStudents, 0)}</strong>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          <Card className="students-card">
            <div className="card-header">
              <div>
                <h3>Danh sách sinh viên</h3>
                <Text type="secondary">
                  Hiển thị {studentData.length} / {totalStudents} sinh viên
                </Text>
              </div>
              <Search
                placeholder="Tìm theo tên hoặc mã sinh viên"
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-box"
              />
            </div>
            <Table
              columns={columns}
              dataSource={studentData}
              rowKey="studentId"
              pagination={false}
              scroll={{ x: 600 }}
              className="students-table"
              locale={{
                emptyText: loadingDetail ? "Đang tải..." : "Chưa có sinh viên",
              }}
            />
          </Card>
        </Spin>
      )}
    </div>
  );
};

export default TeacherTeachingClasses;

