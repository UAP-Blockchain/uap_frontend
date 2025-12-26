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
  Table,
  Row,
  Col,
  Select,
} from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { ColumnsType } from "antd/es/table";
import RoadmapServices from "../../../services/roadmap/api.service";

// Cấu hình dayjs UTC plugin
dayjs.extend(utc);
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
import type {
  RequestCredentialRequest,
  CredentialRequestDto,
  GraduationEligibilityDto,
} from "../../../types/CredentialRequest";
import "./RequestCredential.scss";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Search } = Input;
const { Option } = Select;

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
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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
        request = {
        certificateType: "CurriculumCompletion",
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

  const formatDate = (value?: string) => {
    if (!value) return "-";
    // Parse UTC time từ ISO string và convert sang GMT+7 (+7 giờ)
    const d = dayjs.utc(value).add(7, "hour");
    return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : value;
  };

  const getRequestStatusTag = (status: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
      case "pending":
        return <Tag color="gold">Đang chờ</Tag>;
      case "approved":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã duyệt
          </Tag>
        );
      case "rejected":
    return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Đã từ chối
      </Tag>
    );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Filter requests based on search and filters
  const filteredRequests = useMemo(() => {
    let filtered = [...requests];

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.subjectName?.toLowerCase().includes(searchLower) ||
          r.certificateType?.toLowerCase().includes(searchLower) ||
          r.status?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (r) => r.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (r) => r.certificateType?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    return filtered;
  }, [requests, searchTerm, statusFilter, typeFilter]);

  const columns: ColumnsType<CredentialRequestDto> = [
    {
      title: "Loại chứng chỉ",
      dataIndex: "certificateType",
      key: "certificateType",
      width: 180,
      render: (type: string) => {
        const t = type?.toLowerCase();
        switch (t) {
          case "subjectcompletion":
            return <Tag color="blue">Môn học</Tag>;
          case "curriculumcompletion":
          case "roadmapcompletion":
            return <Tag color="purple">Tốt nghiệp</Tag>;
          case "semestercompletion":
            return <Tag color="green">Học kỳ</Tag>;
          default:
            return <Tag>{type}</Tag>;
        }
      },
    },
    {
      title: "Đối tượng",
      key: "target",
      width: 250,
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          {record.subjectName && <div>Môn: {record.subjectName}</div>}
          {record.semesterName && <div>Học kỳ: {record.semesterName}</div>}
          {record.roadmapName && <div>Lộ trình: {record.roadmapName}</div>}
          {!record.subjectName &&
            !record.semesterName &&
            !record.roadmapName && (
              <div style={{ color: "#888" }}>Chứng chỉ tốt nghiệp</div>
            )}
        </div>
      ),
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => formatDate(value),
    },
    {
      title: "Ngày xử lý",
      dataIndex: "processedAt",
      key: "processedAt",
      width: 180,
      render: (value?: string) => formatDate(value),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => getRequestStatusTag(status),
    },
  ];

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
          <div className="filters-row compact-layout" style={{ marginBottom: 16 }}>
            <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
              <Col xs={24} md={10}>
                <div className="filter-field">
                  <label>Tìm kiếm</label>
                  <Search
                    placeholder="Tìm theo loại chứng chỉ, môn học..."
                    allowClear
                    value={searchTerm}
                    prefix={<SearchOutlined />}
                    onSearch={(value) => setSearchTerm(value)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="large"
                    enterButton="Tìm kiếm"
                    style={{ width: "100%" }}
                  />
                </div>
              </Col>
              <Col xs={12} md={7}>
                <div className="filter-field">
                  <label>Trạng thái</label>
                  <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: "100%" }}
                    size="middle"
                    suffixIcon={<FilterOutlined />}
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="Pending">Đang chờ</Option>
                    <Option value="Approved">Đã duyệt</Option>
                    <Option value="Rejected">Đã từ chối</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={12} md={7}>
                <div className="filter-field">
                  <label>Loại chứng chỉ</label>
                  <Select
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: "100%" }}
                    size="middle"
                    suffixIcon={<FilterOutlined />}
                  >
                    <Option value="all">Tất cả loại</Option>
                    <Option value="SubjectCompletion">Môn học</Option>
                    <Option value="CurriculumCompletion">Tốt nghiệp</Option>
                    <Option value="RoadmapCompletion">Tốt nghiệp</Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </div>

          {filteredRequests.length === 0 ? (
            <Empty description="Chưa có yêu cầu nào" />
          ) : (
            <Table
              className="custom-table"
              rowKey="id"
              loading={requestsLoading}
              columns={columns}
              dataSource={filteredRequests}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["5", "10", "20", "50"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} yêu cầu`,
              }}
              scroll={{ x: 1000 }}
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
