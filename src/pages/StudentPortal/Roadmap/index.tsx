import {
  CalendarOutlined,
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
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoadmapServices from "../../../services/roadmap/api.service";
import type { StudentRoadmapDto } from "../../../types/Roadmap";
import "./Roadmap.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type CourseStatus = "PASSED" | "STUDYING" | "NOT_STARTED" | "FAILED";

interface RoadmapCourse {
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
  grade?: string;
  status: CourseStatus;
}

interface RoadmapSemester {
  id: string;
  name: string;
  label: string;
  isCurrent?: boolean;
  registration: {
    start: string;
    end: string;
    isOpen: boolean;
  };
  courses: RoadmapCourse[];
}

const statusMap: Record<
  CourseStatus,
  { label: string; color: string; background: string }
> = {
  PASSED: { label: "Passed", color: "#1d4ed8", background: "#dbeafe" },
  STUDYING: { label: "Studying", color: "#0ea5e9", background: "#e0f2fe" },
  NOT_STARTED: {
    label: "Not started",
    color: "#94a3b8",
    background: "#f8fafc",
  },
  FAILED: {
    label: "Failed",
    color: "#ef4444",
    background: "#fee2e2",
  },
};

const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<StudentRoadmapDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await RoadmapServices.getMyRoadmap();
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
    const now = dayjs();

    return roadmap.semesterGroups.map((group) => {
      const startDate = group.startDate || "";
      const endDate = group.endDate || "";
      const isOpen =
        !!startDate &&
        !!endDate &&
        now.isAfter(dayjs(startDate)) &&
        now.isBefore(dayjs(endDate).endOf("day"));

      const courses = group.subjects
        .slice()
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
        .map((subject) => ({
          code: subject.subjectCode,
          name: subject.subjectName,
          credits: subject.credits,
          prerequisites: [],
          grade:
            subject.letterGrade ||
            (subject.finalScore !== null && subject.finalScore !== undefined
              ? subject.finalScore.toFixed(1)
              : undefined),
          status: mapBackendStatus(subject.status),
        }));

      return {
        id: group.semesterId,
        name: group.semesterName,
        label: group.semesterCode,
        isCurrent: group.isCurrentSemester,
        registration: {
          start: startDate,
          end: endDate,
          isOpen,
        },
        courses,
      };
    });
  }, [roadmap]);

  const currentSemester = useMemo(
    () => semesters.find((sem) => sem.isCurrent) || semesters[0],
    [semesters]
  );

  const stats = useMemo(() => {
    const completedCredits = semesters.reduce(
      (sum, semester) =>
        sum +
        semester.courses
          .filter((course) => course.status === "PASSED")
          .reduce((acc, course) => acc + course.credits, 0),
      0
    );

    const totalCredits = semesters.reduce(
      (sum, semester) =>
        sum + semester.courses.reduce((acc, course) => acc + course.credits, 0),
      0
    );

    const completedCourses = semesters
      .flatMap((semester) => semester.courses)
      .filter((course) => course.status === "PASSED" && course.grade);

    const totalScore = completedCourses.reduce((sum, course) => {
      const numericGrade = Number(course.grade);
      return sum + (Number.isFinite(numericGrade) ? numericGrade : 0);
    }, 0);

    const averageScore = completedCourses.length
      ? totalScore / completedCourses.length
      : 0;

    const gpa = completedCourses.length
      ? Number(((averageScore / 10) * 4).toFixed(2))
      : 0;

    return {
      completedCredits,
      totalCredits,
      gpa,
    };
  }, [semesters]);

  const handleRegister = (courseCode: string) => {
    navigate("/student-portal/course-registration", {
      state: { from: "roadmap", courseCode },
    });
  };

  const getColumns = (
    semester: RoadmapSemester
  ): ColumnsType<RoadmapCourse> => [
    {
      title: "Subject Code",
      dataIndex: "code",
      key: "code",
      width: 140,
      render: (code) => <Text strong>{code}</Text>,
    },
    {
      title: "Prerequisite",
      dataIndex: "prerequisites",
      key: "prerequisites",
      width: 200,
      render: (prerequisites: string[]) =>
        prerequisites.length ? (
          <Space size={[4, 4]} wrap>
            {prerequisites.map((item) => (
              <Tag
                key={item}
                style={{
                  background: "#f0f5ff",
                  borderColor: "#91d5ff",
                  color: "#1a94fc",
                  borderRadius: "6px",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {item}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Subject Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Credit",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
    },
    {
      title: "Grade",
      dataIndex: "grade",
      key: "grade",
      width: 120,
      render: (grade?: string) =>
        grade ? <Text strong>{grade}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: "Status",
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
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      render: (_: unknown, record) => {
        const canRegister =
          record.status === "NOT_STARTED" &&
          semester.isCurrent &&
          semester.registration.isOpen;

        if (canRegister) {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handleRegister(record.code)}
              style={{
                background: "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                boxShadow: "0 2px 8px rgba(26, 148, 252, 0.3)",
              }}
            >
              <PlusOutlined /> Đăng ký
            </Button>
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

  if (!semesters.length) {
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
              STUDY ROADMAP
            </Text>
            <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
              Lộ trình học tập
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              Tập trung theo dõi tín chỉ, GPA và nhanh chóng xem trạng thái từng kỳ.
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
                  Đợt đăng ký đang mở
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
                  {currentSemester?.name || "N/A"}
                </Title>
                <Text
                  strong
                  style={{
                    color: "#1a94fc",
                    fontSize: "14px",
                  }}
                >
                  {currentSemester?.registration.start &&
                  currentSemester?.registration.end
                    ? `${dayjs(currentSemester.registration.start).format(
                        "DD/MM"
                      )} – ${dayjs(currentSemester.registration.end).format(
                        "DD/MM/YYYY"
                      )}`
                    : "—"}
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
        defaultActiveKey={currentSemester?.id}
      >
        {semesters.map((semester) => (
          <Panel
            header={
              <div className="semester-panel-header">
                <div>
                  <Text strong>{semester.name}</Text>
                  <div className="semester-label">{semester.label}</div>
                </div>
                <Space size={8}>
                  {semester.isCurrent && (
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
                      Kỳ hiện tại
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
                    Đăng ký: {semester.registration.start
                      ? dayjs(semester.registration.start).format("DD/MM")
                      : "—"}
                    {" "}–{" "}
                    {semester.registration.end
                      ? dayjs(semester.registration.end).format("DD/MM")
                      : "—"}
                  </Tag>
                </Space>
              </div>
            }
            key={semester.id}
          >
            <Table
              columns={getColumns(semester)}
              dataSource={semester.courses}
              rowKey={(record) => `${semester.id}-${record.code}`}
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

const mapBackendStatus = (status: string): CourseStatus => {
  switch (status) {
    case "Completed":
      return "PASSED";
    case "InProgress":
      return "STUDYING";
    case "Planned":
      return "NOT_STARTED";
    case "Failed":
      return "FAILED";
    default:
      return "NOT_STARTED";
  }
};
