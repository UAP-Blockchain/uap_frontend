import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  DatePicker,
  message,
  Tag,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  CalendarOutlined,
  FilterOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CompressOutlined,
  ExpandAltOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import type { SemesterDto } from "../../../types/Semester";
import dayjs from "dayjs";
import "./index.scss";
import {
  closeSemesterApi,
  createSemesterApi,
  fetchSemestersApi,
  updateSemesterApi,
} from "../../../services/admin/semesters/api";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SemesterFormValues {
  name: string;
  dateRange: [Dayjs, Dayjs];
  isActive?: boolean;
  isClosed?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

const SemestersManagement: React.FC = () => {
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterDto | null>(
    null
  );
  const [form] = Form.useForm<SemesterFormValues>();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
  });

  const stats = useMemo(
    () => ({
      total: pagination.totalCount,
      active: semesters.filter((s) => s.isActive && !s.isClosed).length,
      closed: semesters.filter((s) => s.isClosed).length,
      totalSubjects: semesters.reduce((sum, s) => sum + s.totalSubjects, 0),
    }),
    [pagination.totalCount, semesters]
  );

  const yearOptions = useMemo(() => {
    const years = new Set(
      semesters.map((sem) => dayjs(sem.startDate).year().toString())
    );
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [semesters]);

  const buildStatusParams = (status: string) => {
    if (status === "active") return { isActive: true, isClosed: false };
    if (status === "inactive") return { isActive: false, isClosed: false };
    if (status === "closed") return { isClosed: true };
    return {};
  };

  const fetchData = useCallback(
    async (
      pageNumber = 1,
      pageSize = pagination.pageSize,
      search = searchText,
      status = statusFilter
    ) => {
      setLoading(true);
      try {
        const response = await fetchSemestersApi({
          pageNumber,
          pageSize,
          searchTerm: search || undefined,
          ...buildStatusParams(status),
        });
        setSemesters(response.data);
        setPagination({
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || response.data.length,
        });
      } catch {
        message.error("Không thể tải danh sách học kì");
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, searchText, statusFilter]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    fetchData(1, pagination.pageSize, searchText, value);
  };

  const handleYearFilter = (value: string) => {
    setYearFilter(value);
  };

  const showModal = (semester?: SemesterDto) => {
    if (semester) {
      setEditingSemester(semester);
      form.setFieldsValue({
        ...semester,
        dateRange: [dayjs(semester.startDate), dayjs(semester.endDate)],
        isActive: semester.isActive,
        isClosed: semester.isClosed,
      });
    } else {
      setEditingSemester(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (!values.dateRange || values.dateRange.length < 2) {
        message.error("Vui lòng chọn thời gian học kì!");
        return;
      }

      const [startValue, endValue] = values.dateRange;
      const payload = {
        name: values.name.trim(),
        startDate: startValue.toISOString(),
        endDate: endValue.toISOString(),
        isActive: values.isActive ?? true,
        isClosed: values.isClosed ?? false,
      };

      try {
        if (editingSemester) {
          await updateSemesterApi(editingSemester.id, payload);
          message.success("Cập nhật học kì thành công!");
        } else {
          await createSemesterApi(payload);
          message.success("Thêm học kì thành công!");
        }
        setIsModalVisible(false);
        fetchData(
          editingSemester ? pagination.pageNumber : 1,
          pagination.pageSize
        );
      } catch {
        message.error("Không thể lưu học kì");
      }
    });
  };

  const handleToggleStatus = async (
    record: SemesterDto,
    field: "isActive" | "isClosed"
  ) => {
    try {
      if (field === "isClosed" && !record.isClosed) {
        await closeSemesterApi(record.id);
      } else {
        await updateSemesterApi(record.id, {
          name: record.name,
          startDate: record.startDate,
          endDate: record.endDate,
          isActive: field === "isActive" ? !record.isActive : record.isActive,
          isClosed: field === "isClosed" ? !record.isClosed : record.isClosed,
        });
      }
      message.success("Cập nhật trạng thái học kì thành công!");
      fetchData(pagination.pageNumber, pagination.pageSize);
    } catch {
      message.error("Không thể cập nhật trạng thái");
    }
  };

  const formatDate = (dateString: string) =>
    dayjs(dateString).format("DD/MM/YYYY");

  const getDuration = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const days = end.diff(start, "day");
    return `${days} ngày`;
  };

  const filteredSemesters = useMemo(() => {
    if (yearFilter === "all") {
      return semesters;
    }
    return semesters.filter(
      (sem) => dayjs(sem.startDate).year().toString() === yearFilter
    );
  }, [semesters, yearFilter]);

  const columns: ColumnsType<SemesterDto> = [
    {
      title: "Tên học kì",
      key: "name",
      width: 200,
      render: (_, record) => (
        <div className="semester-name">
          <div className="semester-icon-wrapper">
            <CalendarOutlined className="semester-icon" />
          </div>
          <div className="semester-details">
            <div className="name">{record.name}</div>
            <div className="duration">
              <ClockCircleOutlined className="duration-icon" />
              {getDuration(record.startDate, record.endDate)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      width: 150,
      render: (date) => (
        <div className="date-info">
          <ClockCircleOutlined className="date-icon" />
          <span>{formatDate(date)}</span>
        </div>
      ),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      width: 150,
      render: (date) => (
        <div className="date-info">
          <ClockCircleOutlined className="date-icon" />
          <span>{formatDate(date)}</span>
        </div>
      ),
    },
    {
      title: "Số môn học",
      dataIndex: "totalSubjects",
      key: "totalSubjects",
      width: 120,
      align: "center",
      render: (count) => (
        <div className="subjects-count">
          <Tag color="blue" icon={<BookOutlined />} className="subject-tag">
            {count} môn
          </Tag>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 180,
      render: (_, record) => (
        <div className="status-badges">
          {record.isActive && !record.isClosed ? (
            <div className="status-badge status-active">
              <div className="status-dot"></div>
              <CheckCircleOutlined className="status-icon" />
              <span className="status-text">Đang hoạt động</span>
            </div>
          ) : record.isClosed ? (
            <div className="status-badge status-closed">
              <div className="status-dot"></div>
              <CloseCircleOutlined className="status-icon" />
              <span className="status-text">Đã đóng</span>
            </div>
          ) : (
            <div className="status-badge status-inactive">
              <div className="status-dot"></div>
              <ClockCircleOutlined className="status-icon" />
              <span className="status-text">Chưa kích hoạt</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
            />
          </Tooltip>
          {!record.isClosed && (
            <Tooltip title={record.isActive ? "Tắt kích hoạt" : "Kích hoạt"}>
              <Popconfirm
                title={`Bạn có chắc muốn ${
                  record.isActive ? "tắt kích hoạt" : "kích hoạt"
                } học kì này?`}
                onConfirm={() => handleToggleStatus(record, "isActive")}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type={record.isActive ? "default" : "primary"}
                  icon={
                    record.isActive ? (
                      <CloseCircleOutlined />
                    ) : (
                      <CheckCircleOutlined />
                    )
                  }
                  size="small"
                />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title="Đóng học kì">
            <Popconfirm
              title="Bạn có chắc muốn đóng học kì này? Hành động này không thể hoàn tác!"
              onConfirm={() => handleToggleStatus(record, "isClosed")}
              okText="Có"
              cancelText="Không"
              disabled={record.isClosed}
            >
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                disabled={record.isClosed}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const statsCards = [
    {
      label: "Tổng học kì",
      value: stats.total,
      icon: <CalendarOutlined />,
      accent: "total",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      icon: <CheckCircleOutlined />,
      accent: "active",
    },
    {
      label: "Đã đóng",
      value: stats.closed,
      icon: <CloseCircleOutlined />,
      accent: "closed",
    },
    {
      label: "Tổng môn học",
      value: stats.totalSubjects,
      icon: <BookOutlined />,
      accent: "subjects",
    },
  ];

  return (
    <div className="semesters-management">
      <Card className="semesters-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <CalendarOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Học kì</h2>
              <span className="subtitle">
                Theo dõi và cập nhật trạng thái học kì trong hệ thống
              </span>
            </div>
          </div>
          <div className="header-actions">
            <Button
              className="toggle-details-btn"
              icon={showDetails ? <CompressOutlined /> : <ExpandAltOutlined />}
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Thu gọn" : "Chi tiết"}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={() => showModal()}
            >
              Thêm học kì
            </Button>
          </div>
        </div>

        <div className="stats-compact">
          {statsCards.map((item) => (
            <div key={item.label} className={`stat-chip ${item.accent}`}>
              <span className="value">{item.value}</span>
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>

        {showDetails && (
          <div className="stats-inline">
            {statsCards.map((item) => (
              <div key={item.label} className={`stat-item ${item.accent}`}>
                <div className="stat-icon-wrapper">{item.icon}</div>
                <div className="stat-content">
                  <span className="stat-value">{item.value}</span>
                  <span className="stat-label">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className={`filters-row ${
            showDetails ? "expanded" : "compact-layout"
          }`}
        >
          <Row gutter={showDetails ? 16 : 12} align="middle">
            {showDetails && (
              <Col xs={24} md={12} className="filter-field search-field">
                <label>Tìm kiếm học kì</label>
                <Search
                  placeholder="Nhập tên học kì..."
                  allowClear
                  value={searchText}
                  onChange={(e) => handleSearch(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                  size="large"
                />
              </Col>
            )}
            <Col
              xs={showDetails ? 12 : 12}
              md={showDetails ? 6 : 12}
              className="filter-field status-field"
            >
              {showDetails && <label>Trạng thái</label>}
              <Select
                value={statusFilter}
                onChange={handleStatusFilter}
                suffixIcon={<FilterOutlined />}
                size={showDetails ? "large" : "middle"}
                className="status-select"
              >
                <Option value="all">Tất cả</Option>
                <Option value="active">Đang hoạt động</Option>
                <Option value="inactive">Chưa kích hoạt</Option>
                <Option value="closed">Đã đóng</Option>
              </Select>
            </Col>
            <Col
              xs={showDetails ? 12 : 12}
              md={showDetails ? 6 : 12}
              className="filter-field year-field"
            >
              {showDetails && <label>Năm</label>}
              <Select
                value={yearFilter}
                onChange={handleYearFilter}
                placeholder="Chọn năm"
                size={showDetails ? "large" : "middle"}
                allowClear={false}
              >
                <Option value="all">Tất cả năm</Option>
                {yearOptions.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Col>

            {showDetails && (
              <Col xs={24} className="filter-summary">
                <span>
                  Hoạt động: <strong>{stats.active}</strong>
                </span>
                <span>
                  Đã đóng: <strong>{stats.closed}</strong>
                </span>
              </Col>
            )}

            {!showDetails && (
              <>
                <Col xs={12} className="filter-meta">
                  Hoạt động: <strong>{stats.active}</strong>
                </Col>
                <Col xs={12} className="filter-meta text-right">
                  Đã đóng: <strong>{stats.closed}</strong>
                </Col>
              </>
            )}
          </Row>
        </div>

        <div className="table-section">
          <Table
            columns={columns}
            dataSource={filteredSemesters}
            loading={loading}
            rowKey="id"
            className="semesters-table"
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
              onChange: (page) =>
                fetchData(page, pagination.pageSize, searchText, statusFilter),
            }}
            scroll={{ x: 1000 }}
            size="small"
          />
        </div>
      </Card>

      <Modal
        title={editingSemester ? "Chỉnh sửa học kì" : "Thêm học kì mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingSemester ? "Cập nhật" : "Thêm"}
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true, isClosed: false }}
        >
          <Form.Item
            name="name"
            label="Tên học kì"
            rules={[{ required: true, message: "Vui lòng nhập tên học kì!" }]}
          >
            <Input placeholder="Ví dụ: Fall 2025, Spring 2025..." />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian học kì"
            rules={[
              { required: true, message: "Vui lòng chọn thời gian học kì!" },
            ]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Kích hoạt"
                valuePropName="checked"
              >
                <Switch checkedChildren="Có" unCheckedChildren="Không" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isClosed"
                label="Đã đóng"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Đã đóng"
                  unCheckedChildren="Chưa đóng"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SemestersManagement;
