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
import RoadmapServices from "../../../services/roadmap/api.service";
import type { AttendanceDto } from "../../../types/Attendance";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "../../../types/Roadmap";
import type { RootState } from "../../../redux/store";
import "./AttendanceReport.scss";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AttendanceReport: React.FC = () => {
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(null);
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, CurriculumSemesterDto>
  >({});
  const [loadingSemesters, setLoadingSemesters] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeSemesterKey, setActiveSemesterKey] = useState<string | undefined>(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<CurriculumRoadmapSubjectDto | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceDto[]>([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const handleLoadSemester = useCallback(async (semesterNumber: number) => {
    setLoadingSemesters((prev) => {
      if (prev[semesterNumber]) return prev; // Already loading
      return { ...prev, [semesterNumber]: true };
    });
    
    try {
      const data: CurriculumSemesterDto =
        await RoadmapServices.getMyCurriculumSemester(semesterNumber);
      setSemesterDetails((prev) => {
        if (prev[semesterNumber]) return prev; // Already loaded
        return {
          ...prev,
          [semesterNumber]: data,
        };
      });
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
  }, []);

  // Load summary on mount
  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await RoadmapServices.getMyCurriculumRoadmapSummary();
        setSummary(data);
        // Auto-load first semester
        if (data.semesterSummaries.length > 0) {
          const firstSemester = data.semesterSummaries[0].semesterNumber;
          setActiveSemesterKey(String(firstSemester));
          await handleLoadSemester(firstSemester);
        }
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
  }, [handleLoadSemester]);

  const handleSemesterChange = (key: string | string[]) => {
    // In accordion mode, key is always a string (single value) or undefined when closing
    if (key === undefined || key === null) {
      setActiveSemesterKey(undefined);
      return;
    }

    // In accordion mode, key is a string
    const keyString = typeof key === "string" ? key : Array.isArray(key) && key.length > 0 ? String(key[0]) : undefined;
    
    if (keyString !== undefined) {
      const semesterNumber = parseInt(keyString, 10);
      if (!isNaN(semesterNumber)) {
        setActiveSemesterKey(keyString);
        void handleLoadSemester(semesterNumber);
      }
    }
  };

  const handleSubjectClick = (subject: CurriculumRoadmapSubjectDto) => {
    setSelectedSubjectId(subject.subjectId);
    setSelectedSubject(subject);
    void loadAttendanceForSubject(subject.subjectId);
  };

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

  // Filter subjects to only show InProgress and Completed
  const getFilteredSubjects = (subjects: CurriculumRoadmapSubjectDto[]) => {
    return subjects.filter(
      (subject) => subject.status === "InProgress" || subject.status === "Completed"
    );
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

  const attendanceSummary = useMemo(() => {
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
          <Card className="sidebar-card" loading={isLoading}>
            <div className="semester-list">
              {summary && summary.semesterSummaries.length > 0 ? (
              <Collapse
                  accordion
                activeKey={activeSemesterKey}
                onChange={handleSemesterChange}
                ghost
              >
                  {summary.semesterSummaries.map((semSummary) => {
                    const semesterData = semesterDetails[semSummary.semesterNumber];
                    const isLoading = loadingSemesters[semSummary.semesterNumber] ?? false;
                    const filteredSubjects = semesterData
                      ? getFilteredSubjects(semesterData.subjects)
                      : [];

                  return (
                      <Panel header={semSummary.semesterName} key={String(semSummary.semesterNumber)}>
                      {isLoading ? (
                        <Spin />
                        ) : filteredSubjects.length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Chưa có môn học"
                        />
                      ) : (
                          filteredSubjects.map((subject) => (
                          <div
                            key={subject.subjectId}
                            className={`course-item ${
                                selectedSubjectId === subject.subjectId ? "active" : ""
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
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có dữ liệu học kỳ"
                />
              )}
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
                      <Tag color="green">Có mặt: {attendanceSummary.present}</Tag>
                      <Tag color="blue">Miễn: {attendanceSummary.excused}</Tag>
                      <Tag color="red">Vắng: {attendanceSummary.absent}</Tag>
                      <Tag color="purple">Tổng: {attendanceSummary.total}</Tag>
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
                      Tỉ lệ tham gia: {attendanceSummary.percentage}% · Tổng số buổi: {attendanceSummary.total}
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
