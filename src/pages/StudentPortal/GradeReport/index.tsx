import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Row,
  Col,
  Collapse,
  Spin,
  Alert,
  Empty,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import GradeServices from "../../../services/grade/api.service";
import StudentServices from "../../../services/student/api.service";
import type { SemesterDto } from "../../../Types/Semester";
import type { ComponentGradeDto, SubjectGradeDto } from "../../../Types/Grade";
import "./GradeReport.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface GradeRecord {
  gradeCategory: string;
  gradeItem: string;
  weight: string;
  value: number | string;
  comment?: string;
  isTotal?: boolean;
  isCourseTotal?: boolean;
}

const GradeReport: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState<
    Record<string, SubjectGradeDto[]>
  >({});
  const [activeSemesterKey, setActiveSemesterKey] = useState<string | string[]>(
    []
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [gradeData, setGradeData] = useState<GradeRecord[]>([]);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<Record<string, boolean>>({});
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  // Load current student profile to get studentId
  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!accessToken) return;

      setIsLoadingStudent(true);
      try {
        const student = await StudentServices.getCurrentStudentProfile();
        setStudentId(student.id);
        console.log("Loaded studentId from /api/Students/me:", student.id);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load student profile";
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setIsLoadingStudent(false);
      }
    };

    loadStudentProfile();
  }, [accessToken]);

  // Load semesters on mount
  useEffect(() => {
    const loadSemesters = async () => {
      setIsLoadingSemesters(true);
      setError(null);
      try {
        const response = await GradeServices.getSemesters({
          pageSize: 100, // Get all semesters
          sortBy: "StartDate",
          isDescending: true,
        });
        setSemesters(response.data);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load semesters";
        setError(errorMessage);
        message.error(errorMessage);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, []);

  // Load subjects when semester is opened (activeSemesterKey changes)
  useEffect(() => {
    if (!studentId) return;

    const semesterIds = Array.isArray(activeSemesterKey)
      ? activeSemesterKey
      : activeSemesterKey
      ? [activeSemesterKey]
      : [];

    semesterIds.forEach((semesterId) => {
      // Check if subjects are already loaded
      if (subjectsBySemester[semesterId]) {
        return;
      }

      // Load subjects for this semester
      const loadSubjects = async () => {
        setIsLoadingSubjects((prev) => ({ ...prev, [semesterId]: true }));
        setError(null);
        try {
          console.log("Loading subjects for semester:", semesterId, "studentId:", studentId);
          const response = await GradeServices.getStudentGrades(studentId, {
            SemesterId: semesterId,
          });
          
          console.log("API response:", response);
          
          // Extract subjects from the grades response
          const subjects = response.subjects || [];
          console.log("Extracted subjects:", subjects);
          
          setSubjectsBySemester((prev) => ({
            ...prev,
            [semesterId]: subjects,
          }));
          
          if (subjects.length === 0) {
            message.info("No subjects found for this semester");
          }
        } catch (err: any) {
          console.error("Error loading subjects:", err);
          const errorMessage =
            err.response?.data?.message ||
            err.message ||
            "Failed to load subjects";
          setError(errorMessage);
          message.error(errorMessage);
        } finally {
          setIsLoadingSubjects((prev) => ({ ...prev, [semesterId]: false }));
        }
      };

      loadSubjects();
    });
  }, [activeSemesterKey, studentId]);

  // Load grades when subject is selected
  // The grades data is already loaded when semester is opened, so we just need to find and display it
  useEffect(() => {
    if (!selectedSubjectId) {
      setGradeData([]);
      return;
    }

    // Find the subject grade from all loaded semesters
    let subjectGrade: SubjectGradeDto | undefined;
    for (const semesterId in subjectsBySemester) {
      const subjects = subjectsBySemester[semesterId];
      subjectGrade = subjects.find((s) => s.subjectId === selectedSubjectId);
      if (subjectGrade) break;
    }

    if (subjectGrade) {
      // Transform API data to table format
      const transformedData = transformGradeData(subjectGrade);
      setGradeData(transformedData);
    } else {
      setGradeData([]);
    }
  }, [selectedSubjectId, subjectsBySemester]);

  // Transform API grade data to table format
  const transformGradeData = (subjectGrade: SubjectGradeDto): GradeRecord[] => {
    const records: GradeRecord[] = [];

    // Group component grades by category (componentName)
    const groupedByCategory: Record<string, ComponentGradeDto[]> = {};
    subjectGrade.componentGrades.forEach((component) => {
      const category = component.componentName;
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(component);
    });

    // Create records for each category
    Object.entries(groupedByCategory).forEach(([category, components]) => {
      // Add individual component grades
      components.forEach((component) => {
        records.push({
          gradeCategory: category,
          gradeItem: component.componentName,
          weight: `${component.componentWeight}%`,
          value: component.score ?? 0,
          comment: component.letterGrade || undefined,
        });
      });

      // Calculate total for this category
      const categoryTotal = components.reduce((sum, comp) => {
        return sum + (comp.score ?? 0) * (comp.componentWeight / 100);
      }, 0);
      const categoryWeight = components.reduce(
        (sum, comp) => sum + comp.componentWeight,
        0
      );

      records.push({
        gradeCategory: "",
        gradeItem: "Total",
        weight: `${categoryWeight}%`,
        value: categoryTotal.toFixed(2),
        isTotal: true,
      });
    });

    // Add course total
    if (subjectGrade.averageScore !== null) {
      records.push({
        gradeCategory: "COURSE TOTAL",
        gradeItem: "AVERAGE",
        weight: "",
        value: subjectGrade.averageScore.toFixed(2),
        isCourseTotal: true,
      });

      records.push({
        gradeCategory: "",
        gradeItem: "STATUS",
        weight: "",
        value: subjectGrade.finalLetterGrade || "N/A",
        isCourseTotal: true,
      });
    }

    return records;
  };

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const columns: ColumnsType<GradeRecord> = [
    {
      title: "GRADE CATEGORY",
      dataIndex: "gradeCategory",
      key: "gradeCategory",
      width: 200,
      render: (category: string, record: GradeRecord) => {
        if (record.isCourseTotal && category === "COURSE TOTAL") {
          return (
            <Text strong style={{ color: "#1a94fc", fontSize: 14 }}>
              {category}
            </Text>
          );
        }
        return category ? <Text strong>{category}</Text> : null;
      },
    },
    {
      title: "GRADE ITEM",
      dataIndex: "gradeItem",
      key: "gradeItem",
      width: 200,
      render: (item: string, record: GradeRecord) => {
        if (record.isCourseTotal) {
          return (
            <Text
              strong
              style={{
                color: record.gradeItem === "STATUS" ? "#52c41a" : "#1a94fc",
                fontSize: 14,
              }}
            >
              {item}
            </Text>
          );
        }
        if (record.isTotal) {
          return (
            <Text strong style={{ color: "#1a94fc" }}>
              {item}
            </Text>
          );
        }
        return <Text>{item}</Text>;
      },
    },
    {
      title: "WEIGHT",
      dataIndex: "weight",
      key: "weight",
      width: 120,
      align: "center",
      render: (weight: string) => (weight ? <Text>{weight}</Text> : null),
    },
    {
      title: "VALUE",
      dataIndex: "value",
      key: "value",
      width: 120,
      align: "center",
      render: (value: number | string, record: GradeRecord) => {
        if (record.isCourseTotal) {
          if (record.gradeItem === "STATUS") {
            return (
              <Tag color="success" style={{ fontSize: 12, fontWeight: 600 }}>
                {value}
              </Tag>
            );
          }
          return (
            <Text strong style={{ color: "#1a94fc", fontSize: 14 }}>
              {value}
            </Text>
          );
        }
        if (record.isTotal) {
          return (
            <Text strong style={{ color: "#1a94fc" }}>
              {value}
            </Text>
          );
        }
        if (value === 0 || value === "0") {
          return <Text style={{ color: "#ff4d4f" }}>{value}</Text>;
        }
        return <Text>{value}</Text>;
      },
    },
    {
      title: "COMMENT",
      dataIndex: "comment",
      key: "comment",
      align: "center",
      render: (comment?: string) => {
        if (comment === "Absent") {
          return <Tag color="error">{comment}</Tag>;
        }
        return comment ? <Tag color="blue">{comment}</Tag> : null;
      },
    },
  ];

  // Find selected subject from all loaded semesters
  let selectedSubject: SubjectGradeDto | undefined;
  for (const semesterId in subjectsBySemester) {
    const subjects = subjectsBySemester[semesterId];
    selectedSubject = subjects.find((s) => s.subjectId === selectedSubjectId);
    if (selectedSubject) break;
  }

  if (isLoadingStudent || !studentId) {
    return (
      <div className="grade-report">
        <div className="page-header">
          <Title level={2} style={{ margin: 0, color: "white" }}>
            Grade Report
          </Title>
        </div>
        <Card>
          {isLoadingStudent ? (
            <Spin size="large" style={{ display: "block", textAlign: "center", padding: "40px 0" }} />
          ) : (
            <Alert
              message="Authentication Required"
              description="Please login to view your grade report."
              type="warning"
              showIcon
            />
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="grade-report">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          Grade Report for {userProfile?.fullName || "Student"}
        </Title>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Sidebar - Semester and Subject Selection */}
        <Col xs={24} lg={6}>
          <Card className="sidebar-card" loading={isLoadingSemesters}>
            <div className="semester-list">
              <Collapse
                activeKey={activeSemesterKey}
                onChange={(keys) => setActiveSemesterKey(keys)}
                ghost
              >
                {semesters.map((semester) => {
                  const semesterSubjects = subjectsBySemester[semester.id] || [];
                  const isLoading = isLoadingSubjects[semester.id] || false;
                  
                  return (
                    <Panel header={semester.name} key={semester.id}>
                      {isLoading ? (
                        <Spin size="small" style={{ display: "block", textAlign: "center", padding: "20px 0" }} />
                      ) : semesterSubjects.length === 0 ? (
                        <Empty
                          description="No subjects"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          style={{ padding: "20px 0" }}
                        />
                      ) : (
                        semesterSubjects.map((subject) => (
                          <div
                            key={subject.subjectId}
                            className={`course-item ${
                              selectedSubjectId === subject.subjectId ? "active" : ""
                            }`}
                            onClick={() => handleSubjectClick(subject.subjectId)}
                          >
                            <Text strong className="course-code">
                              {subject.subjectCode}
                            </Text>
                            <Text className="course-name">
                              {subject.subjectName}
                            </Text>
                            {subject.averageScore !== null && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                {subject.averageScore.toFixed(2)} ({subject.finalLetterGrade || "N/A"})
                              </Text>
                            )}
                          </div>
                        ))
                      )}
                    </Panel>
                  );
                })}
              </Collapse>
            </div>
          </Card>
        </Col>

        {/* Main Content - Grade Table */}
        <Col xs={24} lg={18}>
          <div className="report-section">
            {!selectedSubjectId ? (
              <Card className="grade-table-card">
                <Empty
                  description="Select a subject to view grades"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            ) : (
              <Card
                className="grade-table-card"
                title={
                  selectedSubject
                    ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName} (${selectedSubject.semesterName})`
                    : "Grade Report"
                }
              >
                {gradeData.length === 0 ? (
                  <Empty description="No grades available" />
                ) : (
                  <Table
                    columns={columns}
                    dataSource={gradeData}
                    rowKey={(record, index) =>
                      `${record.gradeCategory}-${record.gradeItem}-${index}`
                    }
                    pagination={false}
                    scroll={{ x: 800 }}
                    size="small"
                    className="grade-table"
                    bordered
                    rowClassName={(record) => {
                      if (
                        record.isCourseTotal &&
                        record.gradeCategory === "COURSE TOTAL"
                      )
                        return "course-total-row";
                      if (record.isCourseTotal && record.gradeItem === "STATUS")
                        return "status-row";
                      if (record.isTotal) return "total-row";
                      return "";
                    }}
                  />
                )}
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GradeReport;
