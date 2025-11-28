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
import { BookOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
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
            <Col xs={24} lg={12}>
              <Card className="info-card">
                <div className="card-heading">
                  <BookOutlined className="card-icon" />
                  <div>
                    <p className="eyebrow">Thông tin lớp</p>
                    <h3>{selectedClassSummary.classCode}</h3>
                  </div>
                </div>
                <div className="info-grid">
                  <div>
                    <p>Môn học</p>
                    <strong>
                      {selectedClassSummary.subjectCode} -{" "}
                      {selectedClassSummary.subjectName}
                    </strong>
                  </div>
                  <div>
                    <p>Kỳ học</p>
                    <strong>{selectedClassSummary.semesterName}</strong>
                  </div>
                  <div>
                    <p>Tín chỉ</p>
                    <strong>{selectedClassSummary.credits || 0}</strong>
                  </div>
                  {classDetail?.semesterStartDate && (
                    <div>
                      <p>Bắt đầu</p>
                      <strong>{new Date(classDetail.semesterStartDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                  {classDetail?.semesterEndDate && (
                    <div>
                      <p>Kết thúc</p>
                      <strong>{new Date(classDetail.semesterEndDate).toLocaleDateString()}</strong>
                    </div>
                  )}
                  {classDetail?.room && (
                    <div>
                      <p>Phòng học</p>
                      <strong>{classDetail.room}</strong>
                    </div>
                  )}
                </div>
                <div className="pill-row">
                  {selectedClassSummary.status && (
                    <span className="pill muted">
                      {selectedClassSummary.status}
                    </span>
                  )}
                  {classDetail?.subjectOfferingId && (
                    <span className="pill">
                      Offering: {classDetail.subjectOfferingId}
                    </span>
                  )}
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card className="stats-card minimalist">
                <div className="card-heading">
                  <TeamOutlined className="card-icon" />
                  <div>
                    <p className="eyebrow">Sĩ số lớp</p>
                    <h3>{totalStudents} sinh viên</h3>
                  </div>
                </div>
                <div className="stats-grid compact">
                  <div className="stat">
                    <span>Đăng ký</span>
                    <strong>
                      {selectedClassSummary.currentEnrollment ?? totalStudents}
                    </strong>
                  </div>
                  <div className="stat">
                    <span>Chỉ tiêu</span>
                    <strong>{slots}</strong>
                  </div>
                  <div className="stat">
                    <span>Còn trống</span>
                    <strong>{Math.max(slots - totalStudents, 0)}</strong>
                  </div>
                </div>
                <div className="note">
                  Tổng số sinh viên lấy từ roster mới nhất. Chỉ tiêu dựa trên
                  max enrollment của lớp.
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

