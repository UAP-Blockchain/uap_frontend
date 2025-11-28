import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Select,
  Space,
  Avatar,
  InputNumber,
  Alert,
  message,
  Tabs,
  Spin,
} from "antd";
import {
  SaveOutlined,
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  getTeacherClassesApi,
  getClassByIdApi,
  getGradeComponentsApi,
  getClassGradesApi,
  submitStudentGradesApi,
  updateStudentGradesApi,
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
  [key: string]: string | number; // gradeComponentId -> score hoặc gradeId
}

interface GradeIdMap {
  [studentId: string]: {
    [gradeComponentId: string]: string; // gradeComponentId -> gradeId
  };
}

const TeacherGrading: React.FC = () => {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassDetail | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [gradeComponents, setGradeComponents] = useState<GradeComponent[]>([]);
  const [studentGrades, setStudentGrades] = useState<
    Record<string, StudentGrade>
  >({});
  const [gradeIdMap, setGradeIdMap] = useState<GradeIdMap>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
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
      const teacherClasses = await getTeacherClassesApi();
      const normalizedClasses = Array.isArray(teacherClasses)
        ? teacherClasses
        : [];
      setClasses(normalizedClasses);
      if (normalizedClasses.length > 0) {
        setSelectedClassId(normalizedClasses[0].classId);
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
      const [classData, existingGrades] = await Promise.all([
        getClassByIdApi(classId),
        getClassGradesApi(classId).catch(() => []), // Load existing grades if available
      ]);

      setSelectedClass(classData);
      setStudents(classData.students || []);

      // Load grade components for this subject
      if (classData.subjectId) {
        const components = await getGradeComponentsApi(classData.subjectId);
        setGradeComponents(components || []);
      }

      // Initialize student grades and gradeIdMap from existing grades
      const initialGrades: Record<string, StudentGrade> = {};
      const initialGradeIdMap: GradeIdMap = {};

      (classData.students || []).forEach((student) => {
        initialGrades[student.studentId] = {
          studentId: student.studentId,
        };
        initialGradeIdMap[student.studentId] = {};
      });

      // Populate with existing grades
      existingGrades.forEach((grade) => {
        if (initialGrades[grade.studentId]) {
          initialGrades[grade.studentId][grade.gradeComponentId] = grade.score;
        }
        if (!initialGradeIdMap[grade.studentId]) {
          initialGradeIdMap[grade.studentId] = {};
        }
        initialGradeIdMap[grade.studentId][grade.gradeComponentId] =
          grade.gradeId;
      });

      setStudentGrades(initialGrades);
      setGradeIdMap(initialGradeIdMap);
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

  const handleSaveOrUpdateStudentGrades = async (student: ClassStudent) => {
    if (!selectedClass || !selectedClass.subjectId) {
      message.error("Vui lòng chọn lớp học");
      return;
    }

    const studentGrade = studentGrades[student.studentId] || {};
    const studentGradeIds = gradeIdMap[student.studentId] || {};

    // Separate grades into new (POST) and existing (PUT)
    const gradesToSave: Array<{
      studentId: string;
      subjectId: string;
      gradeComponentId: string;
      score: number;
    }> = [];
    const gradesToUpdate: Array<{
      gradeId: string;
      score: number;
    }> = [];

    gradeComponents.forEach((component) => {
      const score = Number(studentGrade[component.id]) || 0;
      const gradeId = studentGradeIds[component.id];

      if (score <= 0) return; // Skip empty scores

      if (gradeId) {
        // Already saved, use PUT
        gradesToUpdate.push({
          gradeId,
          score,
        });
      } else {
        // New grade, use POST
        gradesToSave.push({
          studentId: student.studentId,
          subjectId: selectedClass.subjectId,
          gradeComponentId: component.id,
          score,
        });
      }
    });

    if (gradesToSave.length === 0 && gradesToUpdate.length === 0) {
      message.warning("Vui lòng nhập điểm để lưu");
      return;
    }

    setLoading((prev) => ({ ...prev, [student.studentId]: true }));
    try {
      // Create new grades using POST if any
      if (gradesToSave.length > 0) {
        const createRequest = {
          grades: gradesToSave,
        };
        const response = await submitStudentGradesApi(createRequest);

        // Update gradeIdMap with new grade IDs
        if (
          response.gradeIds &&
          response.gradeIds.length === gradesToSave.length
        ) {
          const newGradeIdMap = { ...gradeIdMap };
          if (!newGradeIdMap[student.studentId]) {
            newGradeIdMap[student.studentId] = {};
          }
          gradesToSave.forEach((g, index) => {
            newGradeIdMap[student.studentId][g.gradeComponentId] =
              response.gradeIds![index];
          });
          setGradeIdMap(newGradeIdMap);
        }
      }

      // Update existing grades using PUT if any
      if (gradesToUpdate.length > 0) {
        const updateRequest = {
          grades: gradesToUpdate,
        };
        await updateStudentGradesApi(updateRequest);
      }

      const actionText =
        gradesToSave.length > 0 && gradesToUpdate.length > 0
          ? "lưu và cập nhật"
          : gradesToSave.length > 0
          ? "lưu"
          : "cập nhật";
      message.success(`Đã ${actionText} điểm cho ${student.fullName}`);
    } catch (error) {
      console.error("Error saving/updating grades:", error);
      message.error("Có lỗi xảy ra khi lưu điểm!");
    } finally {
      setLoading((prev) => ({ ...prev, [student.studentId]: false }));
    }
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
      width: 150,
      render: (_: unknown, student: ClassStudent) => {
        const studentGradeIds = gradeIdMap[student.studentId] || {};
        const hasExistingGrades = Object.keys(studentGradeIds).length > 0;
        const studentLoading = loading[student.studentId] || false;

        return (
          <Button
            type="primary"
            icon={hasExistingGrades ? <EditOutlined /> : <SaveOutlined />}
            size="small"
            onClick={() => handleSaveOrUpdateStudentGrades(student)}
            loading={studentLoading}
          >
            {hasExistingGrades ? "Cập nhật điểm" : "Lưu điểm"}
          </Button>
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

        {/* <TabPane tab="Thống kê" key="statistics">
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
        </TabPane> */}
      </Tabs>
    </div>
  );
};

export default TeacherGrading;
