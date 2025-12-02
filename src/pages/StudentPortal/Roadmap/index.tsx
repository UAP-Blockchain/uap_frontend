import {
  CalendarOutlined,
  EyeOutlined,
  PlusOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Empty,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoadmapServices from "../../../services/roadmap/api.service";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "../../../types/Roadmap";
import "./Roadmap.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type CourseStatus = "Completed" | "InProgress" | "Open" | "Locked" | "Failed";

interface RoadmapCourse {
  subjectId: string;
  code: string;
  name: string;
  credits: number;
  prerequisite: string | null;
  prerequisitesMet: boolean;
  grade?: string;
  status: CourseStatus;
  currentClassCode?: string | null;
  currentSemesterName?: string | null;
  attendancePercentage?: number | null;
  attendanceRequirementMet?: boolean;
}

interface RoadmapSemester {
  semesterNumber: number;
  courses: RoadmapCourse[];
}

const statusMap: Record<
  CourseStatus,
  { label: string; color: string; background: string }
> = {
  Completed: {
    label: "Đã hoàn thành",
    color: "#1d4ed8",
    background: "#dbeafe",
  },
  InProgress: {
    label: "Đang học",
    color: "#0ea5e9",
    background: "#e0f2fe",
  },
  Open: {
    label: "Có thể đăng ký",
    color: "#10b981",
    background: "#d1fae5",
  },
  Locked: {
    label: "Chưa mở khóa",
    color: "#94a3b8",
    background: "#f8fafc",
  },
  Failed: {
    label: "Rớt môn",
    color: "#dc2626",
    background: "#fee2e2",
  },
};

const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(
    null
  );
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, RoadmapSemester>
  >({});
  const [loadingSemesters, setLoadingSemesters] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await RoadmapServices.getMyCurriculumRoadmapSummary();
        setSummary(data);
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
  }, []);

  // Tự động load dữ liệu cho kỳ đầu tiên sau khi có summary
  useEffect(() => {
    if (!summary || !summary.semesterSummaries.length) return;
    const firstSemester = summary.semesterSummaries[0].semesterNumber;
    void handleLoadSemester(firstSemester);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  const mapSubjectsToCourses = (
    subjects: CurriculumRoadmapSubjectDto[]
  ): RoadmapCourse[] =>
    subjects.map((subject) => ({
      subjectId: subject.subjectId,
      code: subject.subjectCode,
      name: subject.subjectName,
      credits: subject.credits,
      prerequisite: subject.prerequisiteSubjectCode,
      prerequisitesMet: subject.prerequisitesMet,
      attendancePercentage: subject.attendancePercentage,
      attendanceRequirementMet: subject.attendanceRequirementMet,
      grade:
        subject.finalScore !== null && subject.finalScore !== undefined
          ? subject.finalScore.toFixed(2)
          : undefined,
      status: subject.status as CourseStatus,
      currentClassCode: subject.currentClassCode,
      currentSemesterName: subject.currentSemesterName,
    }));

  const semesters: RoadmapSemester[] = useMemo(() => {
    if (!summary) return [];

    return summary.semesterSummaries.map((sem) => ({
      semesterNumber: sem.semesterNumber,
      courses: semesterDetails[sem.semesterNumber]?.courses || [],
    }));
  }, [summary, semesterDetails]);

  const stats = useMemo(() => {
    if (!summary) {
      return {
        completedCredits: 0,
        totalCredits: 0,
        gpa: 0,
      };
    }

    return {
      completedCredits: summary.completedSubjects, // dùng số môn như proxy
      totalCredits: summary.totalSubjects,
      gpa: summary.currentGPA ?? 0,
    };
  }, [summary]);

  const handleLoadSemester = async (semesterNumber: number) => {
    if (semesterDetails[semesterNumber] || !summary) return;
    setLoadingSemesters((prev) => ({ ...prev, [semesterNumber]: true }));
    try {
      const data: CurriculumSemesterDto =
        await RoadmapServices.getMyCurriculumSemester(semesterNumber);
      setSemesterDetails((prev) => ({
        ...prev,
        [semesterNumber]: {
          semesterNumber: data.semesterNumber,
          courses: mapSubjectsToCourses(data.subjects),
        },
      }));
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
  };

  const handleRegister = (course: RoadmapCourse) => {
    navigate("/student-portal/enroll-list", {
      state: {
        subjectId: course.subjectId,
        subjectCode: course.code,
        subjectName: course.name,
        from: "roadmap",
      },
    });
  };

  const handleViewDetails = (subjectId: string) => {
    // Navigate to grade report with subject filter
    navigate("/student-portal/grade-report", {
      state: { subjectId },
    });
  };

  const getColumns = (): ColumnsType<RoadmapCourse> => [
    {
      title: "Mã môn học",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: "Môn tiên quyết",
      dataIndex: "prerequisite",
      key: "prerequisite",
      width: 200,
      render: (prerequisite: string | null, record: RoadmapCourse) =>
        prerequisite ? (
          <Space size={[4, 4]} wrap>
            <Tag
              style={{
                background: record.prerequisitesMet ? "#d1fae5" : "#fee2e2",
                borderColor: record.prerequisitesMet ? "#10b981" : "#ef4444",
                color: record.prerequisitesMet ? "#10b981" : "#ef4444",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              {prerequisite}
              {!record.prerequisitesMet}
            </Tag>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Tên môn học",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
    },
    {
      title: "Điểm danh",
      dataIndex: "attendancePercentage",
      key: "attendancePercentage",
      width: 140,
      align: "center",
      render: (
        attendancePercentage: number | null | undefined,
        record: RoadmapCourse
      ) => {
        if (
          attendancePercentage === null ||
          attendancePercentage === undefined
        ) {
          return <Text type="secondary">—</Text>;
        }

        const formatted = `${attendancePercentage.toFixed(2)}%`;
        const met = record.attendanceRequirementMet;

        return (
          <Tag
            color={met ? "success" : "error"}
            style={{ borderRadius: 6, fontWeight: 500 }}
          >
            {formatted}
          </Tag>
        );
      },
    },
    {
      title: "Điểm",
      dataIndex: "grade",
      key: "grade",
      width: 120,
      render: (grade?: string) =>
        grade ? <Text strong>{grade}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: CourseStatus) => (
        <Tag
          style={{
            color: statusMap[status].color,
            background: statusMap[status].background,
            borderColor: statusMap[status].color,
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "12px",
            padding: "4px 12px",
            borderWidth: "1.5px",
            boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)",
          }}
        >
          {statusMap[status].label}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_: unknown, record: RoadmapCourse) => {
        if (record.status === "Completed") {
          return (
            <Tooltip title="Xem chi tiết điểm">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record.subjectId)}
                style={{
                  color: "#1a94fc",
                  fontWeight: 500,
                }}
              >
                Xem
              </Button>
            </Tooltip>
          );
        }

        if (record.status === "Open" && record.prerequisitesMet) {
          return (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleRegister(record)}
              style={{
                background: "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(26, 148, 252, 0.3)",
              }}
            >
              Đăng ký
            </Button>
          );
        }

        if (record.status === "Locked" || !record.prerequisitesMet) {
          return (
            <Tooltip
              title={
                !record.prerequisitesMet && record.prerequisite
                  ? `Chưa hoàn thành môn tiên quyết: ${record.prerequisite}`
                  : "Môn học chưa được mở khóa"
              }
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                —
              </Text>
            </Tooltip>
          );
        }

        return <Text type="secondary">—</Text>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="student-roadmap">
        <div className="roadmap-loading">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-roadmap">
        <Alert
          type="error"
          message="Không thể tải dữ liệu lộ trình"
          description={error}
          showIcon
        />
      </div>
    );
  }

  if (!summary || !semesters.length) {
    return (
      <div className="student-roadmap">
        <Empty description="Chưa có dữ liệu lộ trình học tập" />
      </div>
    );
  }

  return (
    <div className="student-roadmap">
      <div className="roadmap-header">
        <div className="roadmap-header-content">
          <div className="roadmap-title-section">
            <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              LỘ TRÌNH HỌC TẬP
            </Text>
            <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
              Lộ trình học tập
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              {summary.curriculumName} ({summary.curriculumCode})
            </Text>
          </div>

          <div className="roadmap-metrics">
            <Card className="metric-card compact">
              <Statistic
                title="Tín chỉ hoàn thành"
                value={stats.completedCredits}
                suffix={`/ ${stats.totalCredits}`}
              />
            </Card>
            <Card className="metric-card compact">
              <Statistic title="GPA hiện tại" value={stats.gpa} precision={2} />
            </Card>
            <Card className="metric-card compact registration-card">
              <div style={{ position: "relative", zIndex: 10 }}>
                <Text
                  style={{
                    color: "#64748b",
                    fontSize: "13px",
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: 500,
                  }}
                >
                  Tổng quan
                </Text>
                <Title
                  level={4}
                  style={{
                    marginTop: 4,
                    marginBottom: 4,
                    color: "#1a94fc",
                    fontWeight: 700,
                  }}
                >
                  {summary.totalSubjects} môn học
                </Title>
                <Text
                  strong
                  style={{
                    color: "#1a94fc",
                    fontSize: "14px",
                  }}
                >
                  {summary.completedSubjects} đã hoàn thành ·{" "}
                  {summary.inProgressSubjects} đang học
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Collapse
        accordion
        bordered={false}
        className="roadmap-collapse"
        defaultActiveKey={semesters[0]?.semesterNumber}
        onChange={(key) => {
          const numKey =
            typeof key === "string"
              ? Number(key)
              : Array.isArray(key) && key.length > 0
              ? Number(key[0])
              : NaN;
          if (!Number.isNaN(numKey)) {
            void handleLoadSemester(numKey);
          }
        }}
      >
        {summary.semesterSummaries.map((semester) => (
          <Panel
            header={
              <div className="semester-panel-header">
                <div>
                  <Text strong>Kỳ {semester.semesterNumber}</Text>
                  <div className="semester-label">
                    {semester.subjectCount} môn học
                  </div>
                </div>
                <Space size={8}>
                  {semester.inProgressSubjects > 0 && (
                    <Tag
                      icon={<StarOutlined />}
                      style={{
                        background: "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                        border: "none",
                        color: "#ffffff",
                        fontWeight: 700,
                        padding: "4px 12px",
                        borderRadius: "20px",
                        boxShadow: "0 2px 8px rgba(26, 148, 252, 0.4)",
                        fontSize: "12px",
                      }}
                    >
                      Đang học
                    </Tag>
                  )}
                  <Tag
                    icon={<CalendarOutlined />}
                    style={{
                      background: "#f0f5ff",
                      borderColor: "#91d5ff",
                      color: "#1a94fc",
                      fontWeight: 500,
                      borderRadius: "8px",
                    }}
                  >
                    {semester.completedSubjects} đã hoàn thành
                  </Tag>
                </Space>
              </div>
            }
            key={semester.semesterNumber}
          >
            <Table
              columns={getColumns()}
              dataSource={
                semesterDetails[semester.semesterNumber]?.courses || []
              }
              rowKey={(record) => `${semester.semesterNumber}-${record.code}`}
              pagination={false}
              size="small"
              loading={!!loadingSemesters[semester.semesterNumber]}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default Roadmap;
