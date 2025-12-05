import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { fetchGradeComponentTreeApi } from "../../../services/admin/gradeComponents/api";
import type { ComponentGradeDto, SubjectGradeDto } from "../../../types/Grade";
import type { GradeComponentDto } from "../../../types/GradeComponent";
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
  isParent?: boolean;
  isChild?: boolean;
  children?: GradeRecord[];
  gradeComponentId?: string;
  parentId?: string | null;
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
  const [pendingSubjectId, setPendingSubjectId] = useState<string | null>(null);
  const [gradeComponentTree, setGradeComponentTree] = useState<
    GradeComponentDto[]
  >([]);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const location = useLocation();
  const navigate = useNavigate();

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

  const ensureSemesterVisible = useCallback(
    (semesterName?: string | null) => {
      if (!semesterName || !summary) return;
      const targetSemester = summary.semesterSummaries.find(
        (semester) =>
          semester.semesterName?.toLowerCase() === semesterName.toLowerCase()
      );
      if (targetSemester) {
        const key = String(targetSemester.semesterNumber);
        setActiveSemesterKey(key);
        void handleLoadSemester(targetSemester.semesterNumber);
      }
    },
    [summary, handleLoadSemester]
  );

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

  // Dịch letterGrade sang tiếng Việt
  const translateLetterGrade = useCallback(
    (letterGrade: string | null | undefined): string => {
      if (!letterGrade) return "N/A";

      const gradeMap: Record<string, string> = {
        "A+": "Xuất sắc",
        A: "Giỏi",
        "B+": "Khá giỏi",
        B: "Khá",
        "C+": "Trung bình khá",
        C: "Trung bình",
        "D+": "Trung bình yếu",
        D: "Yếu",
        F: "Kém",
      };

      return gradeMap[letterGrade.toUpperCase()] || letterGrade;
    },
    []
  );

  // Transform API grade data to table format using tree structure
  const transformGradeData = useCallback(
    (
      subjectGrade: SubjectGradeDto,
      tree: GradeComponentDto[]
    ): GradeRecord[] => {
      const flattenedRecords: GradeRecord[] = [];

      // Create a map from gradeComponentId to ComponentGradeDto
      const gradeMap = new Map<string, ComponentGradeDto>();
      subjectGrade.componentGrades.forEach((grade) => {
        gradeMap.set(grade.gradeComponentId, grade);
      });

      // Helper function to extract child display name (remove parent name prefix)
      const getChildDisplayName = (
        childName: string,
        parentName: string
      ): string => {
        // If child name starts with parent name, remove it
        if (childName.toLowerCase().startsWith(parentName.toLowerCase())) {
          const remaining = childName
            .substring(parentName.length)
            .trim();
          // If remaining is just a number or starts with a number, return it
          if (/^\d+/.test(remaining)) {
            return remaining;
          }
          // Otherwise return the remaining part
          return remaining || childName;
        }
        return childName;
      };

      // Recursive function to process tree nodes and flatten them
      const processNode = (
        node: GradeComponentDto,
        parentCategory: string = "",
        parentName: string = ""
      ) => {
        const grade = gradeMap.get(node.id);
        const category = parentCategory || node.name;

        // If node has children, don't add parent as separate row
        // Instead, show parent name in category and children in items
        if (node.subComponents && node.subComponents.length > 0) {
          // Process all children (parent name will be in category column)
          let childrenTotal = 0;
          node.subComponents.forEach((child) => {
            const childGrade = gradeMap.get(child.id);
            const childDisplayName = getChildDisplayName(child.name, node.name);
            
            // Add child record with parent name in category
            flattenedRecords.push({
              gradeCategory: node.name, // Parent name in category column
              gradeItem: childDisplayName, // Child name (shortened) in item column
              weight: `${child.weightPercent}%`,
              value: childGrade?.score ?? 0,
              comment: childGrade?.letterGrade || undefined,
              isChild: true,
              gradeComponentId: child.id,
              parentId: child.parentId,
            });
            
            // Calculate child contribution to parent total
            if (childGrade && childGrade.score !== null) {
              childrenTotal +=
                (childGrade.score ?? 0) * (child.weightPercent / 100);
            }
          });

          // Add total row for parent
          flattenedRecords.push({
            gradeCategory: "", // Empty category for total
            gradeItem: "Tổng",
            weight: `${node.weightPercent}%`,
            value: childrenTotal.toFixed(2),
            isTotal: true,
          });
        } else {
          // Leaf node (no children) - only add if it's a root component
          // (children are already added when processing parent)
          if (!node.parentId) {
            flattenedRecords.push({
              gradeCategory: category,
              gradeItem: node.name,
              weight: `${node.weightPercent}%`,
              value: grade?.score ?? 0,
              comment: grade?.letterGrade || undefined,
              gradeComponentId: node.id,
              parentId: node.parentId,
            });

            // Add total for root leaf component
            const componentTotal = grade && grade.score !== null
              ? (grade.score * (node.weightPercent / 100)).toFixed(2)
              : "0.00";
            flattenedRecords.push({
              gradeCategory: "",
              gradeItem: "Tổng",
              weight: `${node.weightPercent}%`,
              value: componentTotal,
              isTotal: true,
            });
          }
          // Note: Child nodes are already handled when processing parent above
        }
      };

      // Process all root nodes
      tree.forEach((rootNode) => {
        processNode(rootNode);
      });

      // Add course total
      if (subjectGrade.averageScore !== null) {
        flattenedRecords.push({
          gradeCategory: "TỔNG KẾT MÔN HỌC",
          gradeItem: "ĐIỂM TRUNG BÌNH",
          weight: "",
          value: subjectGrade.averageScore.toFixed(2),
          isCourseTotal: true,
        });

        flattenedRecords.push({
          gradeCategory: "",
          gradeItem: "ĐIỂM CHỮ",
          weight: "",
          value: translateLetterGrade(subjectGrade.finalLetterGrade),
          isCourseTotal: true,
        });
      }

      return flattenedRecords;
    },
    [translateLetterGrade]
  );

  const loadGradesForSubject = useCallback(
    async (subjectId: string) => {
      setIsLoadingGrades(true);
      setError(null);
      try {
        // Load both grades and grade component tree
        const [gradesResponse, tree] = await Promise.all([
          StudentGradeServices.getMyGrades({
            SubjectId: subjectId,
          }),
          fetchGradeComponentTreeApi(subjectId).catch(() => []), // Fallback to empty array if tree API fails
        ]);

        const subject =
          gradesResponse.subjects.find((s) => s.subjectId === subjectId) ||
          gradesResponse.subjects[0] ||
          null;

        if (subject) {
          setSelectedSubject(subject);
          setGradeComponentTree(tree);
          setGradeData(transformGradeData(subject, tree));
          ensureSemesterVisible(subject.semesterName);
        } else {
          setSelectedSubject(null);
          setGradeComponentTree([]);
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
        setGradeComponentTree([]);
        setGradeData([]);
      } finally {
        setIsLoadingGrades(false);
      }
    },
    [ensureSemesterVisible, transformGradeData]
  );

  useEffect(() => {
    const incomingSubjectId =
      (location.state as { subjectId?: string } | undefined)?.subjectId ?? null;
    if (incomingSubjectId) {
      setPendingSubjectId(incomingSubjectId);
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (pendingSubjectId) {
      setSelectedSubjectId(pendingSubjectId);
      void loadGradesForSubject(pendingSubjectId);
      setPendingSubjectId(null);
    }
  }, [pendingSubjectId, loadGradesForSubject]);

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
        // If this is a child row, show parent name without indentation (same as root components)
        if (record.isChild && category) {
          return (
            <Text strong>
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
        // For child rows, add more indentation (parent name is already indented in category column)
        const indent = record.isChild ? 48 : 0; // More indentation for child items
        
        if (record.isCourseTotal) {
          return (
            <Text
              strong
              style={{
                color: record.gradeItem === "ĐIỂM CHỮ" ? "#52c41a" : "#1a94fc",
                fontSize: 14,
              }}
            >
              {item}
            </Text>
          );
        }
        if (record.isTotal) {
          return (
            <Text strong style={{ color: "#1a94fc", paddingLeft: indent }}>
              {item}
            </Text>
          );
        }
        if (record.isChild) {
          return (
            <Text style={{ paddingLeft: indent }}>
              {item}
            </Text>
          );
        }
        return (
          <Text>
            {item}
          </Text>
        );
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
          if (record.gradeItem === "ĐIỂM CHỮ") {
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
                          record.gradeItem === "ĐIỂM CHỮ"
                        )
                          return "status-row";
                        if (record.isTotal) return "total-row";
                        if (record.isChild) return "child-row";
                        if (record.isParent) return "parent-row";
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
