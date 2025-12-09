import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Popconfirm,
  Row,
  Col,
  Modal,
  Form,
  Input,
  notification,
  TimePicker,
  Spin,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import type { TimeSlotDto } from "../../../types/TimeSlot";
import {
  getAllTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
} from "../../../services/admin/timeSlots/api";
import "./index.scss";

function TimeSlotsManagement() {
  // State cho modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [editingSlot, setEditingSlot] = useState<TimeSlotDto | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<TimeSlotDto[]>([]);

  // Khởi tạo API notification
  const [api, contextHolder] = notification.useNotification();

  // Load data từ API
  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const data = await getAllTimeSlots();
      setDataSource(data);
    } catch (error: any) {
      showNotification(
        "error",
        "Lỗi tải dữ liệu",
        error?.response?.data?.message || "Không thể tải danh sách ca học"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeSlots();
  }, []);

  // Cột của bảng
  const columns = [
    {
      title: "Tên ca học",
      dataIndex: "name",
      key: "name",
      width: 150,
      render: (text: string) => (
        <span style={{ fontWeight: 500, fontSize: "15px" }}>{text}</span>
      ),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_: any, record: TimeSlotDto) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockCircleOutlined style={{ color: "#1890ff" }} />
            <span style={{ fontWeight: 500 }}>
            {record.startTime} - {record.endTime}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: 4 }}>
            Thời lượng: {record.durationMinutes} phút
          </div>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: TimeSlotDto) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa ca học"
            description="Bạn có chắc chắn muốn xóa ca học này không?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
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

  // Xử lý sửa
  const handleEdit = (record: TimeSlotDto) => {
    setEditingSlot(record);
    setModalTitle("Chỉnh sửa ca học");
    
    // Parse time strings to Dayjs objects
    const startTime = dayjs(record.startTime, "HH:mm");
    const endTime = dayjs(record.endTime, "HH:mm");
    
    form.setFieldsValue({
      name: record.name,
      startTime: startTime.isValid() ? startTime : null,
      endTime: endTime.isValid() ? endTime : null,
    });
    setIsModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const result = await deleteTimeSlot(id);
      
      if (result.success) {
    showNotification(
      "success",
      "Xóa thành công",
          "Ca học đã được xóa khỏi hệ thống"
    );
        await loadTimeSlots();
      } else {
        showNotification(
          "error",
          "Xóa thất bại",
          result.message || "Không thể xóa ca học"
        );
      }
    } catch (error: unknown) {
      let errorMessage = "Đã xảy ra lỗi khi xóa ca học";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || 
                      axiosError.response?.data?.message || 
                      errorMessage;
      }
      showNotification(
        "error",
        "Xóa thất bại",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thêm mới
  const handleAddNew = () => {
    setEditingSlot(null);
    setModalTitle("Thêm ca học mới");
    form.resetFields();
    setIsModalVisible(true);
  };

  // Xử lý khi đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSlot(null);
    form.resetFields();
  };

  // Hàm hiển thị thông báo
  const showNotification = (
    type: "success" | "error" | "info" | "warning",
    message: string,
    description: string
  ) => {
    api[type]({
      message,
      description,
      placement: "topRight",
      duration: 4.5,
    });
  };

  // Xử lý khi submit form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Format time values
      const startTime = values.startTime
        ? dayjs(values.startTime).format("HH:mm")
        : "";
      const endTime = values.endTime
        ? dayjs(values.endTime).format("HH:mm")
        : "";

      const requestData = {
        name: values.name,
        startTime: startTime,
        endTime: endTime,
        };

      setLoading(true);

        if (editingSlot) {
        // Cập nhật ca học
        const result = await updateTimeSlot(editingSlot.id, requestData);
        
        if (result.success) {
          showNotification(
            "success",
            "Cập nhật thành công",
            `Ca học "${values.name}" đã được cập nhật`
          );
          await loadTimeSlots();
          setIsModalVisible(false);
          form.resetFields();
          setEditingSlot(null);
        } else {
          showNotification(
            "error",
            "Cập nhật thất bại",
            result.message || "Không thể cập nhật ca học"
          );
        }
      } else {
        // Thêm ca học mới
        const result = await createTimeSlot(requestData);
        
        if (result.success) {
          showNotification(
            "success",
            "Thêm mới thành công",
            `Ca học "${values.name}" đã được thêm vào hệ thống`
          );
          await loadTimeSlots();
        setIsModalVisible(false);
        form.resetFields();
        } else {
          showNotification(
            "error",
            "Thêm mới thất bại",
            result.message || "Không thể thêm ca học mới"
          );
        }
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Validation errors
        showNotification(
          "error",
          "Lỗi xác thực",
          "Vui lòng kiểm tra lại thông tin đã nhập"
        );
      } else {
        // API errors
        let errorMessage = "Đã xảy ra lỗi";
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { data?: { message?: string; detail?: string } } };
          errorMessage = axiosError.response?.data?.detail || 
                        axiosError.response?.data?.message || 
                        errorMessage;
        }
        showNotification(
          "error",
          "Lỗi",
          errorMessage
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-slots-page">
      {contextHolder}
      <Card bordered={false}>
        <div className="overview-header">
          <div className="title-block">
            <div className="title-icon">
              <ClockCircleOutlined />
            </div>
            <div>
              <p className="eyebrow">Bảng quản trị</p>
              <h2>Quản lý Ca học</h2>
              <span className="subtitle">
              Quản lý các khung giờ học trong hệ thống
              </span>
            </div>
          </div>
          <div className="header-actions">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadTimeSlots}
                loading={loading}
              >
                Làm mới
              </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="primary-action"
              onClick={handleAddNew}
            >
                Thêm ca học mới
            </Button>
          </div>
        </div>

        <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} ca học`,
            position: ["bottomRight"],
              pageSizeOptions: ["10", "20", "50", "100"],
          }}
          className="custom-table"
            scroll={{ x: 800 }}
        />
        </Spin>

        {/* Modal thêm/sửa ca học */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ClockCircleOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
              <span>{modalTitle}</span>
            </div>
          }
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={editingSlot ? "Cập nhật" : "Thêm mới"}
          cancelText="Hủy"
          width={600}
          confirmLoading={loading}
          destroyOnClose
        >
          <Form
            form={form}
            layout="vertical"
            name="timeSlot_form"
            requiredMark={false}
                >
                <Form.Item
              name="name"
              label="Tên ca học"
                  rules={[
                { required: true, message: "Vui lòng nhập tên ca học!" },
                { max: 100, message: "Tên ca học không được vượt quá 100 ký tự!" },
                  ]}
                >
              <Input
                placeholder="VD: Ca 1, Ca 2, Ca sáng, Ca chiều..."
                size="large"
              />
                </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startTime"
                  label="Giờ bắt đầu"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ bắt đầu!" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ bắt đầu"
                    size="large"
                    minuteStep={5}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endTime"
                  label="Giờ kết thúc"
                  rules={[
                    { required: true, message: "Vui lòng chọn giờ kết thúc!" },
                ({ getFieldValue }) => ({
                      validator(_: any, value: Dayjs) {
                        const startTime = getFieldValue("startTime");
                        if (!value || !startTime) {
                          return Promise.resolve();
                        }
                        if (value.isBefore(startTime) || value.isSame(startTime)) {
                      return Promise.reject(
                            new Error("Giờ kết thúc phải sau giờ bắt đầu!")
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ kết thúc"
                    size="large"
                    minuteStep={5}
                  />
            </Form.Item>
              </Col>
            </Row>

            {editingSlot && (
              <div
                style={{
                  padding: "12px",
                  background: "#f0f2f5",
                  borderRadius: "4px",
                  marginTop: "16px",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <div>
                    <strong>Thời lượng:</strong> {editingSlot.durationMinutes} phút
                  </div>
                </div>
              </div>
            )}
          </Form>
        </Modal>
      </Card>
    </div>
  );
}

export default TimeSlotsManagement;

