import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Popconfirm,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import type { SubjectDto, SubjectFormValues } from "../../../types/Subject";
import {
  fetchSubjectsApi,
  getSubjectByIdApi,
  createSubjectApi,
  updateSubjectApi,
  deleteSubjectApi,
  type CreateSubjectRequest,
} from "../../../services/admin/subjects/api";
import { useNavigate } from "react-router-dom";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

const DEFAULT_PAGE_SIZE = 10;

const SubjectsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [form] = Form.useForm<SubjectFormValues>();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
  });
  const [prerequisiteOptions, setPrerequisiteOptions] = useState<SubjectDto[]>(
    []
  );
  const [loadingPrerequisites, setLoadingPrerequisites] = useState(false);

  const stats = useMemo(() => {
    const total = pagination.totalCount;
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const totalOfferings = subjects.reduce(
      (sum, s) => sum + (s.totalOfferings || 0),
      0
    );
    const uniqueDepartments = new Set(
      subjects.map((s) => s.department || "Khác")
    ).size;
    return {
      total,
      totalCredits,
      totalOfferings,
      uniqueDepartments,
    };
  }, [pagination.totalCount, subjects]);

  const fetchData = useCallback(
    async (
      pageNumber = 1,
      pageSize = pagination.pageSize,
      search = searchText
    ) => {
      setLoading(true);
      try {
        const response = await fetchSubjectsApi({
          pageNumber,
          pageSize,
          searchTerm: search || undefined,
        });

        let data = response.data || [];

        // FE FILTER LẠI Ở ĐÂY 👇
        if (search) {
          const keyword = search.trim().toLowerCase();
          data = data.filter(
            (s) =>
              s.subjectCode.toLowerCase().includes(keyword) ||
              s.subjectName.toLowerCase().includes(keyword)
          );
        }

        setSubjects(data);

        setPagination({
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: data.length, // 👈 cập nhật lại total theo FE filter
        });
      } catch {
        toast.error("Không thể tải danh sách môn học");
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, searchText]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value);
  };

  const modalTitle = (
    <div className="subject-modal__title">
      <div className="subject-modal__title-icon">
        <BookOutlined />
      </div>
      <div className="subject-modal__title-text">
        <h3>{editingSubject ? "Cập nhật môn học" : "Thêm môn học mới"}</h3>
        <p>
          Nhập thông tin chính xác để đảm bảo chương trình đào tạo được quản lý
          đồng bộ.
        </p>
      </div>
    </div>
  );

  const loadPrerequisiteOptions = useCallback(async () => {
    if (loadingPrerequisites) {
      return;
    }
    setLoadingPrerequisites(true);
    try {
      const response = await fetchSubjectsApi({
        pageNumber: 1,
        pageSize: 500,
      });
      setPrerequisiteOptions(response.data || []);
    } catch {
      toast.error("Không thể tải danh sách môn tiên quyết");
    } finally {
      setLoadingPrerequisites(false);
    }
  }, [loadingPrerequisites]);

  const showModal = async (subject?: SubjectDto) => {
    if (subject) {
      try {
        setLoading(true);
        const subjectDetail = await getSubjectByIdApi(subject.id);
        setEditingSubject(subjectDetail);
        form.setFieldsValue({
          subjectCode: subjectDetail.subjectCode,
          subjectName: subjectDetail.subjectName,
          credits: subjectDetail.credits,
          description: subjectDetail.description,
          category: subjectDetail.category,
          department: subjectDetail.department,
          prerequisites: subjectDetail.prerequisites,
        });
      } catch {
        toast.error("Không thể tải thông tin môn học");
      } finally {
        setLoading(false);
      }
    } else {
      setEditingSubject(null);
      form.resetFields();
    }
    if (!prerequisiteOptions.length) {
      loadPrerequisiteOptions();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload: CreateSubjectRequest = {
          subjectCode: values.subjectCode.trim(),
          subjectName: values.subjectName.trim(),
          credits: values.credits,
          description: values.description?.trim() || undefined,
          category: values.category?.trim() || undefined,
          department: values.department?.trim() || undefined,
          prerequisites: values.prerequisites || undefined,
        };

        if (editingSubject) {
          await updateSubjectApi(editingSubject.id, payload);
          toast.success("Cập nhật môn học thành công");
        } else {
          await createSubjectApi(payload);
          toast.success("Tạo môn học thành công");
        }
        setIsModalVisible(false);
        form.resetFields();
        fetchData(pagination.pageNumber, pagination.pageSize);
      } catch {
        toast.error(
          editingSubject
            ? "Không thể cập nhật môn học"
            : "Không thể tạo môn học"
        );
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubjectApi(id);
      toast.success("Xóa môn học thành công");
      fetchData(pagination.pageNumber, pagination.pageSize);
    } catch {
      toast.error("Không thể xóa môn học");
    }
  };

  const columns: ColumnsType<SubjectDto> = [
    {
      title: "Môn học",
      key: "subjectInfo",
      width: 250,
      render: (_, record) => (
        <div
          className="subject-info clickable"
          onClick={() =>
            navigate(`/admin/subjects/${record.subjectCode}?id=${record.id}`)
          }
        >
          <div className="subject-info__code">{record.subjectCode}</div>
          <div className="subject-info__name">{record.subjectName}</div>
          {record.description && (
            <div className="subject-info__description">
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tín chỉ",
      dataIndex: "credits",
      key: "credits",
      width: 100,
      align: "center",
      render: (credits: number) => (
        <Tag color="purple" className="credit-tag">
          {credits}
        </Tag>
      ),
    },
    {
      title: "Tiên quyết",
      dataIndex: "prerequisites",
      key: "prerequisites",
      width: 160,
      render: (prerequisites?: string) =>
        prerequisites ? (
          <Tag color="orange">{prerequisites}</Tag>
        ) : (
          <Tag color="default">Không có</Tag>
        ),
    },
    {
      title: "Chuyên ngành",
      dataIndex: "department",
      key: "department",
      width: 180,
      render: (department: string | undefined, record: SubjectDto) => (
        <div className="department-cell">
          <div className="department-name">
            {department || "Chưa có chuyên ngành"}
          </div>
          {record.category && (
            <span className="category-pill">{record.category}</span>
          )}
        </div>
      ),
    },
    {
      title: "Lớp mở",
      dataIndex: "totalOfferings",
      key: "totalOfferings",
      width: 100,
      align: "center",
      render: (totalOfferings?: number) => (
        <span className="classes-count">{totalOfferings ?? 0}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa môn học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="primary"
              danger
              ghost
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const statsCards = [
    {
      label: "Tổng môn học",
      value: stats.total,
      accent: "total",
      icon: <BookOutlined />,
    },
    {
      label: "Tổng tín chỉ",
      value: stats.totalCredits,
      accent: "credits",
      icon: <BookOutlined />,
    },
    {
      label: "Tổng lớp học",
      value: stats.totalOfferings,
      accent: "classes",
      icon: <CalendarOutlined />,
    },
    {
      label: "Chuyên ngành",
      value: stats.uniqueDepartments,
      accent: "semesters",
      icon: <CalendarOutlined />,
    },
  ];

  return (
    <div className="subjects-management">
      <Card className="subjects-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <BookOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Môn học</h2>
            </div>
          </div>
          <div className="header-actions">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={() => showModal()}
            >
              Thêm môn học
            </Button>
          </div>
        </div>

        <div className="stats-compact">
          {statsCards.map((stat) => (
            <div key={stat.label} className={`stat-chip ${stat.accent}`}>
              <span className="value">{stat.value}</span>
              <span className="label">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="filters-row compact-layout">
          <Row gutter={[8, 8]} align="middle" className="filter-row-compact">
            <Col xs={24} sm={24} md={24}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Nhập mã môn học hoặc tên môn học..."
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                  size="large"
                  enterButton="Tìm kiếm"
                />
              </div>
            </Col>
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={subjects}
            loading={loading}
            rowKey="id"
            className="subjects-table custom-table"
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
              onChange: (page) =>
                fetchData(page, pagination.pageSize, searchText),
            }}
            scroll={{ x: 800 }}
            size="small"
          />
        </div>
      </Card>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingSubject ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={640}
        rootClassName="subject-modal"
        className="subject-modal"
        centered
        bodyStyle={{ maxHeight: "75vh", overflowY: "auto" }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ credits: 3 }}
          className="subject-modal__form"
        >
          <div className="subject-modal__grid">
            <Form.Item
              name="subjectCode"
              label="Mã môn học"
              rules={[{ required: true, message: "Vui lòng nhập mã môn học!" }]}
            >
              <Input placeholder="VD: AI401, BC202..." size="large" />
            </Form.Item>

            <Form.Item
              name="subjectName"
              label="Tên môn học"
              rules={[
                { required: true, message: "Vui lòng nhập tên môn học!" },
              ]}
            >
              <Input placeholder="Nhập tên môn học" size="large" />
            </Form.Item>
          </div>

          <div className="subject-modal__grid">
            <Form.Item
              name="credits"
              label="Số tín chỉ"
              rules={[
                { required: true, message: "Vui lòng nhập số tín chỉ!" },
                {
                  type: "number",
                  min: 1,
                  message: "Số tín chỉ phải lớn hơn 0!",
                },
              ]}
            >
              <InputNumber
                min={1}
                max={10}
                placeholder="Nhập số tín chỉ"
                style={{ width: "100%" }}
                size="large"
              />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả ngắn về môn học"
              autoSize={{ minRows: 3, maxRows: 4 }}
            />
          </Form.Item>

          <Form.Item
            name="prerequisites"
            label="Môn tiên quyết"
            extra="Chọn mã môn học phải hoàn thành trước (ví dụ: CS101). Bỏ trống nếu không có."
          >
            <Select
              placeholder="Chọn môn tiên quyết"
              allowClear
              showSearch
              optionFilterProp="label"
              size="large"
              onDropdownVisibleChange={(open) => {
                if (open && !prerequisiteOptions.length) {
                  loadPrerequisiteOptions();
                }
              }}
              notFoundContent={
                loadingPrerequisites ? (
                  <Spin size="small" />
                ) : (
                  "Không có dữ liệu"
                )
              }
              className="subject-modal__select"
            >
              {prerequisiteOptions
                .filter(
                  (subject) =>
                    !editingSubject || subject.id !== editingSubject.id
                )
                .map((subject) => (
                  <Option
                    key={subject.id}
                    value={subject.subjectCode}
                    label={`${subject.subjectCode} - ${subject.subjectName}`}
                  >
                    <div className="subject-modal__option">
                      <span className="code">{subject.subjectCode}</span>
                      <span className="name">{subject.subjectName}</span>
                    </div>
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Chuyên ngành"
            extra="VD: Công nghệ thông tin, Kinh tế, Ngôn ngữ Anh..."
          >
            <Input
              placeholder="Nhập chuyên ngành phụ trách môn học"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectsManagement;
