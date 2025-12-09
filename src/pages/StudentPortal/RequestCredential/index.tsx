import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Button,
  Card,
  Collapse,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Progress,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
  notification,
} from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import RoadmapServices from "../../../services/roadmap/api.service";
import {
  createCredentialRequest,
  getMyCredentialRequests,
} from "../../../services/student/credentialRequest.service";
import { getGraduationStatus } from "../../../services/student/graduation.service";
import type {
  CurriculumRoadmapSummaryDto,
  CurriculumSemesterDto,
  CurriculumRoadmapSubjectDto,
} from "../../../types/Roadmap";
import type { StudentRoadmapDto, RoadmapSubjectDto } from "../../../types/Roadmap";
import type {
  RequestCredentialRequest,
  CredentialRequestDto,
  GraduationEligibilityDto,
} from "../../../types/CredentialRequest";
import "./RequestCredential.scss";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const RequestCredential: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CurriculumRoadmapSummaryDto | null>(
    null
  );
  const [semesterDetails, setSemesterDetails] = useState<
    Record<number, CurriculumSemesterDto>
  >({});
  const [graduationStatus, setGraduationStatus] =
    useState<GraduationEligibilityDto | null>(null);
  const [requests, setRequests] = useState<CredentialRequestDto[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"subject" | "graduation">(
    "subject"
  );
  const [selectedSubject, setSelectedSubject] =
    useState<CurriculumRoadmapSubjectDto | null>(null);
  const [activeSemesterKey, setActiveSemesterKey] = useState<
    string | string[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, graduationData, requestsData] = await Promise.all([
          RoadmapServices.getMyCurriculumRoadmapSummary(),
          getGraduationStatus(),
          getMyCredentialRequests(),
        ]);
        setSummary(summaryData);
        setGraduationStatus(graduationData);
        setRequests(requestsData);

        // Prefetch chi tiết cho các kỳ có môn đã hoàn thành
        const targetSemesters = summaryData.semesterSummaries
          .filter((s) => s.completedSubjects > 0)
          .map((s) => s.semesterNumber);

        if (targetSemesters.length > 0) {
          const semesterResponses = await Promise.all(
            targetSemesters.map((n) =>
              RoadmapServices.getMyCurriculumSemester(n)
            )
          );

          setSemesterDetails((prev) => {
            const updated = { ...prev };
            semesterResponses.forEach((sem) => {
              updated[sem.semesterNumber] = sem;
            });
            return updated;
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
        message.error("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  // Get completed subjects
  const completedSubjects = useMemo(() => {
    if (!summary) return [];
    const subjects: Array<{
      subject: CurriculumRoadmapSubjectDto;
      semesterNumber: number;
    }> = [];
    Object.values(semesterDetails).forEach((semester) => {
      semester.subjects
        .filter((s) => s.status === "Completed")
        .forEach((subject) =>
          subjects.push({
            subject,
            semesterNumber: semester.semesterNumber,
          })
        );
    });
    return subjects;
  }, [semesterDetails, summary]);

  // Check if subject already has a pending/approved request
  const hasRequestForSubject = (subjectId: string) => {
    // Find the subject to get its name
    const subject = completedSubjects.find(
      (cs) => cs.subject.subjectId === subjectId
    )?.subject;
    if (!subject) return false;

    // Check if there's a request with matching subject name
    return requests.some(
      (r) =>
        r.certificateType === "SubjectCompletion" &&
        r.subjectName === subject.subjectName
    );
  };

  // Check if graduation request already exists
  const hasGraduationRequest = () => {
    return requests.some((r) => r.certificateType === "RoadmapCompletion");
  };

  const handleRequestSubject = (subject: CurriculumRoadmapSubjectDto) => {
    setSelectedSubject(subject);
    setModalType("subject");
    setModalVisible(true);
    form.resetFields();
  };

  const handleRequestGraduation = () => {
    setModalType("graduation");
    setModalVisible(true);
    form.resetFields();
  };

  const findCapstoneRoadmapId = (
    roadmap: StudentRoadmapDto | null | undefined
  ): string | null => {
    if (!roadmap) return null;
    const allSubjects: RoadmapSubjectDto[] = roadmap.semesterGroups
      .flatMap((g) => g.subjects)
      .filter((s) => s.status === "Completed");

    // Ưu tiên môn có mã chứa các pattern Capstone/Project/SEP490
    const capstone = allSubjects.find((s) =>
      /(SEP490|CAPSTONE|PROJECT)/i.test(s.subjectCode || "")
    );
    if (capstone?.id) return capstone.id;

    // Fallback: lấy môn Completed có sequenceOrder lớn nhất
    const sorted = [...allSubjects].sort(
      (a, b) => (b.sequenceOrder || 0) - (a.sequenceOrder || 0)
    );
    return sorted[0]?.id ?? null;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let request: RequestCredentialRequest;

      if (modalType === "subject" && selectedSubject) {
        request = {
          certificateType: "SubjectCompletion",
          subjectId: selectedSubject.subjectId,
          notes: values.notes,
        };
      } else {
        // Graduation (RoadmapCompletion)
        // Lấy roadmap để tìm môn Capstone đã hoàn thành
        const roadmap = await RoadmapServices.getMyRoadmap();
        const capstoneRoadmapId = findCapstoneRoadmapId(roadmap);
        if (!capstoneRoadmapId) {
          notification.error({
            message: "Không tìm thấy môn đồ án/Capstone đã hoàn thành",
            description:
              "Vui lòng hoàn thành môn đồ án tốt nghiệp (ví dụ SEP490) trước khi yêu cầu chứng chỉ tốt nghiệp.",
            placement: "topRight",
          });
          return;
        }

        request = {
          certificateType: "RoadmapCompletion",
          roadmapId: capstoneRoadmapId,
          notes: values.notes,
        };
      }

      setRequesting(modalType);
      const newRequest = await createCredentialRequest(request);

      notification.success({
        message: "Yêu cầu đã được gửi!",
        description: "Yêu cầu cấp chứng chỉ của bạn đang chờ được xử lý.",
        placement: "topRight",
      });

      // Refresh requests list
      const updatedRequests = await getMyCredentialRequests();
      setRequests(updatedRequests);

      setModalVisible(false);
      form.resetFields();
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        "Không thể gửi yêu cầu";
      notification.error({
        message: "Gửi yêu cầu thất bại",
        description: errorMessage,
        placement: "topRight",
      });
    } finally {
      setRequesting(null);
    }
  };

  const getRequestStatusTag = (status: string) => {
    const statusMap: Record<
      string,
      { color: string; text: string; icon: React.ReactNode }
    > = {
      Pending: {
        color: "warning",
        text: "Đang chờ duyệt",
        icon: <ClockCircleOutlined />,
      },
      Approved: {
        color: "success",
        text: "Đã được duyệt",
        icon: <CheckOutlined />,
      },
      Rejected: {
        color: "error",
        text: "Đã bị từ chối",
        icon: <CloseOutlined />,
      },
    };

    const meta = statusMap[status] || {
      color: "default",
      text: status,
      icon: null,
    };
    return (
      <Tag
        color={meta.color}
        icon={meta.icon}
        style={{
          borderRadius: "8px",
          padding: "4px 12px",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        {meta.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="request-credential-page">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                YÊU CẦU CẤP CHỨNG CHỈ
              </Text>
              <Title level={2} style={{ margin: 0, color: "#ffffff" }}>
                Yêu cầu cấp chứng chỉ
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                Gửi yêu cầu cấp chứng chỉ cho các môn học đã hoàn thành hoặc
                chứng chỉ tốt nghiệp khi hoàn thành tất cả môn học trong chương
                trình.
              </Text>
            </div>

            <div className="page-metrics">
              <Card className="metric-card compact">
                <Statistic
                  title="Môn đã hoàn thành"
                  value={completedSubjects.length}
                  prefix={<BookOutlined />}
                />
              </Card>
              <Card className="metric-card compact">
                <Statistic
                  title="Yêu cầu đã gửi"
                  value={requests.length}
                  prefix={<FileTextOutlined />}
                />
              </Card>
              <Card className="metric-card compact">
                <Statistic
                  title="Tiến độ tốt nghiệp"
                  value={
                    graduationStatus ? graduationStatus.completedSubjects : 0
                  }
                  suffix={`/ ${graduationStatus?.totalSubjects || 0}`}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </div>
          </div>
        </div>

        {/* Graduation Certificate */}
        {graduationStatus?.isEligible && (
          <Card
            className="graduation-card"
            style={{
              background:
                "linear-gradient(135deg, #1a94fc 0%, #0d73c9 50%, #1a94fc 100%)",
              border: "none",
            }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Title level={4} style={{ color: "#fff", margin: 0 }}>
                    <TrophyOutlined style={{ marginRight: 8 }} />
                    Đủ điều kiện tốt nghiệp
                  </Title>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      display: "block",
                      marginTop: 8,
                    }}
                  >
                    Bạn đã hoàn thành tất cả {graduationStatus.totalSubjects}{" "}
                    môn học trong chương trình đào tạo.
                  </Text>
                </div>
                {hasGraduationRequest() ? (
                  <Tag
                    color="success"
                    style={{
                      fontSize: 15,
                      padding: "10px 20px",
                      borderRadius: "12px",
                      fontWeight: 600,
                      boxShadow: "0 2px 8px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <CheckOutlined style={{ marginRight: 6 }} />
                    Đã yêu cầu chứng chỉ tốt nghiệp
                  </Tag>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    icon={<TrophyOutlined />}
                    onClick={handleRequestGraduation}
                    style={{
                      background: "#fff",
                      color: "#1a94fc",
                      border: "none",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Yêu cầu chứng chỉ tốt nghiệp
                  </Button>
                )}
              </div>
              <Progress
                percent={100}
                strokeColor="#fff"
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Space>
          </Card>
        )}

        {/* Completed Subjects */}
        <Card
          title={
            <>
              <BookOutlined /> Chứng chỉ môn học
            </>
          }
        >
          <Collapse
            className="credential-collapse"
            accordion
            activeKey={activeSemesterKey}
            onChange={(key) => setActiveSemesterKey(key)}
          >
            {summary &&
              summary.semesterSummaries.map((sem) => {
                const detail = semesterDetails[sem.semesterNumber];
                if (!detail) return null;

                const completedInSemester = detail.subjects.filter(
                (s) => s.status === "Completed"
              );
              if (completedInSemester.length === 0) return null;

              return (
                <Panel
                    header={`Học kỳ ${sem.semesterNumber} (${completedInSemester.length} môn)`}
                    key={sem.semesterNumber}
                >
                  <List
                    dataSource={completedInSemester}
                    renderItem={(subject) => (
                      <List.Item
                        actions={[
                          hasRequestForSubject(subject.subjectId) ? (
                            <Tag
                              color="success"
                              style={{
                                borderRadius: "8px",
                                padding: "4px 12px",
                                fontWeight: 600,
                                fontSize: "13px",
                              }}
                            >
                              <CheckOutlined style={{ marginRight: 4 }} />
                              Đã yêu cầu
                            </Tag>
                          ) : (
                            <Button
                              type="primary"
                              size="small"
                              icon={<SendOutlined />}
                              onClick={() => handleRequestSubject(subject)}
                              style={{
                                background:
                                  "linear-gradient(135deg, #1a94fc, #0ea5e9)",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 600,
                                  boxShadow:
                                    "0 2px 8px rgba(26, 148, 252, 0.3)",
                              }}
                            >
                              Yêu cầu chứng chỉ
                            </Button>
                          ),
                        ]}
                      >
                        <List.Item.Meta
                          title={`${subject.subjectCode} - ${subject.subjectName}`}
                          description={
                            <Space>
                              <Tag
                                style={{
                                  borderRadius: "8px",
                                  fontWeight: 600,
                                  background: "#e6f7ff",
                                  color: "#1a94fc",
                                  border: "1px solid #91d5ff",
                                }}
                              >
                                {subject.credits} tín chỉ
                              </Tag>
                              {subject.finalScore !== null && (
                                <Tag
                                  color="gold"
                                  style={{
                                    borderRadius: "8px",
                                    fontWeight: 600,
                                  }}
                                >
                                  Điểm: {subject.finalScore.toFixed(2)}
                                </Tag>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Panel>
              );
            })}
          </Collapse>
        </Card>

        {/* My Requests */}
        <Card
          title={
            <>
              <FileTextOutlined /> Yêu cầu của tôi
            </>
          }
        >
          {requests.length === 0 ? (
            <Empty description="Chưa có yêu cầu nào" />
          ) : (
            <List
              dataSource={requests}
              renderItem={(request) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {request.certificateType === "SubjectCompletion" && (
                          <BookOutlined />
                        )}
                        {request.certificateType === "RoadmapCompletion" && (
                          <TrophyOutlined />
                        )}
                        <Text strong>
                          {request.subjectName || "Chứng chỉ tốt nghiệp"}
                        </Text>
                        {getRequestStatusTag(request.status)}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary">
                          Gửi lúc:{" "}
                          {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                        </Text>
                        {request.studentNotes && (
                          <Text type="secondary">
                            Ghi chú: {request.studentNotes}
                          </Text>
                        )}
                        {request.adminNotes && (
                          <Text type="secondary">
                            Phản hồi: {request.adminNotes}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Space>

      {/* Request Modal */}
      <Modal
        title={
          modalType === "subject"
            ? "Yêu cầu chứng chỉ môn học"
            : "Yêu cầu chứng chỉ tốt nghiệp"
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={requesting !== null}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          {modalType === "subject" && selectedSubject && (
            <Alert
              message={`Môn học: ${selectedSubject.subjectCode} - ${selectedSubject.subjectName}`}
              description={`${selectedSubject.credits} tín chỉ${
                selectedSubject.finalScore !== null
                  ? ` · Điểm: ${selectedSubject.finalScore.toFixed(2)}`
                  : ""
              }`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {modalType === "graduation" && graduationStatus && (
            <Alert
              message="Chứng chỉ tốt nghiệp"
              description={`Bạn đã hoàn thành ${graduationStatus.completedSubjects}/${graduationStatus.totalSubjects} môn học`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="notes"
            label="Ghi chú (tùy chọn)"
            rules={[
              { max: 500, message: "Ghi chú không được vượt quá 500 ký tự" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú cho yêu cầu của bạn (nếu có)..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequestCredential;
