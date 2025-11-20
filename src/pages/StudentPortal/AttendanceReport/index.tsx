import {
  Alert,
  Card,
  Col,
  Collapse,
  Empty,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import AttendanceServices from "../../../services/attendance/api.service";
import GradeServices from "../../../services/grade/api.service";
import { StudentGradeServices } from "../../../services/student/api.service";
import type { AttendanceDto } from "../../../types/Attendance";
import type { SubjectGradeDto } from "../../../types/Grade";
import type { SemesterDto } from "../../../types/Semester";
import type { RootState } from "../../../redux/store";
import "./AttendanceReport.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

type SubjectMap = Record<string, SubjectGradeDto[]>;
type LoadingMap = Record<string, boolean>;

const AttendanceReport: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [subjectsBySemester, setSubjectsBySemester] = useState<SubjectMap>({});
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<LoadingMap>({});
  const [activeSemesterKey, setActiveSemesterKey] = useState<string | string[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectGradeDto | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDto[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const loadSemesters = useCallback(async () => {
    setIsLoadingSemesters(true);
    setError(null);
    try {
      const response = await GradeServices.getSemesters({
        pageSize: 100,
        sortBy: "StartDate",
        isDescending: true,
      });
      setSemesters(response.data);
      if (response.data.length > 0) {
        const firstSemesterId = response.data[0].id;
        setActiveSemesterKey([firstSemesterId]);
        await loadSubjectsForSemester(firstSemesterId);
      }
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string }).message ||
        "Không thể tải danh sách học kỳ";
      setError(messageText);
      message.error(messageText);
    } finally {
      setIsLoadingSemesters(false);
    }
  }, []);

  const loadSubjectsForSemester = useCallback(async (semesterId: string) => {
    if (subjectsBySemester[semesterId]) {
      return;
    }

    setIsLoadingSubjects((prev) => ({ ...prev, [semesterId]: true }));
    try {
      const response = await StudentGradeServices.getMyGrades({
        SemesterId: semesterId,
      });
      setSubjectsBySemester((prev) => ({
        ...prev,
        [semesterId]: response.subjects || [],
      }));
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string }).message ||
        "Không thể tải danh sách môn học";
      message.error(messageText);
    } finally {
      setIsLoadingSubjects((prev) => ({ ...prev, [semesterId]: false }));
    }
  }, [subjectsBySemester]);

  const loadAttendanceForSubject = useCallback(async (subjectId: string) => {
    setIsLoadingAttendance(true);
    setError(null);
    try {
      const records = await AttendanceServices.getMyAttendance({
        SubjectId: subjectId,
      });
      setAttendanceRecords(records);
    } catch (err) {
      const messageText =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as { message?: string }).message ||
        "Không thể tải dữ liệu điểm danh";
      setAttendanceRecords([]);
      setError(messageText);
      message.error(messageText);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    loadSemesters();
  }, [loadSemesters]);

  const handleSemesterChange = (keys: string | string[]) => {
    setActiveSemesterKey(keys);
    const semesterIds = Array.isArray(keys) ? keys : keys ? [keys] : [];
    semesterIds.forEach((semesterId) => {
      if (semesterId) {
        void loadSubjectsForSemester(semesterId);
      }
    });
  };

  const handleSubjectClick = (subject: SubjectGradeDto) => {
    setSelectedSubjectId(subject.subjectId);
    setSelectedSubject(subject);
    void loadAttendanceForSubject(subject.subjectId);
  };

  const columns: ColumnsType<AttendanceDto> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_: unknown, __: AttendanceDto, index: number) => (
        <Text strong>{index + 1}</Text>
      ),
    },
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      width: 160,
      render: (value: string) => (
        <Tag color="blue" style={{ minWidth: 120, textAlign: "center" }}>
          {dayjs(value).format("dddd · DD/MM/YYYY")}
        </Tag>
      ),
    },
    {
      title: "Ca học",
      dataIndex: "timeSlotName",
      key: "slot",
      width: 150,
      render: (slot: string) => (
        <Tag color="purple" style={{ minWidth: 110, textAlign: "center" }}>
          {slot}
        </Tag>
      ),
    },
    {
      title: "Lớp",
      dataIndex: "classCode",
      key: "classCode",
      width: 140,
      render: (classCode: string) => <Text strong>{classCode}</Text>,
    },
    {
      title: "Môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      render: (subjectName: string) => <Text>{subjectName}</Text>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 160,
      align: "center",
      render: (_: unknown, record: AttendanceDto) => renderStatusTag(record),
    },
    {
      title: "Ghi chú",
      key: "notes",
      render: (_: unknown, record: AttendanceDto) => (
        <Text type="secondary">
          {record.excuseReason || record.notes || "—"}
        </Text>
      ),
    },
  ];

  const summary = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((record) => record.isPresent).length;
    const excused = attendanceRecords.filter(
      (record) => !record.isPresent && record.isExcused
    ).length;
    const absent = attendanceRecords.filter(
      (record) => !record.isPresent && !record.isExcused
    ).length;
    const percentage = total ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      excused,
      absent,
      percentage,
    };
  }, [attendanceRecords]);

  const renderStatusTag = (record: AttendanceDto) => {
    if (record.isPresent) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Có mặt
        </Tag>
      );
    }

    if (record.isExcused) {
      return (
        <Tag color="blue" icon={<ExclamationCircleOutlined />}>
          Miễn điểm danh
        </Tag>
      );
    }

    return (
      <Tag color="error" icon={<CloseCircleOutlined />}>
        Vắng mặt
      </Tag>
    );
  };

  return (
    <div className="attendance-report">
      <div className="page-header">
        <Title level={2} style={{ margin: 0, color: "#FFFFFF" }}>
          Báo cáo điểm danh cho {userProfile?.fullName || "Sinh viên"}
        </Title>
      </div>

      {error && (
        <Alert
          type="error"
          message="Không thể tải dữ liệu"
          description={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={6}>
          <Card className="sidebar-card" loading={isLoadingSemesters}>
            <div className="semester-list">
              <Collapse
                activeKey={activeSemesterKey}
                onChange={handleSemesterChange}
                ghost
              >
                {semesters.map((semester) => {
                  const semesterSubjects = subjectsBySemester[semester.id] || [];
                  const isLoading = isLoadingSubjects[semester.id];

                  return (
                    <Panel header={semester.name} key={semester.id}>
                      {isLoading ? (
                        <Spin />
                      ) : semesterSubjects.length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Chưa có môn học"
                        />
                      ) : (
                        semesterSubjects.map((subject) => (
                          <div
                            key={subject.subjectId}
                            className={`course-item ${
                              selectedSubjectId === subject.subjectId
                                ? "active"
                                : ""
                            }`}
                            onClick={() => handleSubjectClick(subject)}
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
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <div className="report-section">
            <Card className="attendance-table-card">
              {!selectedSubjectId ? (
                <Empty
                  description="Chọn một môn học để xem điểm danh"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <Spin spinning={isLoadingAttendance}>
                  <div className="attendance-header">
                    <div>
                      <Text type="secondary">Môn học</Text>
                      <Title level={4} style={{ margin: 0 }}>
                        {selectedSubject?.subjectCode} · {selectedSubject?.subjectName}
                      </Title>
                    </div>
                    <div className="attendance-summary-cards">
                      <Tag color="green">Có mặt: {summary.present}</Tag>
                      <Tag color="blue">Miễn: {summary.excused}</Tag>
                      <Tag color="red">Vắng: {summary.absent}</Tag>
                      <Tag color="purple">Tổng: {summary.total}</Tag>
                    </div>
                  </div>

                  {attendanceRecords.length === 0 ? (
                    <Empty description="Chưa có dữ liệu điểm danh" />
                  ) : (
                    <Table
                      columns={columns}
                      dataSource={attendanceRecords}
                      rowKey={(record) => record.id}
                      pagination={false}
                      scroll={{ x: 900 }}
                      size="small"
                      className="attendance-table"
                      bordered
                    />
                  )}

                  <div className="attendance-summary">
                    <Text strong style={{ color: "#ff4d4f", fontSize: 15 }}>
                      Tỉ lệ tham gia: {summary.percentage}% · Tổng số buổi: {summary.total}
                    </Text>
                  </div>
                </Spin>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AttendanceReport;
