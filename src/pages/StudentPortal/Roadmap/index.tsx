import {
  CalendarOutlined,
  PlusOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Collapse,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Roadmap.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type CourseStatus = "PASSED" | "STUDYING" | "NOT_STARTED";

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

const roadmapSemesters: RoadmapSemester[] = [
  {
    id: "sem9",
    name: "Kỳ 9 · 2025",
    label: "Fall 2025",
    isCurrent: true,
    registration: {
      start: "2025-12-01",
      end: "2025-12-10",
      isOpen: true,
    },
    courses: [
      {
        code: "MLN131",
        name: "Scientific Socialism",
        credits: 3,
        prerequisites: [],
        status: "STUDYING",
      },
      {
        code: "VNR202",
        name: "History of Vietnam Communist Party",
        credits: 3,
        prerequisites: ["MLN131"],
        status: "NOT_STARTED",
      },
      {
        code: "HCM202",
        name: "Ho Chi Minh Ideology",
        credits: 3,
        prerequisites: ["MLN131"],
        status: "NOT_STARTED",
      },
      {
        code: "SEP490",
        name: "SE Capstone Project",
        credits: 6,
        prerequisites: ["OJT202", "SWD392"],
        status: "NOT_STARTED",
      },
    ],
  },
  {
    id: "sem8",
    name: "Kỳ 8 · 2025",
    label: "Summer 2025",
    registration: {
      start: "2025-08-01",
      end: "2025-08-08",
      isOpen: false,
    },
    courses: [
      {
        code: "WDP301",
        name: "Web Development Project",
        credits: 3,
        prerequisites: ["SWP391"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "EXE201",
        name: "Experiential Entrepreneurship 2",
        credits: 3,
        prerequisites: ["EXE101"],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "PRM392",
        name: "Mobile Programming",
        credits: 3,
        prerequisites: ["LAB211"],
        grade: "A-",
        status: "PASSED",
      },
      {
        code: "MLN122",
        name: "Political Economics of Marxism – Leninism",
        credits: 3,
        prerequisites: ["MLN131"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "WDU203c",
        name: "The UI/UX Design",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "MLN111",
        name: "Philosophy of Marxism – Leninism",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem7",
    name: "Kỳ 7 · 2025",
    label: "Spring 2025",
    registration: {
      start: "2025-04-01",
      end: "2025-04-08",
      isOpen: false,
    },
    courses: [
      {
        code: "PMG201c",
        name: "Project Management",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "SWD392",
        name: "Software Architecture and Design",
        credits: 3,
        prerequisites: ["SDN302"],
        grade: "A-",
        status: "PASSED",
      },
      {
        code: "EXE101",
        name: "Experiential Entrepreneurship 1",
        credits: 3,
        prerequisites: [],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "SDN302",
        name: "Server-Side Development with NodeJS",
        credits: 3,
        prerequisites: ["LAB211"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "MMA301",
        name: "Multiplatform Mobile App Development",
        credits: 3,
        prerequisites: ["LAB211"],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem6",
    name: "Kỳ 6 · 2024",
    label: "Fall 2024",
    registration: {
      start: "2024-12-01",
      end: "2024-12-08",
      isOpen: false,
    },
    courses: [
      {
        code: "ENW492c",
        name: "Writing Research Papers",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "OJT202",
        name: "On the Job Training",
        credits: 5,
        prerequisites: [],
        grade: "P",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem5",
    name: "Kỳ 5 · 2024",
    label: "Summer 2024",
    registration: {
      start: "2024-08-01",
      end: "2024-08-08",
      isOpen: false,
    },
    courses: [
      {
        code: "SWP391",
        name: "Software Development Project",
        credits: 3,
        prerequisites: ["SDN302"],
        grade: "A-",
        status: "PASSED",
      },
      {
        code: "ITE302c",
        name: "Ethics in IT",
        credits: 2,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "SWR302",
        name: "Software Requirements",
        credits: 3,
        prerequisites: [],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "SWT301",
        name: "Software Testing",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "FER202",
        name: "Front-End Web Development with React",
        credits: 3,
        prerequisites: ["PRJ301"],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem4",
    name: "Kỳ 4 · 2024",
    label: "Spring 2024",
    registration: {
      start: "2024-04-01",
      end: "2024-04-08",
      isOpen: false,
    },
    courses: [
      {
        code: "MAS291",
        name: "Statistics & Probability",
        credits: 3,
        prerequisites: ["MAT110"],
        grade: "B",
        status: "PASSED",
      },
      {
        code: "SWE201c",
        name: "Introduction to Software Engineering",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "JPD123",
        name: "Elementary Japanese 1 - A1.2",
        credits: 3,
        prerequisites: ["JPD113"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "IOT102",
        name: "Internet of Things",
        credits: 3,
        prerequisites: [],
        grade: "A-",
        status: "PASSED",
      },
      {
        code: "PRJ301",
        name: "Java Web Application Development",
        credits: 3,
        prerequisites: ["LAB211"],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem3",
    name: "Kỳ 3 · 2023",
    label: "Fall 2023",
    registration: {
      start: "2023-12-01",
      end: "2023-12-08",
      isOpen: false,
    },
    courses: [
      {
        code: "JPD113",
        name: "Elementary Japanese 1 - A1.1",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "WED201c",
        name: "Web Design",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "CSD201",
        name: "Data Structures and Algorithms",
        credits: 3,
        prerequisites: ["PRF192"],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "DBI202",
        name: "Database Systems",
        credits: 3,
        prerequisites: ["PRF192"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "LAB211",
        name: "OOP with Java Lab",
        credits: 3,
        prerequisites: ["PRO192"],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem2",
    name: "Kỳ 2 · 2023",
    label: "Summer 2023",
    registration: {
      start: "2023-08-01",
      end: "2023-08-08",
      isOpen: false,
    },
    courses: [
      {
        code: "PRO192",
        name: "Object-Oriented Programming",
        credits: 3,
        prerequisites: ["PRF192"],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "MAD101",
        name: "Discrete Mathematics",
        credits: 3,
        prerequisites: [],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "OSG202",
        name: "Operating Systems",
        credits: 3,
        prerequisites: [],
        grade: "B",
        status: "PASSED",
      },
      {
        code: "NWC203c",
        name: "Computer Networking",
        credits: 3,
        prerequisites: [],
        grade: "A-",
        status: "PASSED",
      },
      {
        code: "SSG104",
        name: "Communication and In-Group Working Skills",
        credits: 2,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
    ],
  },
  {
    id: "sem1",
    name: "Kỳ 1 · 2023",
    label: "Spring 2023",
    registration: {
      start: "2023-04-01",
      end: "2023-04-08",
      isOpen: false,
    },
    courses: [
      {
        code: "CSI104",
        name: "Introduction to Computing",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "SSL101c",
        name: "Academic Skills for University Success",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "PRF192",
        name: "Programming Fundamentals",
        credits: 3,
        prerequisites: [],
        grade: "A",
        status: "PASSED",
      },
      {
        code: "MAE101",
        name: "Mathematics for Engineering",
        credits: 3,
        prerequisites: [],
        grade: "B+",
        status: "PASSED",
      },
      {
        code: "CEA201",
        name: "Computer Organization and Architecture",
        credits: 3,
        prerequisites: [],
        grade: "B",
        status: "PASSED",
      },
    ],
  },
];

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
};

const Roadmap: React.FC = () => {
  const navigate = useNavigate();
  const currentSemester = roadmapSemesters.find((sem) => sem.isCurrent);
  const handleRegister = (courseCode: string) => {
    navigate("/student-portal/course-registration", {
      state: { from: "roadmap", courseCode },
    });
  };

  const stats = useMemo(
    () => ({
      completedCredits: 68,
      totalCredits: 120,
      gpa: 3.48,
    }),
    []
  );

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
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(26, 148, 252, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(26, 148, 252, 0.3)";
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
              Tập trung theo dõi tín chỉ, GPA và nhanh chóng xem trạng thái từng
              kỳ.
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
        {roadmapSemesters.map((semester) => (
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
                        letterSpacing: "0.3px",
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
                    Đăng ký:{" "}
                    {dayjs(semester.registration.start).format("DD/MM")} –{" "}
                    {dayjs(semester.registration.end).format("DD/MM")}
                  </Tag>
                </Space>
              </div>
            }
            key={semester.id}
          >
            <Table
              columns={getColumns(semester)}
              dataSource={semester.courses}
              rowKey={(record) => record.code}
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
