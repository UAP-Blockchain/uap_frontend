import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AppstoreOutlined,
  BookOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import type {
  AddSubjectToCurriculumRequest,
  CreateCurriculumRequest,
  CurriculumListItem,
  UpdateCurriculumRequest,
} from "../../../types/Curriculum";
import type { SubjectDto } from "../../../types/Subject";
import {
  addSubjectToCurriculumApi,
  createCurriculumApi,
  deleteCurriculumApi,
  fetchCurriculumsApi,
  updateCurriculumApi,
} from "../../../services/admin/curriculums/api";
import { fetchSubjectsApi } from "../../../services/admin/subjects/api";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

type SortOption = "recent" | "subject" | "credits";

const CurriculumManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState<CurriculumListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [loading, setLoading] = useState(false);
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: 10,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCurriculum, setEditingCurriculum] =
    useState<CurriculumListItem | null>(null);
  const [creationWizardOpen, setCreationWizardOpen] = useState(false);
  const [creationStep, setCreationStep] = useState(0);
  const [newCurriculum, setNewCurriculum] = useState<CurriculumListItem | null>(
    null
  );
  const [creationLoading, setCreationLoading] = useState(false);
  const [batchSubjectSubmitting, setBatchSubjectSubmitting] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<SubjectDto[]>([]);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [form] = Form.useForm<CreateCurriculumRequest>();
  const [creationForm] = Form.useForm<CreateCurriculumRequest>();
  const [subjectBatchForm] = Form.useForm<{
    subjects: AddSubjectToCurriculumRequest[];
  }>();

  const loadCurriculums = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCurriculumsApi();
      setCurriculums(data);
    } catch (error) {
      console.error("Failed to load curriculums", error);
      toast.error("Không thể tải danh sách khung chương trình");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurriculums();
  }, [loadCurriculums]);

  const loadSubjectOptions = useCallback(async () => {
    setSubjectLoading(true);
    try {
      const response = await fetchSubjectsApi({
        pageSize: 100,
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
    if (
      creationWizardOpen &&
      creationStep === 1 &&
      subjectOptions.length === 0
    ) {
      loadSubjectOptions();
    }
  }, [
    creationWizardOpen,
    creationStep,
    subjectOptions.length,
    loadSubjectOptions,
  ]);

  const stats = useMemo(() => {
    const total = curriculums.length;
    const totalCredits = curriculums.reduce(
      (sum, item) => sum + (item.totalCredits || 0),
      0
    );
    const totalSubjects = curriculums.reduce(
      (sum, item) => sum + (item.subjectCount || 0),
      0
    );
    const totalStudents = curriculums.reduce(
      (sum, item) => sum + (item.studentCount || 0),
      0
    );
    return { total, totalCredits, totalSubjects, totalStudents };
  }, [curriculums]);

  const filteredCurriculums = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const filtered = curriculums.filter((item) => {
      if (!keyword) return true;
      return (
        item.code.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        (item.description || "").toLowerCase().includes(keyword)
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "subject":
          return b.subjectCount - a.subjectCount;
        case "credits":
          return b.totalCredits - a.totalCredits;
        default:
          return b.id - a.id;
      }
    });
  }, [curriculums, searchTerm, sortOption]);

  const paginatedCurriculums = useMemo(() => {
    const start = (paginationState.current - 1) * paginationState.pageSize;
    const end = start + paginationState.pageSize;
    return filteredCurriculums.slice(start, end);
  }, [filteredCurriculums, paginationState]);

  const openCreateModal = () => {
    setEditingCurriculum(null);
    creationForm.resetFields();
    subjectBatchForm.setFieldsValue({ subjects: [{}] });
    setCreationStep(0);
    setNewCurriculum(null);
    setCreationWizardOpen(true);
  };

  const openEditModal = (record: CurriculumListItem) => {
    setEditingCurriculum(record);
    form.setFieldsValue({
      code: record.code,
      name: record.name,
      description: record.description,
      totalCredits: record.totalCredits,
    });
    setIsModalVisible(true);
  };

  const handleSubmitCurriculum = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (editingCurriculum) {
        await updateCurriculumApi(editingCurriculum.id, values);
        toast.success("Cập nhật khung chương trình thành công");
      } else {
        await createCurriculumApi(values);
        toast.success("Tạo khung chương trình thành công");
      }
      setIsModalVisible(false);
      loadCurriculums();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreationWizard = () => {
    setCreationWizardOpen(false);
    setCreationStep(0);
    setNewCurriculum(null);
    creationForm.resetFields();
    subjectBatchForm.resetFields();
  };

  const handleCreateCurriculumStep = async () => {
    try {
      const values = await creationForm.validateFields();
      setCreationLoading(true);
      const created = await createCurriculumApi(values);
      toast.success("Đã tạo khung chương trình. Tiếp tục thêm môn học.");
      setNewCurriculum(created);
      setCreationStep(1);
      subjectBatchForm.setFieldsValue({ subjects: [{}] });
      await loadCurriculums();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setCreationLoading(false);
    }
  };

  const handleSubmitSubjectsStep = async () => {
    if (!newCurriculum) {
      toast.error("Vui lòng tạo khung chương trình trước khi thêm môn.");
      return;
    }
    try {
      const values = await subjectBatchForm.validateFields();
      const payloads =
        values.subjects?.filter(
          (subject) => subject?.subjectId && subject?.semesterNumber
        ) || [];

      if (payloads.length === 0) {
        toast.warning("Vui lòng nhập ít nhất một môn học.");
        return;
      }

      setBatchSubjectSubmitting(true);

      for (const payload of payloads) {
        await addSubjectToCurriculumApi(newCurriculum.id, {
          subjectId: payload.subjectId,
          semesterNumber: payload.semesterNumber,
          prerequisiteSubjectId: payload.prerequisiteSubjectId || undefined,
        });
      }

      toast.success("Đã thêm môn học vào khung chương trình");
      await loadCurriculums();
      closeCreationWizard();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setBatchSubjectSubmitting(false);
    }
  };

  const handleDeleteCurriculum = (record: CurriculumListItem) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa khung chương trình ${record.code}?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await deleteCurriculumApi(record.id);
          toast.success("Đã xóa khung chương trình");
          loadCurriculums();
        } catch {
          toast.error("Không thể xóa khung chương trình");
        }
      },
    });
  };

  const handleViewDetail = (record: CurriculumListItem) => {
    navigate(`/admin/curriculums/${record.id}`);
  };

  const columns: ColumnsType<CurriculumListItem> = [
    {
      title: "Khung chương trình",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="curriculum-info">
          <div className="curriculum-code">{record.code}</div>
          <div className="curriculum-name">{record.name}</div>
          {record.description && (
            <div className="curriculum-description">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Tổng tín chỉ",
      dataIndex: "totalCredits",
      key: "credits",
      width: 140,
      render: (value) => <Tag color="blue">{value} tín chỉ</Tag>,
    },
    {
      title: "Môn học",
      dataIndex: "subjectCount",
      key: "subjects",
      width: 120,
      render: (value) => (
        <Tag icon={<BookOutlined />} color="geekblue">
          {value} môn
        </Tag>
      ),
    },
    {
      title: "Sinh viên",
      dataIndex: "studentCount",
      key: "students",
      width: 130,
      render: (value) => (
        <Tag color="green" icon={<AppstoreOutlined />}>
          {value || 0}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleViewDetail(record)}>
            Chi tiết
          </Button>
          <Button type="link" onClick={() => openEditModal(record)}>
            Chỉnh sửa
          </Button>
          <Tooltip title="Xóa khung chương trình">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCurriculum(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="curriculum-management">
      <Card className="curriculum-panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="icon-wrapper">
              <AppstoreOutlined />
            </div>
            <div>
              <p className="eyebrow">Chương trình đào tạo</p>
              <h2>Quản lý Khung chương trình</h2>
              <span>
                Kiểm soát danh sách khung, tín chỉ và cấu trúc môn học
              </span>
            </div>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadCurriculums}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
            >
              Khung chương trình mới
            </Button>
          </Space>
        </div>

        <div className="stats-compact">
          <div className="stat-chip total">
            <span className="value">{stats.total}</span>
            <span className="label">Khung chương trình</span>
          </div>
          <div className="stat-chip credits">
            <span className="value">{stats.totalCredits}</span>
            <span className="label">Tổng tín chỉ</span>
          </div>
          <div className="stat-chip subjects">
            <span className="value">{stats.totalSubjects}</span>
            <span className="label">Môn học</span>
          </div>
          <div className="stat-chip students">
            <span className="value">{stats.totalStudents}</span>
            <span className="label">Sinh viên áp dụng</span>
          </div>
        </div>

        <div className="filters-row compact-layout">
          <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
            <Col xs={24} sm={12} md={8}>
              <div className="filter-field">
                <label>Sắp xếp</label>
                <Select
                  value={sortOption}
                  onChange={(value: SortOption) => {
                    setSortOption(value);
                    setPaginationState({ current: 1, pageSize: paginationState.pageSize });
                  }}
                  size="middle"
                  className="sort-select"
                >
                  <Option value="recent">Mới nhất</Option>
                  <Option value="subject">Nhiều môn học</Option>
                  <Option value="credits">Tín chỉ cao</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={16}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Tìm theo tên, mã hoặc mô tả khung"
                  allowClear
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPaginationState({ current: 1, pageSize: paginationState.pageSize });
                  }}
                  onSearch={(value) => {
                    setSearchTerm(value);
                    setPaginationState({ current: 1, pageSize: paginationState.pageSize });
                  }}
                  prefix={<SearchOutlined />}
                  size="large"
                  enterButton="Tìm kiếm"
                  className="curriculum-search-input"
                />
              </div>
            </Col>
          </Row>
        </div>

        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={paginatedCurriculums}
          pagination={{
            current: paginationState.current,
            pageSize: paginationState.pageSize,
            total: filteredCurriculums.length,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total) => `Tổng ${total} khung chương trình`,
            position: ["bottomRight"],
            onChange: (page, pageSize) => {
              setPaginationState({ current: page, pageSize });
            },
            onShowSizeChange: (current, size) => {
              setPaginationState({ current: 1, pageSize: size });
            },
          }}
          locale={{
            emptyText: <Empty description="Chưa có khung chương trình" />,
          }}
          className="custom-table"
        />
      </Card>

      <Modal
        open={creationWizardOpen}
        title="Tạo khung chương trình mới"
        onCancel={closeCreationWizard}
        footer={null}
        width={900}
        destroyOnClose
        className="curriculum-creation-modal"
      >
        <Steps
          current={creationStep}
          items={[
            { title: "Tạo khung chương trình" },
            { title: "Thêm môn học vào khung chương trình" },
          ]}
          style={{ marginBottom: 24 }}
        />

        {creationStep === 0 && (
          <Form form={creationForm} layout="vertical">
            <Form.Item
              label="Mã khung"
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã khung" }]}
            >
              <Input placeholder="Ví dụ: SE-PRO-2024" />
            </Form.Item>
            <Form.Item
              label="Tên khung"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên khung" }]}
            >
              <Input placeholder="Tên chương trình đào tạo" />
            </Form.Item>
            <Form.Item label="Mô tả" name="description">
              <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về khung" />
            </Form.Item>
            <Form.Item
              label="Tổng tín chỉ"
              name="totalCredits"
              rules={[{ required: true, message: "Vui lòng nhập số tín chỉ" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Space style={{ justifyContent: "flex-end", width: "100%" }}>
              <Button onClick={closeCreationWizard}>Hủy</Button>
              <Button
                type="primary"
                loading={creationLoading}
                onClick={handleCreateCurriculumStep}
              >
                Tạo & tiếp tục
              </Button>
            </Space>
          </Form>
        )}

        {creationStep === 1 && (
          <>
            <Alert
              type="success"
              showIcon
              message={`Khung chương trình ${newCurriculum?.code} đã được tạo thành công`}
              description="Chọn các môn học và học kỳ tương ứng để thêm vào khung."
              style={{ marginBottom: 16 }}
            />
            {subjectLoading ? (
              <div className="modal-loading">
                <Spin />
              </div>
            ) : subjectOptions.length === 0 ? (
              <Alert
                type="warning"
                showIcon
                message="Chưa có dữ liệu môn học"
                description="Hãy tạo môn học trước khi thêm vào khung chương trình."
              />
            ) : (
              <Form
                form={subjectBatchForm}
                layout="vertical"
                initialValues={{ subjects: [{}] }}
              >
                <Form.List name="subjects">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Card
                          key={field.key}
                          size="small"
                          className="subject-entry-card"
                        >
                          <div className="subject-entry-header">
                            <strong>Môn #{index + 1}</strong>
                            {fields.length > 1 && (
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(field.name)}
                              />
                            )}
                          </div>
                          <Row gutter={12}>
                            <Col xs={24} md={12}>
                              <Form.Item
                                label="Môn học"
                                name={[field.name, "subjectId"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng chọn môn học",
                                  },
                                ]}
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
                            </Col>
                            <Col xs={24} md={6}>
                              <Form.Item
                                label="Học kỳ"
                                name={[field.name, "semesterNumber"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập học kỳ",
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={1}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} md={6}>
                              <Form.Item
                                label="Môn tiên quyết"
                                name={[field.name, "prerequisiteSubjectId"]}
                              >
                                <Select
                                  allowClear
                                  placeholder="Chọn (nếu có)"
                                  optionFilterProp="label"
                                  options={subjectOptions.map((subject) => ({
                                    label: `${subject.subjectCode} - ${subject.subjectName}`,
                                    value: subject.id,
                                  }))}
                                />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add({})}
                        block
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                      >
                        Thêm môn khác
                      </Button>
                    </>
                  )}
                </Form.List>
                <Space style={{ justifyContent: "flex-end", width: "100%" }}>
                  <Button onClick={closeCreationWizard}>Hủy</Button>
                  <Button
                    type="primary"
                    loading={batchSubjectSubmitting}
                    onClick={handleSubmitSubjectsStep}
                  >
                    Hoàn tất
                  </Button>
                </Space>
              </Form>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={isModalVisible}
        title={
          editingCurriculum
            ? "Chỉnh sửa khung chương trình"
            : "Khung chương trình mới"
        }
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmitCurriculum}
        confirmLoading={isSubmitting}
        okText={editingCurriculum ? "Lưu thay đổi" : "Tạo mới"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã khung"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã khung" }]}
          >
            <Input placeholder="Ví dụ: SE-PRO-2024" />
          </Form.Item>
          <Form.Item
            label="Tên khung"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên khung" }]}
          >
            <Input placeholder="Tên chương trình đào tạo" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về khung" />
          </Form.Item>
          <Form.Item
            label="Tổng tín chỉ"
            name="totalCredits"
            rules={[{ required: true, message: "Vui lòng nhập số tín chỉ" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CurriculumManagementPage;
