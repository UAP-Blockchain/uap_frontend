import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import type {
  AddSubjectToCurriculumRequest,
  CurriculumDetailDto,
  CurriculumSubjectDto,
} from "../../../types/Curriculum";
import type { SubjectDto } from "../../../types/Subject";
import {
  addSubjectToCurriculumApi,
  getCurriculumByIdApi,
  removeSubjectFromCurriculumApi,
} from "../../../services/admin/curriculums/api";
import { fetchSubjectsApi } from "../../../services/admin/subjects/api";
import "./CurriculumDetail.scss";

const { Title } = Typography;

const CurriculumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<CurriculumDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<SubjectDto[]>([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectSubmitting, setSubjectSubmitting] = useState(false);

  const [form] = Form.useForm<AddSubjectToCurriculumRequest>();

  const loadCurriculumDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const detail = await getCurriculumByIdApi(Number(id));
      setCurriculum(detail);
    } catch (error) {
      console.error("Failed to load curriculum detail", error);
      toast.error("Không thể tải chi tiết khung chương trình");
      navigate("/admin/curriculums");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadSubjectOptions = useCallback(async () => {
    setSubjectLoading(true);
    try {
      const response = await fetchSubjectsApi({
        pageSize: 1000,
        pageNumber: 1,
      });
      setSubjectOptions(response.data);
    } catch (error) {
      console.error("Failed to load subjects", error);
      toast.error("Không thể tải danh sách môn học");
    } finally {
      setSubjectLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurriculumDetail();
  }, [loadCurriculumDetail]);

  useEffect(() => {
    if (subjectModalOpen && subjectOptions.length === 0) {
      loadSubjectOptions();
    }
  }, [subjectModalOpen, subjectOptions.length, loadSubjectOptions]);

  const groupedSubjects = useMemo(() => {
    if (!curriculum) return [];
    const map = curriculum.subjects.reduce<
      Record<number, CurriculumSubjectDto[]>
    >((acc, subject) => {
      const semester = subject.semesterNumber || 0;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(subject);
      return acc;
    }, {});
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([semester, subjects]) => ({
        semester: Number(semester),
        subjects,
      }));
  }, [curriculum]);

  const openSubjectModal = () => {
    form.resetFields();
    setSubjectModalOpen(true);
  };

  const handleAddSubject = async () => {
    if (!curriculum) return;
    try {
      const values = await form.validateFields();
      setSubjectSubmitting(true);
      await addSubjectToCurriculumApi(curriculum.id, values);
      toast.success("Đã thêm môn vào khung chương trình");
      setSubjectModalOpen(false);
      form.resetFields();
      await loadCurriculumDetail();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSubjectSubmitting(false);
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!curriculum) return;
    Modal.confirm({
      title: "Xóa môn khỏi khung?",
      icon: <ExclamationCircleOutlined />,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await removeSubjectFromCurriculumApi(curriculum.id, subjectId);
          toast.success("Đã xóa môn khỏi khung chương trình");
          await loadCurriculumDetail();
        } catch {
          toast.error("Không thể xóa môn học");
        }
      },
    });
  };

  const columns: ColumnsType<CurriculumSubjectDto> = [
    {
      title: "Mã môn",
      dataIndex: "subjectCode",
      key: "subjectCode",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Tên môn học",
      dataIndex: "subjectName",
      key: "subjectName",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
      render: (value) => <Tag color="geekblue">{value} TC</Tag>,
    },
    {
      title: "Môn tiên quyết",
      key: "prerequisite",
      width: 280,
      ellipsis: true,
      render: (_, record) =>
        record.prerequisiteSubjectCode ? (
          <Tag color="purple" style={{ maxWidth: "100%" }}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {record.prerequisiteSubjectCode} - {record.prerequisiteSubjectName}
            </span>
          </Tag>
        ) : (
          <span style={{ color: "#d9d9d9" }}>Không có</span>
        ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xóa môn khỏi khung">
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleRemoveSubject(record.subjectId)}
          />
        </Tooltip>
      ),
    },
  ];

  if (loading && !curriculum) {
    return (
      <div className="curriculum-detail-loading">
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="curriculum-detail-empty">
        <Empty description="Không tìm thấy khung chương trình" />
      </div>
    );
  }

  return (
    <div className="curriculum-detail-page">
      <div className="curriculum-detail-header">
        <div className="header-left">
          <Button
            className="back-button"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/curriculums")}
          >
            Quay lại
          </Button>
          <div>
            <Title level={3} className="page-title">
              {curriculum.name}
            </Title>
            <Tag color="blue" style={{ marginTop: 8, fontSize: 14 }}>
              {curriculum.code}
            </Tag>
          </div>
        </div>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openSubjectModal}
            size="large"
          >
            Thêm môn học vào khung chương trình
          </Button>
        </div>
      </div>

      <Card className="curriculum-detail-card">
        <Card className="info-card" style={{ marginBottom: 24 }}>
          <Descriptions
            column={{ xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            bordered
            className="curriculum-descriptions"
          >
            <Descriptions.Item label="Mã chương trình">
              {curriculum.code}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tín chỉ">
              <Tag color="blue">{curriculum.totalCredits} tín chỉ</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Số môn học">
              <Tag color="geekblue">{curriculum.subjects?.length || 0} môn</Tag>
            </Descriptions.Item>
            {curriculum.description && (
              <Descriptions.Item label="Mô tả" span={2}>
                {curriculum.description}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card className="subjects-card">
          <Title level={4} style={{ marginBottom: 24 }}>
            Cấu trúc môn học
          </Title>

          {groupedSubjects.length === 0 ? (
            <Empty
              description="Chưa có môn học nào trong khung"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <div className="semester-tables">
              {groupedSubjects.map((group) => (
                <div key={group.semester} className="semester-section">
                  <div className="semester-header">
                    <Title level={5} style={{ margin: 0 }}>
                      Học kỳ {group.semester}
                    </Title>
                    <Tag color="blue">{group.subjects.length} môn</Tag>
                  </div>
                  <Table
                    columns={columns}
                    dataSource={group.subjects}
                    rowKey="id"
                    pagination={false}
                    size="middle"
                    className="semester-table custom-table"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </Card>

      <Modal
        open={subjectModalOpen}
        title="Thêm môn vào khung chương trình"
        onCancel={() => setSubjectModalOpen(false)}
        onOk={handleAddSubject}
        okText="Thêm môn"
        confirmLoading={subjectSubmitting}
        width={600}
      >
        {subjectLoading ? (
          <div className="modal-loading">
            <Spin />
          </div>
        ) : subjectOptions.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            message="Không tìm thấy dữ liệu môn học"
            description="Hãy tạo môn học trước khi thêm vào khung chương trình."
          />
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              label="Môn học"
              name="subjectId"
              rules={[{ required: true, message: "Vui lòng chọn môn" }]}
            >
              <Select
                showSearch
                placeholder="Chọn môn học"
                optionFilterProp="label"
                options={subjectOptions.map((subject) => ({
                  label: `${subject.subjectCode} - ${subject.subjectName} (${subject.credits} TC)`,
                  value: subject.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Học kỳ"
              name="semesterNumber"
              rules={[{ required: true, message: "Vui lòng nhập học kỳ" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            {curriculum && curriculum.subjects.length > 0 && (
              <Form.Item label="Môn tiên quyết" name="prerequisiteSubjectId">
                <Select
                  allowClear
                  placeholder="Chọn môn tiên quyết (nếu có)"
                  optionFilterProp="label"
                  options={curriculum.subjects.map((subject) => ({
                    label: `${subject.subjectCode} - ${subject.subjectName}`,
                    value: subject.subjectId,
                  }))}
                />
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CurriculumDetailPage;

