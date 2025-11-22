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
import type { CurriculumRoadmapDto } from "../../../types/Roadmap";
import "./Roadmap.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type CourseStatus = "Completed" | "InProgress" | "Open" | "Locked";

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
};

const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<CurriculumRoadmapDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await RoadmapServices.getMyCurriculumRoadmap();
        setRoadmap(data);
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

    void fetchRoadmap();
  }, []);

  const semesters: RoadmapSemester[] = useMemo(() => {
    if (!roadmap) return [];

    return roadmap.semesters.map((semester) => ({
      semesterNumber: semester.semesterNumber,
      courses: semester.subjects.map((subject) => ({
        subjectId: subject.subjectId,
        code: subject.subjectCode,
        name: subject.subjectName,
        credits: subject.credits,
        prerequisite: subject.prerequisiteSubjectCode,
        prerequisitesMet: subject.prerequisitesMet,
        grade:
          subject.finalScore !== null && subject.finalScore !== undefined
            ? subject.finalScore.toFixed(2)
            : undefined,
        status: subject.status as CourseStatus,
        currentClassCode: subject.currentClassCode,
        currentSemesterName: subject.currentSemesterName,
      })),
    }));
  }, [roadmap]);

  const stats = useMemo(() => {
    if (!roadmap) {
      return {
        completedCredits: 0,
        totalCredits: 0,
        gpa: 0,
      };
    }

    const completedCredits = roadmap.semesters.reduce(
      (sum, semester) =>
        sum +
        semester.subjects
          .filter((subject) => subject.status === "Completed")
          .reduce((acc, subject) => acc + subject.credits, 0),
      0
    );

    const totalCredits = roadmap.semesters.reduce(
      (sum, semester) =>
        sum +
        semester.subjects.reduce((acc, subject) => acc + subject.credits, 0),
      0
    );

    // Calculate GPA from completed subjects with finalScore
    const completedSubjects = roadmap.semesters
      .flatMap((semester) => semester.subjects)
      .filter(
        (subject) =>
          subject.status === "Completed" &&
          subject.finalScore !== null &&
          subject.finalScore !== undefined
      );

    const totalScore = completedSubjects.reduce(
      (sum, subject) => sum + (subject.finalScore || 0),
      0
    );

    const averageScore = completedSubjects.length
      ? totalScore / completedSubjects.length
      : 0;

    // Convert 10-point scale to 4-point GPA scale
    const gpa = completedSubjects.length
      ? Number(((averageScore / 10) * 4).toFixed(2))
      : 0;

    return {
      completedCredits,
      totalCredits,
      gpa,
    };
  }, [roadmap]);

  const handleRegister = (courseCode: string) => {
    navigate("/student-portal/course-registration", {
      state: { from: "roadmap", courseCode },
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
              onClick={() => handleRegister(record.code)}
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

  if (!roadmap || !semesters.length) {
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
              {roadmap.curriculumName} ({roadmap.curriculumCode})
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
              <Statistic
                title="GPA hiện tại"
                value={stats.gpa}
                precision={2}
                suffix="/4.00"
              />
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
                  {roadmap.totalSubjects} môn học
                </Title>
                <Text
                  strong
                  style={{
                    color: "#1a94fc",
                    fontSize: "14px",
                  }}
                >
                  {roadmap.completedSubjects} đã hoàn thành ·{" "}
                  {roadmap.inProgressSubjects} đang học
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
      >
        {semesters.map((semester) => (
          <Panel
            header={
              <div className="semester-panel-header">
                <div>
                  <Text strong>Kỳ {semester.semesterNumber}</Text>
                  <div className="semester-label">
                    {semester.courses.length} môn học
                  </div>
                </div>
                <Space size={8}>
                  {semester.courses.some(
                    (course) => course.status === "InProgress"
                  ) && (
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
                    {
                      semester.courses.filter((c) => c.status === "Completed")
                        .length
                    }{" "}
                    đã hoàn thành
                  </Tag>
                </Space>
              </div>
            }
            key={semester.semesterNumber}
          >
            <Table
              columns={getColumns()}
              dataSource={semester.courses}
              rowKey={(record) => `${semester.semesterNumber}-${record.code}`}
              pagination={false}
              size="small"
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default Roadmap;
