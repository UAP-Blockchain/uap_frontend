import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Card, Col, List, Row, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useState } from "react";
import "./AttendanceReport.scss";

const { Title, Text } = Typography;

interface TermCourse {
  term: string;
  course: string;
  fullCourseName: string;
  isActive: boolean;
}

interface AttendanceRecord {
  no: number;
  date: string;
  slot: number;
  slotTime: string;
  room: string;
  lecturer: string;
  groupName: string;
  status: "Present" | "Absent" | "Future";
  lecturerComment?: string;
}

const AttendanceReport: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState("HCM202");

  // Mock terms and courses data
  const termCourses: TermCourse[] = [
    {
      term: "Fall2017",
      course: "HCM202",
      fullCourseName:
        "Ho Chi Minh Ideology(HCM202)(Half1_GD1705,start 09/09/2025)",
      isActive: true,
    },
    {
      term: "Spring2018",
      course: "MLN131",
      fullCourseName:
        "Scientific socialism(MLN131)(Half1_GD1702,start 09/09/2025)",
      isActive: false,
    },
    {
      term: "Summer2018",
      course: "SEP490",
      fullCourseName:
        "SE Capstone Project(SEP490) (FA25SE210_GFA130,start 13/09/2025)",
      isActive: false,
    },
    {
      term: "Fall2018",
      course: "VNR202",
      fullCourseName:
        "History of Vietnam Communist Party(VNR202) (Half2_GD1705,start 14/10/2025)",
      isActive: false,
    },
    { term: "Spring2019", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2019", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2019", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2020", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2020", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2020", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2021", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2021", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2021", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2022", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2022", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2022", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2023", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2023", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2023", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2024", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2024", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2024", course: "", fullCourseName: "", isActive: false },
    { term: "Spring2025", course: "", fullCourseName: "", isActive: false },
    { term: "Summer2025", course: "", fullCourseName: "", isActive: false },
    { term: "Fall2025", course: "", fullCourseName: "", isActive: false },
  ];

  // Mock attendance data
  const attendanceData: AttendanceRecord[] = [
    {
      no: 1,
      date: "2025-09-08",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 2,
      date: "2025-09-12",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 3,
      date: "2025-09-16",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Absent",
    },
    {
      no: 4,
      date: "2025-09-19",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Present",
    },
    {
      no: 5,
      date: "2025-09-23",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 6,
      date: "2025-09-26",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 7,
      date: "2025-09-30",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 8,
      date: "2025-10-03",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 9,
      date: "2025-10-07",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
    {
      no: 10,
      date: "2025-10-10",
      slot: 2,
      slotTime: "09:30-11:45",
      room: "NVH 409",
      lecturer: "DuyNK32",
      groupName: "Half1_GD1705",
      status: "Future",
    },
  ];

  const getStatusTag = (status: string) => {
    switch (status) {
      case "Present":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Present
          </Tag>
        );
      case "Absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Absent
          </Tag>
        );
      case "Future":
        return (
          <Tag color="default" icon={<ExclamationCircleOutlined />}>
            Future
          </Tag>
        );
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getDateTag = (date: string) => {
    const dayOfWeek = dayjs(date).format("dddd");
    const dateFormatted = dayjs(date).format("DD/MM/YYYY");

    let color = "blue";
    if (dayOfWeek === "Tuesday") color = "blue";
    else if (dayOfWeek === "Friday") color = "green";

    return (
      <Tag color={color} style={{ minWidth: "90px", textAlign: "center" }}>
        {dayOfWeek} {dateFormatted}
      </Tag>
    );
  };

  const getSlotTag = (slot: number, slotTime: string) => {
    return (
      <Tag color="orange" style={{ minWidth: "80px", textAlign: "center" }}>
        {slot} {slotTime}
      </Tag>
    );
  };

  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: "NO.",
      dataIndex: "no",
      key: "no",
      width: 60,
      align: "center",
      render: (no: number) => <Text strong>{no}</Text>,
    },
    {
      title: "DATE",
      dataIndex: "date",
      key: "date",
      width: 150,
      align: "center",
      render: (date: string) => getDateTag(date),
    },
    {
      title: "SLOT",
      dataIndex: "slot",
      key: "slot",
      width: 120,
      align: "center",
      render: (slot: number, record: AttendanceRecord) =>
        getSlotTag(slot, record.slotTime),
    },
    {
      title: "ROOM",
      dataIndex: "room",
      key: "room",
      width: 100,
      align: "center",
      render: (room: string) => <Text strong>{room}</Text>,
    },
    {
      title: "LECTURER",
      dataIndex: "lecturer",
      key: "lecturer",
      width: 120,
      align: "center",
      render: (lecturer: string) => <Text>{lecturer}</Text>,
    },
    {
      title: "GROUP NAME",
      dataIndex: "groupName",
      key: "groupName",
      width: 140,
      align: "center",
      render: (groupName: string) => <Text>{groupName}</Text>,
    },
    {
      title: "ATTENDANCE STATUS",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "LECTURER'S COMMENT",
      dataIndex: "lecturerComment",
      key: "lecturerComment",
      align: "center",
      render: (comment?: string) => (
        <Text type="secondary">{comment || ""}</Text>
      ),
    },
  ];

  // Calculate statistics
  const totalSessions = attendanceData.length;
  const completedSessions = attendanceData.filter(
    (record) => record.status !== "Future"
  ).length;
  const presentSessions = attendanceData.filter(
    (record) => record.status === "Present"
  ).length;
  const absentSessions = attendanceData.filter(
    (record) => record.status === "Absent"
  ).length;
  const absentPercentage =
    completedSessions > 0
      ? Math.round((absentSessions / completedSessions) * 100)
      : 0;

  const handleCourseClick = (course: string) => {
    setSelectedCourse(course);
  };

  return (
    <div className="attendance-report">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#FFFFFF" }}>
          View Attendance for Nghiệm Văn Hoàng (SE170117)
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

        {/* Main Content - Attendance Table */}
        <Col xs={24} lg={18}>
          <div className="report-section">
            <div className="section-header">
              <Title level={4} style={{ margin: 0 }}>
                ... then see report
              </Title>
            </div>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Total Sessions"
                    value={totalSessions}
                    prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Present"
                    value={presentSessions}
                    prefix={
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    }
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Absent"
                    value={absentSessions}
                    prefix={
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    }
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title="Absent Rate"
                    value={absentPercentage}
                    suffix="%"
                    prefix={
                      <ExclamationCircleOutlined style={{ color: "#fa541c" }} />
                    }
                  />
                </Card>
              </Col>
            </Row>

            {/* Attendance Table */}
            <Card className="attendance-table-card">
              <Table
                columns={columns}
                dataSource={attendanceData}
                rowKey="no"
                pagination={false}
                scroll={{ x: 1000 }}
                size="small"
                className="attendance-table"
                bordered
              />

              {/* Summary */}
              <div className="attendance-summary">
                <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                  ABSENT: {absentPercentage}% ABSENT SO FAR ({absentSessions}{" "}
                  ABSENT ON {completedSessions} TOTAL).
                </Text>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceReport;
