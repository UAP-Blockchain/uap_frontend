import React, { useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Row,
  Col,
  List,
  Space,
  Progress,
} from "antd";
import {
  TrophyOutlined,
  CheckCircleOutlined,
  BookOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import "./GradeReport.scss";

const { Title, Text } = Typography;

interface TermCourse {
  term: string;
  course: string;
  fullCourseName: string;
  isActive: boolean;
}

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
  const [selectedCourse, setSelectedCourse] = useState("MLN111");

  // Mock terms and courses data
  const termCourses: TermCourse[] = [
    {
      term: "Fall2021",
      course: "EXE201",
      fullCourseName:
        "Experiential Entrepreneurship 2 (EXE201) (SE1752, from 15/05/2025 - 14/08/2025)",
      isActive: false,
    },
    {
      term: "Spring2022",
      course: "MLN111",
      fullCourseName:
        "Philosophy of Marxism – Leninism (MLN111) (SE1727, from 14/05/2025 - 14/06/2025)",
      isActive: true,
    },
    {
      term: "Summer2022",
      course: "MLN122",
      fullCourseName:
        "Political economics of Marxism – Leninism (MLN122) (SE1727, from 18/06/2025 - 26/07/2025)",
      isActive: false,
    },
    {
      term: "Fall2022",
      course: "PRM392",
      fullCourseName:
        "Mobile Programming (PRM392) (SE1752, from 14/05/2025 - 26/07/2025)",
      isActive: false,
    },
    {
      term: "Spring2023",
      course: "WDP301",
      fullCourseName:
        "Web Development Project (WDP301) (SE1737, from 14/05/2025 - 26/07/2025)",
      isActive: false,
    },
    {
      term: "Summer2023",
      course: "WDU203c",
      fullCourseName:
        "The UI/UX Design (WDU203c) (WDU203c_SU25_Csr01, from 19/05/2025 - 04/08/2025)",
      isActive: false,
    },
    { term: "Fall2023", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2024", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2024", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2024", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2025", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2025", course: "", fullCourseName: "", isActive: false },
  ];

  // Mock grade data based on the image
  const gradeData: GradeRecord[] = [
    {
      gradeCategory: "Participation",
      gradeItem: "Participation",
      weight: "10.0 %",
      value: 10,
    },
    {
      gradeCategory: "",
      gradeItem: "Total",
      weight: "10.0 %",
      value: 10,
      isTotal: true,
    },
    {
      gradeCategory: "Assignment",
      gradeItem: "Assignment",
      weight: "30.0 %",
      value: 10,
    },
    {
      gradeCategory: "",
      gradeItem: "Total",
      weight: "30.0 %",
      value: 10,
      isTotal: true,
    },
    {
      gradeCategory: "Progress tests",
      gradeItem: "Progress tests 1",
      weight: "15.0 %",
      value: 10,
    },
    {
      gradeCategory: "",
      gradeItem: "Progress tests 2",
      weight: "15.0 %",
      value: 10,
    },
    {
      gradeCategory: "",
      gradeItem: "Total",
      weight: "30.0 %",
      value: 10,
      isTotal: true,
    },
    {
      gradeCategory: "Final exam",
      gradeItem: "Final exam",
      weight: "30.0 %",
      value: 0,
      comment: "Absent",
    },
    {
      gradeCategory: "",
      gradeItem: "Total",
      weight: "30.0 %",
      value: 0,
      isTotal: true,
    },
    {
      gradeCategory: "Final exam Resit",
      gradeItem: "Final exam Resit",
      weight: "30.0 %",
      value: 8.8,
    },
    {
      gradeCategory: "",
      gradeItem: "Total",
      weight: "30.0 %",
      value: 8.8,
      isTotal: true,
    },
    {
      gradeCategory: "COURSE TOTAL",
      gradeItem: "AVERAGE",
      weight: "",
      value: 9.6,
      isCourseTotal: true,
    },
    {
      gradeCategory: "",
      gradeItem: "STATUS",
      weight: "",
      value: "PASSED",
      isCourseTotal: true,
    },
  ];

  const columns: ColumnsType<GradeRecord> = [
    {
      title: "GRADE CATEGORY",
      dataIndex: "gradeCategory",
      key: "gradeCategory",
      width: 200,
      render: (category: string, record: GradeRecord) => {
        if (record.isCourseTotal && category === "COURSE TOTAL") {
          return (
            <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
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
                color: record.gradeItem === "STATUS" ? "#52c41a" : "#1890ff",
                fontSize: 14,
              }}
            >
              {item}
            </Text>
          );
        }
        if (record.isTotal) {
          return (
            <Text strong style={{ color: "#1890ff" }}>
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
            <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
              {value}
            </Text>
          );
        }
        if (record.isTotal) {
          return (
            <Text strong style={{ color: "#1890ff" }}>
              {value}
            </Text>
          );
        }
        if (value === 0) {
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
        return comment ? <Text type="secondary">{comment}</Text> : null;
      },
    },
  ];

  const handleCourseClick = (course: string) => {
    setSelectedCourse(course);
  };

  // Calculate statistics
  const courseTotal = gradeData.find(
    (record) => record.isCourseTotal && record.gradeItem === "AVERAGE"
  )?.value as number;
  const courseStatus = gradeData.find(
    (record) => record.isCourseTotal && record.gradeItem === "STATUS"
  )?.value as string;
  const progressValue = courseTotal ? (courseTotal / 10) * 100 : 0;

  return (
    <div className="grade-report">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "white" }}>
          🎓 Grade Report for Nghiệm Văn Hoàng (SE170117)
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        {/* Sidebar - Term and Course Selection */}
        <Col xs={24} lg={6}>
          <Card title="Select a term, course ..." className="sidebar-card">
            <div className="term-list">
              <List
                dataSource={termCourses}
                renderItem={(item) => (
                  <List.Item
                    className={`term-item ${item.isActive ? "active" : ""} ${
                      !item.course ? "empty" : ""
                    }`}
                    onClick={() =>
                      item.course && handleCourseClick(item.course)
                    }
                  >
                    <div className="term-info">
                      <Text strong className="term-name">
                        {item.term}
                      </Text>
                      {item.course && (
                        <Text className="course-name">
                          {item.fullCourseName}
                        </Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>

        {/* Main Content - Grade Table */}
        <Col xs={24} lg={18}>
          <div className="report-section">
            <div className="section-header">
              <Title level={4} style={{ margin: 0 }}>
                ... then see report
              </Title>
            </div>

            {/* Course Summary Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <div style={{ textAlign: "center" }}>
                    <TrophyOutlined
                      style={{
                        fontSize: 24,
                        color: "#faad14",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 16 }}>
                        Course Average
                      </Text>
                      <Title
                        level={3}
                        style={{ margin: "4px 0", color: "#1890ff" }}
                      >
                        {courseTotal}
                      </Title>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <div style={{ textAlign: "center" }}>
                    <CheckCircleOutlined
                      style={{
                        fontSize: 24,
                        color: "#52c41a",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 16 }}>
                        Status
                      </Text>
                      <Tag
                        color="success"
                        style={{
                          marginTop: 8,
                          fontSize: 14,
                          padding: "4px 12px",
                        }}
                      >
                        {courseStatus}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="stat-card">
                  <div style={{ textAlign: "center" }}>
                    <BarChartOutlined
                      style={{
                        fontSize: 24,
                        color: "#1890ff",
                        marginBottom: 8,
                      }}
                    />
                    <div>
                      <Text strong style={{ display: "block", fontSize: 16 }}>
                        Progress
                      </Text>
                      <Progress
                        type="circle"
                        size={60}
                        percent={progressValue}
                        format={() => `${courseTotal}/10`}
                        strokeColor="#1890ff"
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Grade Table */}
            <Card className="grade-table-card">
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
                  if (record.isCourseTotal) return "course-total-row";
                  if (record.isTotal) return "total-row";
                  return "";
                }}
              />
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default GradeReport;
