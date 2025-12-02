import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Card,
  Col,
  Collapse,
  Empty,
  message,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/store";
import { StudentGradeServices } from "../../../services/student/api.service";
import RoadmapServices from "../../../services/roadmap/api.service";
import type { ComponentGradeDto, SubjectGradeDto } from "../../../types/Grade";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "../../../types/Roadmap";
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
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(
    null
  );
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, CurriculumSemesterDto>
  >({});
  const [loadingSemesters, setLoadingSemesters] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeSemesterKey, setActiveSemesterKey] = useState<
    string | undefined
  >(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(
    null
  );
  const [selectedSubject, setSelectedSubject] =
    useState<SubjectGradeDto | null>(null);
  const [gradeData, setGradeData] = useState<GradeRecord[]>([]);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const handleLoadSemester = useCallback(async (semesterNumber: number) => {
    setLoadingSemesters((prev) => {
      if (prev[semesterNumber]) return prev; // already loading
      return { ...prev, [semesterNumber]: true };
    });

    try {
      const data: CurriculumSemesterDto =
        await RoadmapServices.getMyCurriculumSemester(semesterNumber);
      setSemesterDetails((prev) => {
        if (prev[semesterNumber]) return prev; // already loaded
        return {
          ...prev,
          [semesterNumber]: data,
        };
      });
    } catch (err) {
      const msg =
        (err as { message?: string })?.message ||
        "Không thể tải dữ liệu kỳ học.";
      message.error(msg);
    } finally {
      setLoadingSemesters((prev) => ({
        ...prev,
        [semesterNumber]: false,
      }));
    }
  }, []);

  // Load summary on mount (dùng API roadmap giống trang điểm danh)
  useEffect(() => {
    const fetchSummary = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      setError(null);
      try {
        const data = await RoadmapServices.getMyCurriculumRoadmapSummary();
        setSummary(data);

        if (data.semesterSummaries.length > 0) {
          const firstSemester = data.semesterSummaries[0].semesterNumber;
          setActiveSemesterKey(String(firstSemester));
          await handleLoadSemester(firstSemester);
        }
      } catch (err) {
        const messageText =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string }).message ||
          "Không thể tải dữ liệu lộ trình";
        setError(messageText);
        message.error(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSummary();
  }, [accessToken, handleLoadSemester]);

  const handleSemesterChange = (key: string | string[]) => {
    if (key === undefined || key === null) {
      setActiveSemesterKey(undefined);
      return;
    }

    const keyString =
      typeof key === "string"
        ? key
        : Array.isArray(key) && key.length > 0
        ? String(key[0])
        : undefined;

    if (keyString !== undefined) {
      const semesterNumber = parseInt(keyString, 10);
      if (!Number.isNaN(semesterNumber)) {
        setActiveSemesterKey(keyString);
        void handleLoadSemester(semesterNumber);
      }
    }
  };

  const loadGradesForSubject = useCallback(async (subjectId: string) => {
    setIsLoadingGrades(true);
    setError(null);
    try {
      const response = await StudentGradeServices.getMyGrades({
        SubjectId: subjectId,
      });

      const subject =
        response.subjects.find((s) => s.subjectId === subjectId) ||
        response.subjects[0] ||
        null;

      if (subject) {
        setSelectedSubject(subject);
        setGradeData(transformGradeData(subject));
      } else {
        setSelectedSubject(null);
        setGradeData([]);
      }
    } catch (err) {
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        ).response?.data?.message ||
        (err as { message?: string }).message ||
        "Không thể tải dữ liệu điểm";
      setError(errorMessage);
      message.error(errorMessage);
      setSelectedSubject(null);
      setGradeData([]);
    } finally {
      setIsLoadingGrades(false);
    }
  }, []);

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
        gradeItem: "Tổng",
        weight: `${categoryWeight}%`,
        value: categoryTotal.toFixed(2),
        isTotal: true,
      });
    });

    // Add course total
    if (subjectGrade.averageScore !== null) {
      records.push({
        gradeCategory: "TỔNG KẾT MÔN HỌC",
        gradeItem: "ĐIỂM TRUNG BÌNH",
        weight: "",
        value: subjectGrade.averageScore.toFixed(2),
        isCourseTotal: true,
      });

      records.push({
        gradeCategory: "",
        gradeItem: "TRẠNG THÁI",
        weight: "",
        value: subjectGrade.finalLetterGrade || "N/A",
        isCourseTotal: true,
      });
    }

    return records;
  };

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    void loadGradesForSubject(subjectId);
  };

  const columns: ColumnsType<GradeRecord> = [
    {
      title: "LOẠI ĐIỂM",
      dataIndex: "gradeCategory",
      key: "gradeCategory",
      width: 200,
      render: (category: string, record: GradeRecord) => {
        if (record.isCourseTotal && category === "TỔNG KẾT MÔN HỌC") {
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
      title: "HẠNG MỤC ĐIỂM",
      dataIndex: "gradeItem",
      key: "gradeItem",
      width: 200,
      render: (item: string, record: GradeRecord) => {
        if (record.isCourseTotal) {
          return (
            <Text
              strong
              style={{
                color:
                  record.gradeItem === "TRẠNG THÁI" ? "#52c41a" : "#1a94fc",
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
      title: "TRỌNG SỐ",
      dataIndex: "weight",
      key: "weight",
      width: 120,
      align: "center",
      render: (weight: string) => (weight ? <Text>{weight}</Text> : null),
    },
    {
      title: "GIÁ TRỊ",
      dataIndex: "value",
      key: "value",
      width: 120,
      align: "center",
      render: (value: number | string, record: GradeRecord) => {
        if (record.isCourseTotal) {
          if (record.gradeItem === "TRẠNG THÁI") {
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
      title: "NHẬN XÉT",
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

  // Filter subjects để chỉ hiển thị môn đang học / đã hoàn thành (giống trang AttendanceReport)
  const getFilteredSubjects = useCallback(
    (subjects: CurriculumRoadmapSubjectDto[]) =>
      subjects.filter(
        (s) => s.status === "InProgress" || s.status === "Completed"
      ),
    []
  );

  const semestersForSidebar = useMemo(() => {
    if (!summary) return [];
    return summary.semesterSummaries;
  }, [summary]);

  if (!accessToken) {
    return (
      <div className="grade-report">
        <div className="page-header">
          <Title level={2} style={{ margin: 0, color: "white" }}>
            Báo cáo điểm
          </Title>
        </div>
        <Card>
          <Alert
            message="Yêu cầu xác thực"
            description="Vui lòng đăng nhập để xem báo cáo điểm của bạn."
            type="warning"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="grade-report">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          Báo cáo điểm cho {userProfile?.fullName || "Sinh viên"}
        </Title>
      </div>

      {error && (
        <Alert
          message="Lỗi"
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
          <Card className="sidebar-card" loading={isLoading}>
            <div className="semester-list">
              {semestersForSidebar.length > 0 ? (
                <Collapse
                  accordion
                  activeKey={activeSemesterKey}
                  onChange={handleSemesterChange}
                  ghost
                >
                  {semestersForSidebar.map((semester) => {
                    const semesterData =
                      semesterDetails[semester.semesterNumber];
                    const isLoadingSemester =
                      loadingSemesters[semester.semesterNumber] ?? false;
                    const subjects = semesterData
                      ? getFilteredSubjects(semesterData.subjects)
                      : [];

                    return (
                      <Panel
                        header={semester.semesterName}
                        key={String(semester.semesterNumber)}
                      >
                        {isLoadingSemester ? (
                          <Spin
                            size="small"
                            style={{
                              display: "block",
                              textAlign: "center",
                              padding: "20px 0",
                            }}
                          />
                        ) : subjects.length === 0 ? (
                          <Empty
                            description="Không có môn học"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            style={{ padding: "20px 0" }}
                          />
                        ) : (
                          subjects.map((subject) => (
                            <div
                              key={subject.subjectId}
                              className={`course-item ${
                                selectedSubjectId === subject.subjectId
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handleSubjectClick(subject.subjectId)
                              }
                            >
                              <Text strong className="course-code">
                                {subject.subjectCode}
                              </Text>
                              <Text className="course-name">
                                {subject.subjectName}
                              </Text>
                            </div>
                          ))
                        )}
                      </Panel>
                    );
                  })}
                </Collapse>
              ) : (
                <Empty
                  description="Chưa có dữ liệu học kỳ"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Card>
        </Col>

        {/* Main Content - Grade Table */}
        <Col xs={24} lg={18}>
          <div className="report-section">
            {!selectedSubjectId ? (
              <Card className="grade-table-card">
                <Empty
                  description="Chọn một môn học để xem điểm"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </Card>
            ) : (
              <Card
                className="grade-table-card"
                title={
                  selectedSubject
                    ? `${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`
                    : "Báo cáo điểm"
                }
              >
                <Spin spinning={isLoadingGrades}>
                  {gradeData.length === 0 ? (
                    <Empty description="Không có dữ liệu điểm" />
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
                          record.gradeCategory === "TỔNG KẾT MÔN HỌC"
                        )
                          return "course-total-row";
                        if (
                          record.isCourseTotal &&
                          record.gradeItem === "TRẠNG THÁI"
                        )
                          return "status-row";
                        if (record.isTotal) return "total-row";
                        return "";
                      }}
                    />
                  )}
                </Spin>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GradeReport;
