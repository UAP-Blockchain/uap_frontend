import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Switch,
  DatePicker,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  TeamOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type {
  UserDto,
  GetUsersRequest,
  UpdateUserRequest,
} from "../../../services/admin/users/api";
import {
  fetchUsersApi,
  getUserByIdApi,
  updateUserApi,
  activateUserApi,
  deactivateUserApi,
} from "../../../services/admin/users/api";
import "./index.scss";

const { Search } = Input;
const { Option } = Select;

interface UserFormValues {
  fullName: string;
  email: string;
  roleName: string;
  studentCode?: string;
  enrollmentDate?: Dayjs;
  teacherCode?: string;
  hireDate?: Dayjs;
  specialization?: string;
  phoneNumber?: string;
}

const DEFAULT_PAGE_SIZE = 10;

const RegisterUser: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Student");
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
  });

  const stats = useMemo(() => {
    const total = pagination.totalCount;
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    const students = users.filter((u) => u.roleName === "Student").length;
    const teachers = users.filter((u) => u.roleName === "Teacher").length;
    return {
      total,
      active,
      inactive,
      students,
      teachers,
    };
  }, [pagination.totalCount, users]);

  const fetchData = useCallback(
    async (
      pageNumber = 1,
      pageSize = pagination.pageSize,
      search = searchText,
      role = roleFilter
    ) => {
      if (!search || search.trim() === "") {
        setUsers([]);
        setPagination({
          pageNumber: 1,
          pageSize,
          totalCount: 0,
        });
        return;
      }

      setLoading(true);
      try {
        const response = await fetchUsersApi({
          roleName: role,
          searchTerm: search.trim(),
          page: pageNumber,
          pageSize,
        });
        setUsers(response.data || []);
        setPagination({
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || response.data?.length || 0,
        });
      } catch {
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [pagination.pageSize, searchText, roleFilter]
  );

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value && value.trim() !== "") {
      fetchData(1, pagination.pageSize, value, roleFilter);
    } else {
      setUsers([]);
      setPagination({
        pageNumber: 1,
        pageSize: pagination.pageSize,
        totalCount: 0,
      });
    }
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    if (searchText && searchText.trim() !== "") {
      fetchData(1, pagination.pageSize, searchText, value);
    } else {
      setUsers([]);
      setPagination({
        pageNumber: 1,
        pageSize: pagination.pageSize,
        totalCount: 0,
      });
    }
  };

  const showModal = async (user?: UserDto) => {
    if (user) {
      try {
        setLoading(true);
        const userDetail = await getUserByIdApi(user.id);
        setEditingUser(userDetail);
        form.setFieldsValue({
          fullName: userDetail.fullName,
          email: userDetail.email,
          roleName: userDetail.roleName,
          studentCode: userDetail.studentCode,
          enrollmentDate: userDetail.enrollmentDate
            ? dayjs(userDetail.enrollmentDate)
            : undefined,
          teacherCode: userDetail.teacherCode,
          hireDate: userDetail.hireDate ? dayjs(userDetail.hireDate) : undefined,
          specialization: userDetail.specialization,
          phoneNumber: userDetail.phoneNumber,
        });
      } catch {
        toast.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    } else {
      setEditingUser(null);
      form.resetFields();
      form.setFieldsValue({ roleName: roleFilter });
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      if (!editingUser) {
        message.warning("Chức năng tạo mới sẽ được thêm sau");
        return;
      }

      const payload: UpdateUserRequest = {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        roleName: values.roleName,
      };

      if (values.roleName === "Student") {
        if (values.studentCode) payload.studentCode = values.studentCode.trim();
        if (values.enrollmentDate) {
          payload.enrollmentDate = values.enrollmentDate.toISOString();
        }
      } else if (values.roleName === "Teacher") {
        if (values.teacherCode) payload.teacherCode = values.teacherCode.trim();
        if (values.hireDate) {
          payload.hireDate = values.hireDate.toISOString();
        }
        if (values.specialization)
          payload.specialization = values.specialization.trim();
        if (values.phoneNumber)
          payload.phoneNumber = values.phoneNumber.trim();
      }

      try {
        await updateUserApi(editingUser.id, payload);
        toast.success("Cập nhật người dùng thành công");
        setIsModalVisible(false);
        fetchData(pagination.pageNumber, pagination.pageSize);
      } catch {
        toast.error("Không thể cập nhật người dùng");
      }
    });
  };

  const handleToggleStatus = async (user: UserDto) => {
    try {
      if (user.isActive) {
        await deactivateUserApi(user.id);
        toast.success("Đã vô hiệu hóa người dùng");
      } else {
        await activateUserApi(user.id);
        toast.success("Đã kích hoạt người dùng");
      }
      fetchData(pagination.pageNumber, pagination.pageSize);
    } catch {
      toast.error("Không thể thay đổi trạng thái người dùng");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const columns: ColumnsType<UserDto> = [
    {
      title: "Người dùng",
      key: "userInfo",
      width: 250,
      render: (_, record) => (
        <div className="user-info">
          <div className="user-info__name">{record.fullName}</div>
          <div className="user-info__email">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Mã",
      key: "code",
      width: 120,
      render: (_, record) => (
        <span className="user-code">
          {record.studentCode || record.teacherCode || "-"}
        </span>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      width: 120,
      render: (roleName: string) => (
        <Tag color={roleName === "Student" ? "blue" : "green"}>
          {roleName === "Student" ? "Sinh viên" : "Giảng viên"}
        </Tag>
      ),
    },
    {
      title: "Ngày",
      key: "date",
      width: 150,
      render: (_, record) => (
        <div className="date-info">
          {record.enrollmentDate && (
            <div>Nhập học: {formatDate(record.enrollmentDate)}</div>
          )}
          {record.hireDate && (
            <div>Vào làm: {formatDate(record.hireDate)}</div>
          )}
          {!record.enrollmentDate && !record.hireDate && "-"}
        </div>
      ),
    },
    {
      title: "Thông tin thêm",
      key: "additional",
      width: 200,
      render: (_, record) => (
        <div className="additional-info">
          {record.specialization && (
            <div>Chuyên môn: {record.specialization}</div>
          )}
          {record.phoneNumber && (
            <div>Điện thoại: {record.phoneNumber}</div>
          )}
          {!record.specialization && !record.phoneNumber && "-"}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      render: (_, record) => (
        <div className="status-badge">
          {record.isActive ? (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Hoạt động
            </Tag>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              Vô hiệu hóa
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => showModal(record)}
              className="action-btn-edit"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
            <Switch
              checked={record.isActive}
              onChange={() => handleToggleStatus(record)}
              checkedChildren={<CheckCircleOutlined />}
              unCheckedChildren={<CloseCircleOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const statsCards = [
    {
      label: "Tổng người dùng",
      value: stats.total,
      accent: "total",
      icon: <UserOutlined />,
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      accent: "active",
      icon: <CheckCircleOutlined />,
    },
    {
      label: "Vô hiệu hóa",
      value: stats.inactive,
      accent: "inactive",
      icon: <CloseCircleOutlined />,
    },
    {
      label: roleFilter === "Student" ? "Sinh viên" : "Giảng viên",
      value: roleFilter === "Student" ? stats.students : stats.teachers,
      accent: "role",
      icon: roleFilter === "Student" ? <BookOutlined /> : <TeamOutlined />,
    },
  ];

  return (
    <div className="register-user">
      <Card className="users-panel">
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <UserOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Người dùng</h2>
            </div>
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
            <Col xs={24} sm={12} md={8}>
              <div className="filter-field">
                <label>Vai trò</label>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilter}
                  size="large"
                  className="role-select"
                >
                  <Option value="Student">Sinh viên</Option>
                  <Option value="Teacher">Giảng viên</Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} md={16}>
              <div className="filter-field">
                <label>Tìm kiếm</label>
                <Search
                  placeholder="Nhập tên, email hoặc mã để tìm kiếm..."
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
            dataSource={users}
            loading={loading}
            rowKey="id"
            className="users-table"
            pagination={{
              current: pagination.pageNumber,
              pageSize: pagination.pageSize,
              total: pagination.totalCount,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total}`,
              size: "small",
              onChange: (page) =>
                fetchData(page, pagination.pageSize, searchText, roleFilter),
            }}
            scroll={{ x: 1000 }}
            size="small"
            locale={{
              emptyText: searchText
                ? "Không tìm thấy kết quả"
                : "Nhập từ khóa tìm kiếm để hiển thị danh sách",
            }}
          />
        </div>
      </Card>

      <Modal
        title={editingUser ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? "Cập nhật" : "Tạo"}
        cancelText="Hủy"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ roleName: roleFilter }}
        >
          <Form.Item
            name="roleName"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select disabled={!!editingUser}>
              <Option value="Student">Sinh viên</Option>
              <Option value="Teacher">Giảng viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.roleName !== curr.roleName}>
            {({ getFieldValue }) => {
              const role = getFieldValue("roleName");
              if (role === "Student") {
                return (
                  <>
                    <Form.Item name="studentCode" label="Mã sinh viên">
                      <Input placeholder="Nhập mã sinh viên" />
                    </Form.Item>
                    <Form.Item name="enrollmentDate" label="Ngày nhập học">
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày nhập học"
                      />
                    </Form.Item>
                  </>
                );
              }
              if (role === "Teacher") {
                return (
                  <>
                    <Form.Item name="teacherCode" label="Mã giảng viên">
                      <Input placeholder="Nhập mã giảng viên" />
                    </Form.Item>
                    <Form.Item name="hireDate" label="Ngày vào làm">
                      <DatePicker
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày vào làm"
                      />
                    </Form.Item>
                    <Form.Item name="specialization" label="Chuyên môn">
                      <Input placeholder="Nhập chuyên môn" />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Số điện thoại">
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegisterUser;
