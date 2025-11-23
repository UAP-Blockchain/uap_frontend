import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Avatar,
  InputNumber,
  Row,
  Col,
  Alert,
  message,
  Tooltip,
  Tabs,
  Spin,
} from "antd";
import {
  SaveOutlined,
  TrophyOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getTeacherProfileApi,
  getClassByIdApi,
  getGradeComponentsApi,
  submitClassGradesApi,
  type TeachingClass,
  type ClassStudent,
  type GradeComponent,
  type ClassDetail,
} from "../../../services/teacher/grading/api";
import "./index.scss";

const { Option } = Select;
const { TabPane } = Tabs;

interface StudentGrade {
  studentId: string;
  [key: string]: string | number; // gradeComponentId -> score
}

const TeacherGrading: React.FC = () => {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [selectedGradeComponent, setSelectedGradeComponent] =
    useState<string>("");
  const [studentGrades, setStudentGrades] = useState<
    Record<string, StudentGrade>
  >({});
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingClassData, setLoadingClassData] = useState(false);
  const [activeTab, setActiveTab] = useState("grading");

  // Load teacher's classes on mount
  useEffect(() => {
    loadTeacherClasses();
  }, []);

  // Load class data when class is selected
  useEffect(() => {
    if (selectedClassId) {
      loadClassData(selectedClassId);
    }
  }, [selectedClassId]);

  const loadTeacherClasses = async () => {
    setLoadingClasses(true);
    try {
      const profile = await getTeacherProfileApi();
      setClasses(profile.classes || []);
      if (profile.classes && profile.classes.length > 0) {
        setSelectedClassId(profile.classes[0].classId);
      }
    } catch (error) {
      console.error("Error loading teacher classes:", error);
      message.error("Không thể tải danh sách lớp học");
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadClassData = async (classId: string) => {
    setLoadingClassData(true);
    try {
      const classData = await getClassByIdApi(classId);
      setSelectedClass(classData);
      setStudents(classData.students || []);

      // Load grade components for this subject
      if (classData.subjectId) {
        const components = await getGradeComponentsApi(classData.subjectId);
        setGradeComponents(components || []);
        if (components && components.length > 0) {
          setSelectedGradeComponent(components[0].id);
        }
      }

      // Initialize student grades
      const initialGrades: Record<string, StudentGrade> = {};
      (classData.students || []).forEach((student) => {
        initialGrades[student.studentId] = {
          studentId: student.studentId,
        };
      });
      setStudentGrades(initialGrades);
    } catch (error) {
      console.error("Error loading class data:", error);
      message.error("Không thể tải thông tin lớp học");
    } finally {
      setLoadingClassData(false);
    }
  };

  const updateStudentGrade = (
    studentId: string,
    gradeComponentId: string,
    score: number
  ) => {
    setStudentGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        [gradeComponentId]: score,
      },
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedClass || !selectedClass.subjectId) {
      message.error("Vui lòng chọn lớp học");
      return;
    }

    setLoading(true);
    try {
      const gradesToSubmit = students.map((student) => {
        const studentGrade = studentGrades[student.studentId] || {};
        const grades = gradeComponents.map((component) => ({
          gradeComponentId: component.id,
          score: Number(studentGrade[component.id]) || 0,
        }));

        return {
          studentId: student.studentId,
          subjectId: selectedClass.subjectId,
          grades,
        };
      });

      await submitClassGradesApi(selectedClass.id, gradesToSubmit);
      message.success("Điểm số đã được lưu thành công!");
    } catch (error) {
      console.error("Error saving grades:", error);
      message.error("Có lỗi xảy ra khi lưu điểm!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGrade = (
    studentId: string,
    gradeComponentId: string,
    score: number
  ) => {
    updateStudentGrade(studentId, gradeComponentId, score);
    message.success("Đã cập nhật điểm!");
  };

  // Build dynamic columns based on grade components
  const buildColumns = (): ColumnsType<ClassStudent> => {
    const baseColumns: ColumnsType<ClassStudent> = [
      {
        title: "STT",
        key: "index",
        render: (_, __, index) => index + 1,
        width: 60,
        fixed: "left",
      },
      {
        title: "Sinh viên",
        key: "student",
        fixed: "left",
        width: 200,
        render: (_, student) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size="large" style={{ backgroundColor: "#1890ff" }}>
              {student.fullName.charAt(0)}
            </Avatar>
            <div>
              <div style={{ fontWeight: 500 }}>{student.fullName}</div>
              <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                {student.studentCode}
              </div>
            </div>
          </div>
        ),
      },
    ];

    // Add columns for each grade component
    const componentColumns = gradeComponents.map((component) => ({
      title: (
        <div>
          <div>{component.name}</div>
          <div style={{ fontSize: 11, color: "#8c8c8c" }}>
            {component.weightPercent}%
          </div>
        </div>
      ),
      key: `component_${component.id}`,
      width: 150,
      render: (_: unknown, student: ClassStudent) => {
        const studentGrade = studentGrades[student.studentId] || {};
        const score = Number(studentGrade[component.id]) || 0;
        const maxScore = component.maxScore || 10;

        return (
          <div>
            <InputNumber
              min={0}
              max={maxScore}
              value={score}
              onChange={(value) => {
                if (value !== null) {
                  updateStudentGrade(student.studentId, component.id, value);
                }
              }}
              style={{ width: 80 }}
              precision={1}
            />
            <span style={{ marginLeft: 8, color: "#8c8c8c" }}>
              / {maxScore}
            </span>
          </div>
        );
      },
    }));

    // Add actions column
    const actionsColumn: ColumnsType<ClassStudent>[number] = {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 200,
      render: (_: unknown, student: ClassStudent) => {
        const selectedComponent = gradeComponents.find(
          (c) => c.id === selectedGradeComponent
        );
        if (!selectedComponent) return null;

        return (
          <Space>
            <Tooltip title={`Chấm nhanh ${selectedComponent.maxScore || 10}`}>
              <Button
                size="small"
                onClick={() =>
                  handleQuickGrade(
                    student.studentId,
                    selectedComponent.id,
                    selectedComponent.maxScore || 10
                  )
                }
              >
                {selectedComponent.maxScore || 10}
              </Button>
            </Tooltip>
            <Tooltip title="Chấm nhanh 8">
              <Button
                size="small"
                onClick={() =>
                  handleQuickGrade(student.studentId, selectedComponent.id, 8)
                }
              >
                8
              </Button>
            </Tooltip>
            <Tooltip title="Chấm nhanh 5">
              <Button
                size="small"
                onClick={() =>
                  handleQuickGrade(student.studentId, selectedComponent.id, 5)
                }
              >
                5
              </Button>
            </Tooltip>
          </Space>
        );
      },
    };

    return [...baseColumns, ...componentColumns, actionsColumn];
  };

  const columns = buildColumns();

  return (
    <div className="teacher-grading">
      <div className="grading-header">
        <h1>Chấm điểm & Đánh giá</h1>
        <div className="grading-controls">
          <Space>
            <Spin spinning={loadingClasses}>
              <Select
                value={selectedClassId}
                onChange={setSelectedClassId}
                style={{ width: 300 }}
                placeholder="Chọn lớp học"
                loading={loadingClasses}
              >
                {classes.map((cls) => (
                  <Option key={cls.classId} value={cls.classId}>
                    {cls.classCode} - {cls.subjectName}
                  </Option>
                ))}
              </Select>
            </Spin>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveGrades}
              loading={loading}
              disabled={!selectedClassId || students.length === 0}
            >
              Lưu tất cả điểm
            </Button>
            <Button icon={<DownloadOutlined />} disabled={!selectedClassId}>
              Xuất bảng điểm
            </Button>
          </Space>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Chấm điểm" key="grading">
          <Spin spinning={loadingClassData}>
            {selectedClass && (
              <Alert
                message={`Lớp: ${selectedClass.classCode} - ${selectedClass.subjectName}`}
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {/* Grading Table */}
            <Card>
              <Table
                dataSource={students}
                columns={columns}
                rowKey="studentId"
                pagination={false}
                size="middle"
                scroll={{ x: 1200 }}
                loading={loadingClassData}
              />
            </Card>
          </Spin>
        </TabPane>

        <TabPane tab="Thống kê" key="statistics">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Phân bố điểm số" extra={<BarChartOutlined />}>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    <BarChartOutlined
                      style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <div>Biểu đồ phân bố điểm số</div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Tiến độ chấm điểm" extra={<TrophyOutlined />}>
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ textAlign: "center", color: "#8c8c8c" }}>
                    <TrophyOutlined
                      style={{ fontSize: 48, marginBottom: 16 }}
                    />
                    <div>Thống kê tiến độ chấm điểm</div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default TeacherGrading;
