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
  TeamOutlined,
  BookOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import type {
  UserDto,
  UpdateUserRequest,
} from "../../../services/admin/users/api";
import {
  fetchUsersApi,
  updateUserApi,
  activateUserApi,
  deactivateUserApi,
} from "../../../services/admin/users/api";
import "./index.scss";
import { useNavigate } from "react-router-dom";
import type { SpecializationDto } from "../../../types/Specialization";

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
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [form] = Form.useForm<UserFormValues>();
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("Student");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalCount: 0,
  });
  const [allUsersStats, setAllUsersStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
  });

  // Fetch overall statistics (all users, students, teachers counts)
  const fetchAllUsersStatistics = useCallback(async () => {
    try {
      // Fetch total users (all roles, no filter)
      const allUsersRes = await fetchUsersApi({
        page: 1,
        pageSize: 1, // Just to get totalCount
      });
      
      // Fetch students count
      const studentsRes = await fetchUsersApi({
        roleName: "Student",
        page: 1,
        pageSize: 1,
      });
      
      // Fetch teachers count
      const teachersRes = await fetchUsersApi({
        roleName: "Teacher",
        page: 1,
        pageSize: 1,
      });

      setAllUsersStats({
        totalUsers: allUsersRes.totalCount || 0,
        totalStudents: studentsRes.totalCount || 0,
        totalTeachers: teachersRes.totalCount || 0,
      });
    } catch (error) {
      console.error("Error fetching all users statistics:", error);
    }
  }, []);

  // Calculate stats based on current filter and API data
  const stats = useMemo(() => {
    // Total: based on current filter (roleFilter) - accurate from API
    const total = pagination.totalCount;
    
    // Students/Teachers: use API stats when available, otherwise use current filter
    // When viewing a specific role, show that role's count from current filter
    // When not viewing that role, show from allUsersStats
    const students = roleFilter === "Student" 
      ? total 
      : (allUsersStats.totalStudents || 0);
    const teachers = roleFilter === "Teacher" 
      ? total 
      : (allUsersStats.totalTeachers || 0);
    
    // Active/Inactive: Only count from current page (not accurate for entire dataset)
    // These are approximate values for the current page only
    const active = users.filter((u) => u.isActive).length;
    const inactive = users.filter((u) => !u.isActive).length;
    
    return {
      total,
      active,
      inactive,
      students,
      teachers,
    };
  }, [pagination.totalCount, users, roleFilter, allUsersStats]);

  const fetchData = useCallback(
    async (
      pageNumber = 1,
      pageSize = DEFAULT_PAGE_SIZE,
      search = searchText,
      role = roleFilter,
      sortField?: string,
      order?: string
    ) => {
      setLoading(true);
      try {
        const response = await fetchUsersApi({
          roleName: role,
          searchTerm:
            search && search.trim() !== "" ? search.trim() : undefined,
          page: pageNumber,
          pageSize,
          sortBy: sortField,
          sortOrder: order,
        });
        const usersList = response.data || [];
        setUsers(usersList);
        setPagination({
          pageNumber: response.pageNumber || pageNumber,
          pageSize: response.pageSize || pageSize,
          totalCount: response.totalCount || usersList.length,
        });
      } catch {
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoading(false);
      }
    },
    [searchText, roleFilter]
  );

  useEffect(() => {
    fetchData(1, DEFAULT_PAGE_SIZE, "", roleFilter);
    fetchAllUsersStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchData(1, pagination.pageSize, value, roleFilter, sortBy, sortOrder);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    fetchData(1, pagination.pageSize, searchText, value, sortBy, sortOrder);
  };

  const openEditModal = (user: UserDto) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      roleName: user.roleName,
      studentCode: user.studentCode,
      enrollmentDate: user.enrollmentDate
        ? dayjs(user.enrollmentDate)
        : undefined,
      teacherCode: user.teacherCode,
      hireDate: user.hireDate ? dayjs(user.hireDate) : undefined,
      specialization: user.specialization,
      phoneNumber: user.phoneNumber,
    });
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
        if (values.phoneNumber) payload.phoneNumber = values.phoneNumber.trim();
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
    // Chỉ hiển thị cột chuyên ngành khi đang xem giáo viên
    ...(roleFilter === "Teacher"
      ? [
          {
            title: "Chuyên ngành",
            dataIndex: "specializations",
            key: "specializations",
            width: 200,
            render: (specializations: SpecializationDto[] | undefined) => {
              // Kiểm tra và hiển thị specializations
              if (
                specializations &&
                Array.isArray(specializations) &&
                specializations.length > 0
              ) {
                return (
                  <Space wrap size={[4, 4]}>
                    {specializations.map((spec) => (
                      <Tag key={spec.id} color="blue">
                        {spec.code} - {spec.name}
                      </Tag>
                    ))}
                  </Space>
                );
              }

              return <Tag color="default">Chưa có chuyên ngành</Tag>;
            },
          },
        ]
      : []),

    {
      title: "Số điện thoại",
      key: "phoneNumber",
      width: 150,
      render: (_, record) => (
        <div className="phone-number">
          {record.phoneNumber || "-"}
        </div>
      ),
    },
    {
      title: (() => {
        const isActive = sortBy === "CreatedAt";
        const isDescending = sortOrder === "desc";
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <span>Ngày tạo</span>
            <Button
              type="text"
              size="small"
              icon={
                isActive ? (
                  isDescending ? (
                    <ArrowDownOutlined />
                  ) : (
                    <ArrowUpOutlined />
                  )
                ) : (
                  <ArrowUpOutlined />
                )
              }
              onClick={(e) => {
                e.stopPropagation();
                const newSortBy = "CreatedAt";
                const newSortOrder =
                  isActive && !isDescending ? "desc" : "asc";
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                fetchData(
                  pagination.pageNumber,
                  pagination.pageSize,
                  searchText,
                  roleFilter,
                  newSortBy,
                  newSortOrder
                );
              }}
              style={{
                padding: 0,
                width: 20,
                height: 20,
                minWidth: 20,
                color: "#ffffff",
              }}
            />
          </div>
        );
      })(),
      key: "createdAt",
      width: 150,
      render: (_, record) => (
        <div className="created-date">
          {record.createdAt
            ? dayjs(record.createdAt).format("DD/MM/YYYY")
            : "-"}
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
              onClick={(e) => {
                e.stopPropagation();
                openEditModal(record);
              }}
              className="action-btn-edit"
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
            <Switch
              checked={record.isActive}
              onClick={(_checked, event) => event?.stopPropagation()}
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
      label: roleFilter === "Student" ? "Tổng sinh viên" : roleFilter === "Teacher" ? "Tổng giảng viên" : "Tổng người dùng",
      value: stats.total,
      accent: "total",
      icon: <UserOutlined />,
    },
    {
      label: roleFilter === "Student" ? "Sinh viên" : "Giảng viên",
      value: roleFilter === "Student" ? stats.students : stats.teachers,
      accent: "role",
      icon: roleFilter === "Student" ? <BookOutlined /> : <TeamOutlined />,
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      accent: "active",
      icon: <CheckCircleOutlined />,
      tooltip: "Số lượng trong trang hiện tại",
    },
    {
      label: "Vô hiệu hóa",
      value: stats.inactive,
      accent: "inactive",
      icon: <CloseCircleOutlined />,
      tooltip: "Số lượng trong trang hiện tại",
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
            <Tooltip key={stat.label} title={(stat as any).tooltip || ""}>
              <div className={`stat-chip ${stat.accent}`}>
              <span className="value">{stat.value}</span>
              <span className="label">{stat.label}</span>
            </div>
            </Tooltip>
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
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
              pageSizeOptions: ["10", "20", "50", "100"],
              size: "default",
              onChange: (page, pageSize) => {
                fetchData(page, pageSize || pagination.pageSize, searchText, roleFilter, sortBy, sortOrder);
              },
              onShowSizeChange: (current, size) => {
                fetchData(1, size, searchText, roleFilter, sortBy, sortOrder);
              },
            }}
            onRow={(record) => ({
              onClick: () => navigate(`/admin/user-management/${record.id}`),
            })}
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

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.roleName !== curr.roleName}
          >
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
