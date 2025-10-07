import React, { useState } from "react";
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
import "./index.scss";

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
  className: string;
  room: string;
  building: string;
  students: number;
  week: string;
  status?: "attended" | "absent" | "not_yet";
}

const TeacherSchedule: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(dayjs());

  const timetableData: TimetableSlot[] = [
    {
      slot: 1,
      time: "07:30 - 09:20",
      monday: {
        courseCode: "CTDL",
        courseName: "Cấu trúc dữ liệu",
        className: "CNTT2023B",
        room: "B205",
        building: "B",
        students: 32,
        status: "not_yet",
        week: "22/09 - 28/09",
      },
      wednesday: {
        courseCode: "JAVA",
        courseName: "Lập trình Java",
        className: "CNTT2022A",
        room: "C301",
        building: "C",
        students: 28,
        status: "not_yet",
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
      thursday: {
        courseCode: "DB",
        courseName: "Cơ sở dữ liệu",
        className: "CNTT2023A",
        room: "D102",
        building: "D",
        students: 35,
        status: "not_yet",
        week: "22/09 - 28/09",
      },
      friday: {
        courseCode: "HCM202",
        courseName: "Tư tưởng HCM",
        className: "XHH2021",
        room: "NVH 409",
        building: "NVH",
        students: 40,
        status: "attended",
        week: "22/09 - 28/09",
      },
    },
  ];

  const getStatusTag = (status?: string) => {
    switch (status) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã dạy
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Vắng
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Chưa dạy
          </Tag>
        );
      default:
        return null;
    }
  };

  const renderClassCell = (classInfo?: ClassInfo) => {
    if (!classInfo) return <div className="empty-slot">-</div>;

    return (
      <div className="class-slot">
        <div className="course-code">
          <Text strong>{classInfo.courseCode}</Text>
          <Button type="link" size="small">
            Tài liệu
          </Button>
        </div>
        <div className="course-info">
          <Text style={{ fontSize: 12 }}>
            {classInfo.className} • {classInfo.room} - {classInfo.building} •{" "}
            {classInfo.students} SV
          </Text>
        </div>
        <div className="attendance-status">
          {getStatusTag(classInfo.status)}
        </div>
        <div className="time-info">
          <Text type="secondary">Tuần {classInfo.week}</Text>
        </div>
      </div>
    );
  };

  const columns: ColumnsType<TimetableSlot> = [
    {
      title: "Tiết",
      dataIndex: "slot",
      key: "slot",
      width: 120,
      render: (slot: number, record: TimetableSlot) => (
        <div className="time-slot-header">
          <div className="slot-number">Tiết {slot}</div>
          <div className="slot-time">{record.time}</div>
        </div>
      ),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 2</span>
          <div className="date-number">22/09</div>
        </div>
      ),
      dataIndex: "monday",
      key: "monday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 3</span>
          <div className="date-number">23/09</div>
        </div>
      ),
      dataIndex: "tuesday",
      key: "tuesday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 4</span>
          <div className="date-number">24/09</div>
        </div>
      ),
      dataIndex: "wednesday",
      key: "wednesday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 5</span>
          <div className="date-number">25/09</div>
        </div>
      ),
      dataIndex: "thursday",
      key: "thursday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 6</span>
          <div className="date-number">26/09</div>
        </div>
      ),
      dataIndex: "friday",
      key: "friday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>TH 7</span>
          <div className="date-number">27/09</div>
        </div>
      ),
      dataIndex: "saturday",
      key: "saturday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
    {
      title: (
        <div className="day-header">
          <CalendarOutlined />
          <span>CN</span>
          <div className="date-number">28/09</div>
        </div>
      ),
      dataIndex: "sunday",
      key: "sunday",
      render: (info: ClassInfo) => renderClassCell(info),
    },
  ];

  return (
    <div className="teacher-schedule">
      <div className="timetable-header">
        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Lịch giảng dạy theo tuần
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Xem thời khóa biểu trong tuần của giảng viên
            </Text>
          </Col>
          <Col>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => setSelectedWeek(dayjs())}
              >
                Tuần hiện tại
              </Button>
            </Space>
          </Col>
        </Row>

        <Card className="week-nav-card">
          <Row align="middle" justify="space-between">
            <Col>
              <Space>
                <Button type="primary">← Tuần trước</Button>
                <Button>Tuần sau →</Button>
              </Space>
            </Col>
            <Col>
              <div className="week-info">
                <Title level={4} style={{ margin: 0 }}>
                  Tuần: {selectedWeek.format("DD/MM")} -{" "}
                  {selectedWeek.add(6, "day").format("DD/MM/YYYY")}
                </Title>
                <Text type="secondary">
                  Học kỳ Fall 2024 • Tuần {selectedWeek.week()}
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
                  onChange={(d) => d && setSelectedWeek(d)}
                  style={{ width: 200 }}
                />
              </Space>
            </Col>
          </Row>
        </Card>
      </div>

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
    </div>
  );
};

export default TeacherSchedule;
