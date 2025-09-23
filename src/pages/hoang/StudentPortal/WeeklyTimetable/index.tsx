import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Row,
  Col,
  Badge,
  Tooltip,
} from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import "./WeeklyTimetable.scss";

dayjs.extend(weekOfYear);

const { Title, Text } = Typography;
const { Option } = Select;

interface TimetableSlot {
  slot: number;
  time: string;
  monday?: ClassInfo;
  tuesday?: ClassInfo;
  wednesday?: ClassInfo;
  thursday?: ClassInfo;
  friday?: ClassInfo;
  saturday?: ClassInfo;
  sunday?: ClassInfo;
}

interface ClassInfo {
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  building: string;
  attendance?: "attended" | "absent" | "not_yet";
  week: string;
}

const WeeklyTimetable: React.FC = () => {
  const navigate = useNavigate();
  const [selectedWeek, setSelectedWeek] = useState(dayjs());

  // Mock timetable data for current week
  const timetableData: TimetableSlot[] = [
    {
      slot: 1,
      time: "07:30 - 09:20",
      tuesday: {
        courseCode: "HCM202",
        courseName: "Ho Chi Minh Ideology",
        instructor: "Dr. Nguyen Van A",
        room: "NVH 409",
        building: "NVH",
        attendance: "attended",
        week: "22/09 - 28/09",
      },
      thursday: {
        courseCode: "HCM202",
        courseName: "Ho Chi Minh Ideology",
        instructor: "Dr. Nguyen Van A",
        room: "NVH 409",
        building: "NVH",
        attendance: "not_yet",
        week: "22/09 - 28/09",
      },
    },
    {
      slot: 2,
      time: "09:30 - 11:20",
    },
    {
      slot: 3,
      time: "12:30 - 14:20",
      tuesday: {
        courseCode: "MLN131",
        courseName: "Marxist-Leninist Philosophy",
        instructor: "Prof. Tran Thi B",
        room: "NVH 502",
        building: "NVH",
        attendance: "attended",
        week: "22/09 - 28/09",
      },
      thursday: {
        courseCode: "MLN131",
        courseName: "Marxist-Leninist Philosophy",
        instructor: "Prof. Tran Thi B",
        room: "NVH 502",
        building: "NVH",
        attendance: "not_yet",
        week: "22/09 - 28/09",
      },
      saturday: {
        courseCode: "SEP490",
        courseName: "Capstone Project",
        instructor: "Mr. Le Van C",
        room: "P.136",
        building: "Alpha",
        attendance: "not_yet",
        week: "22/09 - 28/09",
      },
    },
    {
      slot: 4,
      time: "14:30 - 16:20",
    },
  ];

  const getAttendanceTag = (attendance?: string) => {
    switch (attendance) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Attended
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Absent
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Not Yet
          </Tag>
        );
      default:
        return null;
    }
  };

  const getActivityId = (classInfo: ClassInfo, dayKey: string) => {
    // Generate a unique ID for the activity based on course code and day
    return `${classInfo.courseCode.toLowerCase()}_${dayKey}_slot${
      classInfo.courseCode === "HCM202"
        ? "2"
        : classInfo.courseCode === "MLN131"
        ? "3"
        : "3"
    }`;
  };

  const renderClassCell = (classInfo?: ClassInfo, dayKey?: string) => {
    if (!classInfo) {
      return <div className="empty-slot">-</div>;
    }

    const handleViewDetails = () => {
      const activityId = getActivityId(classInfo, dayKey || "tue");
      navigate(`/student-portal/activity/${activityId}`);
    };

    return (
      <div
        className="class-slot"
        onClick={handleViewDetails}
        style={{ cursor: "pointer" }}
      >
        <div className="course-code">
          <Text strong>{classInfo.courseCode}</Text>
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails();
              }}
            >
              View Materials
            </Button>
          </Tooltip>
        </div>
        <div className="course-info">
          <Text style={{ fontSize: 12 }}>
            at {classInfo.room} - {classInfo.building}
          </Text>
        </div>
        <div className="attendance-status">
          {getAttendanceTag(classInfo.attendance)}
        </div>
        <div className="time-info">
          <Text type="secondary" style={{ fontSize: 11 }}>
            ({classInfo.week})
          </Text>
        </div>
      </div>
    );
  };

  const columns: ColumnsType<TimetableSlot> = [
    {
      title: "Time Slot",
      dataIndex: "slot",
      key: "slot",
      width: 120,
      render: (slot: number, record: TimetableSlot) => (
        <div className="time-slot-header">
          <div className="slot-number">Slot {slot}</div>
          <div className="slot-time">{record.time}</div>
        </div>
      ),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>MON</span>
          <div className="date-number">22/09</div>
        </div>
      ),
      dataIndex: "monday",
      key: "monday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "mon"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TUE</span>
          <div className="date-number">23/09</div>
        </div>
      ),
      dataIndex: "tuesday",
      key: "tuesday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "tue"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>WED</span>
          <div className="date-number">24/09</div>
        </div>
      ),
      dataIndex: "wednesday",
      key: "wednesday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "wed"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>THU</span>
          <div className="date-number">25/09</div>
        </div>
      ),
      dataIndex: "thursday",
      key: "thursday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "thu"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>FRI</span>
          <div className="date-number">26/09</div>
        </div>
      ),
      dataIndex: "friday",
      key: "friday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "fri"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>SAT</span>
          <div className="date-number">27/09</div>
        </div>
      ),
      dataIndex: "saturday",
      key: "saturday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "sat"),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>SUN</span>
          <div className="date-number">28/09</div>
        </div>
      ),
      dataIndex: "sunday",
      key: "sunday",
      render: (classInfo: ClassInfo) => renderClassCell(classInfo, "sun"),
    },
  ];

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedWeek(selectedWeek.subtract(1, "week"));
    } else {
      setSelectedWeek(selectedWeek.add(1, "week"));
    }
  };

  return (
    <div className="weekly-timetable">
      {/* Page Header */}
      <div className="timetable-header">
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Weekly Timetable
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              View your weekly class schedule
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setSelectedWeek(dayjs())}
              >
                Current Week
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Week Navigation */}
        <Card className="week-nav-card">
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Button type="primary" onClick={() => handleWeekChange("prev")}>
                  ← Previous Week
                </Button>
                <Button onClick={() => handleWeekChange("next")}>
                  Next Week →
                </Button>
              </Space>
            </Col>
            <Col>
              <div className="week-info">
                <Title level={4} style={{ margin: 0 }}>
                  Week: {selectedWeek.format("DD/MM")} -{" "}
                  {selectedWeek.add(6, "day").format("DD/MM/YYYY")}
                </Title>
                <Text type="secondary">
                  Semester: Fall 2024 • Week {selectedWeek.week()}
                </Text>
              </div>
            </Col>
            <Col>
              <Space>
                <Select defaultValue="2025" style={{ width: 100 }}>
                  <Option value="2024">2024</Option>
                  <Option value="2025">2025</Option>
                </Select>
                <DatePicker.WeekPicker
                  value={selectedWeek}
                  onChange={(date) => date && setSelectedWeek(date)}
                  style={{ width: 200 }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Legend */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Text strong>Legend:</Text>
          </Col>
          <Col>
            <Space>
              <Badge
                color="#52c41a"
                text="Attended - Student has attended this class"
              />
              <Badge color="#ff4d4f" text="Absent - Student was absent" />
              <Badge color="#faad14" text="Not Yet - Class not started yet" />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Timetable */}
      <Card className="timetable-card">
        <Table
          columns={columns}
          dataSource={timetableData}
          rowKey="slot"
          pagination={false}
          bordered
          size="middle"
          className="timetable-table"
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Note */}
      <Card className="note-card">
        <Title level={5}>📝 Note:</Title>
        <Text type="secondary">
          This timetable shows activities within the university and does not
          include extra-curricular activities, such as club activities, personal
          study sessions, or external courses.
        </Text>
      </Card>
    </div>
  );
};

export default WeeklyTimetable;
