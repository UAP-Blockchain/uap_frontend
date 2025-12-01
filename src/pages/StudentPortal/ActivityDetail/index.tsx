import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ScheduleItemDto } from "../../../types/Schedule";
import "./ActivityDetail.scss";

const { Title, Text } = Typography;

const ActivityDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const slot = (location.state as { slot?: ScheduleItemDto })?.slot;

  if (!slot) {
    return (
      <div className="activity-detail">
        <Card>
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Title level={3}>Không tìm thấy hoạt động</Title>
            <Text type="secondary">
              Hoạt động yêu cầu không có trong dữ liệu hiện tại. Vui lòng quay
              lại thời khóa biểu để chọn hoạt động khác.
            </Text>
            <br />
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/student-portal/timetable")}
              style={{ marginTop: 16 }}
            >
              Quay lại thời khóa biểu
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const attendanceStatus =
    slot.isPresent === true
      ? "attended"
      : slot.isPresent === false
      ? "absent"
      : slot.hasAttendance
      ? "not_yet"
      : "unknown";

  const getAttendanceTag = () => {
    switch (attendanceStatus) {
      case "attended":
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đã điểm danh
          </Tag>
        );
      case "absent":
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            Chưa điểm danh
          </Tag>
        );
      case "not_yet":
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            Chưa có
          </Tag>
        );
      default:
        return <Tag color="default">Chưa có dữ liệu</Tag>;
    }
  };

  return (
    <div className="activity-detail">
      <div className="detail-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/student-portal/timetable")}
          style={{ marginBottom: 16 }}
        >
          Quay lại thời khóa biểu
        </Button>

        <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
          Chi tiết hoạt động
        </Title>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card className="main-info-card">
            <Descriptions title="Thông tin lớp học" column={2} bordered>
              <Descriptions.Item label="Ngày" span={2}>
                <Space>
                  <CalendarOutlined />
                  <Text strong>
                    {dayjs(slot.date).format("dddd DD/MM/YYYY")}
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Ca học" span={2}>
                <Space>
                  <ClockCircleOutlined />
                  <Text>
                    {slot.timeSlotName || "Ca"} (
                    {slot.startTime
                      ? dayjs(slot.startTime, "HH:mm:ss").format("HH:mm")
                      : "--:--"}
                    {" - "}
                    {slot.endTime
                      ? dayjs(slot.endTime, "HH:mm:ss").format("HH:mm")
                      : "--:--"}
                    )
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Môn học" span={2}>
                <Space>
                  <BookOutlined />
                  <Text strong>
                    {slot.subjectName} ({slot.subjectCode})
                  </Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Lớp học" span={2}>
                <Text strong style={{ color: "#1a94fc" }}>
                  {slot.classCode || slot.classId || "Chưa cập nhật"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Giảng viên" span={2}>
                {slot.teacherName ? (
                  <Text strong style={{ color: "#1a94fc" }}>
                    {slot.teacherName}
                  </Text>
                ) : (
                  <Text>Chưa cập nhật</Text>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Điểm danh" span={2}>
                {getAttendanceTag()}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                <Text>{slot.notes || "Không có ghi chú"}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Sĩ số" span={2}>
                <Text>
                  {slot.totalStudents ?? 0} sinh viên • Có mặt:{" "}
                  {slot.presentCount ?? 0} • Vắng: {slot.absentCount ?? 0}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityDetail;
