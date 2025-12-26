import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  Space,
  Typography,
  Button,
  Table,
  Tag,
  Tabs,
  Input,
  Descriptions,
  Alert,
  Modal,
  Select,
} from "antd";
import { toast } from "react-toastify";
import {
  CheckCircleOutlined,
  CalendarOutlined,
  WarningOutlined,
  FileProtectOutlined,
} from "@ant-design/icons";
import AttendanceValidationAdminService, {
  type AttendanceValidationStatus,
  type CredentialInfo,
  type GradeInfo,
  type AttendanceInfo,
} from "../../../services/admin/attendanceValidation/api";
import "./index.scss";

const { Title, Text } = Typography;

const AttendanceValidationAdminPage: React.FC = () => {
  const [status, setStatus] = useState<AttendanceValidationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Tampering Type Selection
  const [tamperType, setTamperType] = useState<
    "credential" | "grade" | "attendance"
  >("credential");

  // Credential Tampering State
  const [credentials, setCredentials] = useState<CredentialInfo[]>([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialInfo | null>(null);
  const [tampering, setTampering] = useState(false);
  const [tamperFileUrl, setTamperFileUrl] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Grade Tampering State
  const [grades, setGrades] = useState<GradeInfo[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeInfo | null>(null);
  const [tamperingGrade, setTamperingGrade] = useState(false);
  const [tamperScoreValue, setTamperScoreValue] = useState<number>(0);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);

  // Attendance Tampering State
  const [attendances, setAttendances] = useState<AttendanceInfo[]>([]);
  const [loadingAttendances, setLoadingAttendances] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceInfo | null>(null);
  const [tamperingAttendance, setTamperingAttendance] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  const loadStatus = async () => {
    setLoadingStatus(true);
    setError(null);
    try {
      const data = await AttendanceValidationAdminService.getStatus();
      setStatus(data);
    } catch (err) {
      console.error("Không thể tải trạng thái validate ngày điểm danh:", err);
      setError("Không thể tải trạng thái validate ngày điểm danh.");
      setStatus(null);
    } finally {
      setLoadingStatus(false);
      setInitialized(true);
    }
  };

  const loadCredentials = async () => {
    setLoadingCredentials(true);
    try {
      const data = await AttendanceValidationAdminService.getCredentials();
      setCredentials(data);
    } catch (err) {
      console.error("Không thể tải danh sách chứng chỉ:", err);
      toast.error("Không thể tải danh sách chứng chỉ.");
    } finally {
      setLoadingCredentials(false);
    }
  };

  const loadGrades = async () => {
    setLoadingGrades(true);
    try {
      const data = await AttendanceValidationAdminService.getGrades();
      setGrades(data);
    } catch (err) {
      console.error("Không thể tải danh sách điểm số:", err);
      toast.error("Không thể tải danh sách điểm số.");
    } finally {
      setLoadingGrades(false);
    }
  };

  const loadAttendances = async () => {
    setLoadingAttendances(true);
    try {
      const data = await AttendanceValidationAdminService.getAttendances();
      setAttendances(data);
    } catch (err) {
      console.error("Không thể tải danh sách điểm danh:", err);
      toast.error("Không thể tải danh sách điểm danh.");
    } finally {
      setLoadingAttendances(false);
    }
  };

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const loadAll = async () => {
      await Promise.allSettled([loadStatus(), loadCredentials()]);
    };

    void loadAll();
  }, []);

  // Load data when tamper type changes
  useEffect(() => {
    if (tamperType === "grade" && grades.length === 0) {
      void loadGrades();
    } else if (tamperType === "attendance" && attendances.length === 0) {
      void loadAttendances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tamperType]);

  const handleUpdate = async (enabled: boolean) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await AttendanceValidationAdminService.updateStatus(
        enabled
      );
      setStatus(updated);
      const message =
        updated.enabled === true
          ? "Đã BẬT kiểm tra ngày điểm danh."
          : "Đã TẮT kiểm tra ngày điểm danh.";
      toast.success(message);
    } catch (err) {
      console.error(
        "Không thể cập nhật trạng thái validate ngày điểm danh:",
        err
      );
      setError("Không thể cập nhật trạng thái validate ngày điểm danh.");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenTamperModal = (record: CredentialInfo) => {
    setSelectedCredential(record);
    setTamperFileUrl(record.fileUrl);
    setIsModalOpen(true);
  };

  const handleCloseTamperModal = () => {
    setIsModalOpen(false);
    setSelectedCredential(null);
    setTamperFileUrl("");
  };

  const handleTamper = async () => {
    if (!selectedCredential) {
      toast.warning("Vui lòng chọn chứng chỉ cần giả mạo.");
      return;
    }
    if (!tamperFileUrl) {
      toast.warning("Vui lòng nhập đường dẫn file mới.");
      return;
    }

    setTampering(true);
    try {
      await AttendanceValidationAdminService.tamperCredential(
        selectedCredential.id,
        tamperFileUrl
      );
      // Reload lại danh sách để đảm bảo dữ liệu đầy đủ và cập nhật
      await loadCredentials();
      toast.success("Đã giả mạo dữ liệu chứng chỉ thành công!");
      handleCloseTamperModal();
    } catch (err) {
      console.error("Lỗi khi giả mạo chứng chỉ:", err);
      toast.error("Không thể giả mạo chứng chỉ.");
    } finally {
      setTampering(false);
    }
  };

  const handleOpenGradeTamperModal = (record: GradeInfo) => {
    setSelectedGrade(record);
    setTamperScoreValue(record.score);
    setIsGradeModalOpen(true);
  };

  const handleCloseGradeTamperModal = () => {
    setIsGradeModalOpen(false);
    setSelectedGrade(null);
    setTamperScoreValue(0);
  };

  const handleTamperGrade = async () => {
    if (!selectedGrade) {
      toast.warning("Vui lòng chọn điểm số cần giả mạo.");
      return;
    }
    if (tamperScoreValue < 0 || tamperScoreValue > 10) {
      toast.warning("Điểm số phải trong khoảng 0-10.");
      return;
    }

    setTamperingGrade(true);
    try {
      await AttendanceValidationAdminService.tamperGrade(
        selectedGrade.id,
        tamperScoreValue
      );
      // Reload lại danh sách để đảm bảo dữ liệu đầy đủ và cập nhật
      await loadGrades();
      toast.success("Đã giả mạo dữ liệu điểm số thành công!");
      handleCloseGradeTamperModal();
    } catch (err) {
      console.error("Lỗi khi giả mạo điểm số:", err);
      toast.error("Không thể giả mạo điểm số.");
    } finally {
      setTamperingGrade(false);
    }
  };

  const handleOpenAttendanceTamperModal = (record: AttendanceInfo) => {
    setSelectedAttendance(record);
    setIsAttendanceModalOpen(true);
  };

  const handleCloseAttendanceTamperModal = () => {
    setIsAttendanceModalOpen(false);
    setSelectedAttendance(null);
  };

  const handleTamperAttendance = async (isPresent: boolean) => {
    if (!selectedAttendance) {
      toast.warning("Vui lòng chọn điểm danh cần giả mạo.");
      return;
    }

    setTamperingAttendance(true);
    try {
      await AttendanceValidationAdminService.tamperAttendance(
        selectedAttendance.id,
        isPresent
      );
      // Reload lại danh sách để đảm bảo dữ liệu đầy đủ và cập nhật
      await loadAttendances();
      toast.success(
        `Đã giả mạo điểm danh thành công! (${
          isPresent ? "Có mặt" : "Vắng mặt"
        })`
      );
      handleCloseAttendanceTamperModal();
    } catch (err) {
      console.error("Lỗi khi giả mạo điểm danh:", err);
      toast.error("Không thể giả mạo điểm danh.");
    } finally {
      setTamperingAttendance(false);
    }
  };

  const configurationColumns = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "50%",
      align: "center" as const,
      render: () => {
        if (error) {
          return <Tag color="red">Lỗi tải dữ liệu</Tag>;
        }
        if (loadingStatus) {
          return <Tag>Đang tải...</Tag>;
        }
        if (!initialized || status === null) {
          return <Tag>Chưa có dữ liệu</Tag>;
        }
        return status.enabled ? (
          <Tag color="green">Đang Bật</Tag>
        ) : (
          <Tag color="orange">Đang Tắt</Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: "50%",
      align: "center" as const,
      render: () => (
        <Space>
          <Button
            size="small"
            type="primary"
            disabled={updating}
            loading={updating}
            onClick={() => void handleUpdate(true)}
          >
            Bật validate
          </Button>
          <Button
            size="small"
            danger
            disabled={updating}
            loading={updating}
            onClick={() => void handleUpdate(false)}
          >
            Tắt validate
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "configuration",
      label: "Cấu hình",
      children: (
        <Card
          title={
            <Space align="center">
              <CalendarOutlined />
              <span>Kiểm tra ngày điểm danh</span>
            </Space>
          }
        >
          <Table
            className="attendance-validation-table"
            pagination={false}
            size="middle"
            columns={configurationColumns}
            dataSource={[
              {
                key: "attendance-validation-status",
                status,
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: "tamper-credential",
      label: "Giả mạo dữ liệu",
      children: (
        <Card
          title={
            <Space align="center">
              <FileProtectOutlined />
              <span>Giả mạo dữ liệu (Test Verification)</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <Text strong style={{ marginRight: 8 }}>
                Loại giả mạo:
              </Text>
              <Select
                value={tamperType}
                onChange={setTamperType}
                style={{ width: 200 }}
                options={[
                  { label: "Giả mạo chứng chỉ", value: "credential" },
                  { label: "Giả mạo điểm số", value: "grade" },
                  { label: "Giả mạo điểm danh", value: "attendance" },
                ]}
              />
            </div>

            {tamperType === "credential" && (
              <>
                <Alert
                  message="Cảnh báo"
                  description="Chức năng này dùng để thay đổi đường dẫn file trong Database NHƯNG KHÔNG cập nhật Blockchain. Điều này sẽ khiến quá trình xác thực chứng chỉ thất bại (do hash file không khớp với hash trên blockchain)."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />

                <Table
                  dataSource={credentials}
                  rowKey="id"
                  loading={loadingCredentials}
                  pagination={{ pageSize: 10 }}
                  className="tamper-table"
                  columns={[
                    {
                      title: "Sinh viên",
                      key: "student",
                      render: (_, record) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.studentName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.studentCode}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Chứng chỉ",
                      dataIndex: "certificateName",
                      key: "certificateName",
                    },
                    {
                      title: "Ngày cấp",
                      dataIndex: "issuedDate",
                      key: "issuedDate",
                      render: (d: string) =>
                        new Date(d).toLocaleDateString("vi-VN"),
                      width: 120,
                    },
                    {
                      title: "File URL",
                      dataIndex: "fileUrl",
                      key: "fileUrl",
                      ellipsis: true,
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 100,
                      align: "center",
                      render: (_, record) => (
                        <Button
                          size="small"
                          type="primary"
                          danger
                          onClick={() => handleOpenTamperModal(record)}
                        >
                          Giả mạo
                        </Button>
                      ),
                    },
                  ]}
                />

                <Modal
                  title="Giả mạo dữ liệu chứng chỉ"
                  open={isModalOpen}
                  onCancel={handleCloseTamperModal}
                  className="tamper-modal"
                  footer={[
                    <Button key="cancel" onClick={handleCloseTamperModal}>
                      Hủy
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      danger
                      loading={tampering}
                      onClick={() => void handleTamper()}
                    >
                      Cập nhật Database
                    </Button>,
                  ]}
                >
                  {selectedCredential && (
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <Alert
                        message="Hành động này sẽ làm sai lệch dữ liệu giữa Database và Blockchain."
                        type="error"
                        showIcon
                      />

                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Sinh viên">
                          {selectedCredential.studentName} (
                          {selectedCredential.studentCode})
                        </Descriptions.Item>
                        <Descriptions.Item label="Chứng chỉ">
                          {selectedCredential.certificateName}
                        </Descriptions.Item>
                        <Descriptions.Item label="File URL hiện tại">
                          <Text copyable ellipsis>
                            {selectedCredential.fileUrl}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="IPFS Hash">
                          <Text copyable ellipsis>
                            {selectedCredential.ipfsHash}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>

                      <div>
                        <Text strong>URL File Giả mạo:</Text>
                        <Input
                          style={{ marginTop: 8 }}
                          value={tamperFileUrl}
                          onChange={(e) => setTamperFileUrl(e.target.value)}
                          placeholder="Nhập URL file giả mạo..."
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Nhập đường dẫn file mới (ví dụ: file đã bị chỉnh sửa
                          nội dung)
                        </Text>
                      </div>
                    </Space>
                  )}
                </Modal>
              </>
            )}

            {tamperType === "grade" && (
              <>
                <Alert
                  message="Cảnh báo"
                  description="Chức năng này dùng để thay đổi điểm số trong Database NHƯNG KHÔNG cập nhật Blockchain. Điều này sẽ khiến quá trình xác thực điểm số thất bại (do hash không khớp với hash trên blockchain)."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />

                <Table
                  dataSource={grades}
                  rowKey="id"
                  loading={loadingGrades}
                  pagination={{ pageSize: 10 }}
                  className="tamper-table"
                  scroll={{ x: 1000 }}
                  columns={[
                    {
                      title: "Sinh viên",
                      key: "student",
                      width: 180,
                      render: (_, record) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.studentName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.studentCode}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Môn học",
                      key: "subject",
                      width: 220,
                      render: (_, record) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.subjectName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.subjectCode}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Thành phần",
                      key: "gradeComponent",
                      width: 180,
                      render: (_, record) => (
                        <Text>{record.gradeComponentName || "—"}</Text>
                      ),
                    },
                    {
                      title: "Điểm số",
                      key: "score",
                      width: 120,
                      align: "center" as const,
                      render: (_, record) => (
                        <Space direction="vertical" size={0} align="center">
                          <Text strong style={{ fontSize: 16 }}>
                            {record.score}
                          </Text>
                          {record.letterGrade && (
                            <Tag color="blue" style={{ margin: 0 }}>
                              {record.letterGrade}
                            </Tag>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: "Cập nhật",
                      key: "updatedAt",
                      width: 150,
                      render: (_, record) => (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(record.updatedAt).toLocaleString("vi-VN")}
                        </Text>
                      ),
                    },
                    {
                      title: "Blockchain",
                      key: "blockchain",
                      width: 100,
                      align: "center" as const,
                      render: (_, record) => (
                        <Tag color={record.onChainTxHash ? "green" : "default"}>
                          {record.onChainTxHash ? "Đã lưu" : "Chưa lưu"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 100,
                      align: "center" as const,
                      fixed: "right" as const,
                      render: (_, record) => (
                        <Button
                          size="small"
                          type="primary"
                          danger
                          onClick={() => handleOpenGradeTamperModal(record)}
                        >
                          Giả mạo
                        </Button>
                      ),
                    },
                  ]}
                />

                <Modal
                  title="Giả mạo dữ liệu điểm số"
                  open={isGradeModalOpen}
                  onCancel={handleCloseGradeTamperModal}
                  className="tamper-modal"
                  footer={[
                    <Button key="cancel" onClick={handleCloseGradeTamperModal}>
                      Hủy
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      danger
                      loading={tamperingGrade}
                      onClick={() => void handleTamperGrade()}
                    >
                      Cập nhật Database
                    </Button>,
                  ]}
                >
                  {selectedGrade && (
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <Alert
                        message="Hành động này sẽ làm sai lệch dữ liệu giữa Database và Blockchain."
                        type="error"
                        showIcon
                      />

                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Sinh viên">
                          {selectedGrade.studentName} (
                          {selectedGrade.studentCode})
                        </Descriptions.Item>
                        <Descriptions.Item label="Môn học">
                          {selectedGrade.subjectName} (
                          {selectedGrade.subjectCode})
                        </Descriptions.Item>
                        <Descriptions.Item label="Thành phần điểm">
                          {selectedGrade.gradeComponentName || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điểm số hiện tại">
                          <Space>
                            <Text strong style={{ fontSize: 16 }}>
                              {selectedGrade.score}
                            </Text>
                            {selectedGrade.letterGrade && (
                              <Tag color="blue">
                                {selectedGrade.letterGrade}
                              </Tag>
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Cập nhật lần cuối">
                          {new Date(selectedGrade.updatedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái Blockchain">
                          <Tag
                            color={
                              selectedGrade.onChainTxHash ? "green" : "default"
                            }
                          >
                            {selectedGrade.onChainTxHash
                              ? "Đã lưu trên Blockchain"
                              : "Chưa lưu trên Blockchain"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>

                      <div>
                        <Text strong>Điểm số giả mạo:</Text>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.1}
                          style={{ marginTop: 8 }}
                          value={tamperScoreValue}
                          onChange={(e) =>
                            setTamperScoreValue(Number(e.target.value))
                          }
                          placeholder="Nhập điểm số giả mạo (0-10)..."
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Nhập điểm số mới (ví dụ: 9.5). Chỉ có điểm số sẽ được
                          cập nhật vào Database.
                        </Text>
                      </div>
                    </Space>
                  )}
                </Modal>
              </>
            )}

            {tamperType === "attendance" && (
              <>
                <Alert
                  message="Cảnh báo"
                  description="Chức năng này dùng để thay đổi trạng thái điểm danh trong Database NHƯNG KHÔNG cập nhật Blockchain. Điều này sẽ khiến quá trình xác thực điểm danh thất bại (do hash điểm danh không khớp với hash trên blockchain)."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />

                <Table
                  dataSource={attendances}
                  rowKey="id"
                  loading={loadingAttendances}
                  pagination={{ pageSize: 10 }}
                  className="tamper-table"
                  scroll={{ x: 1200 }}
                  columns={[
                    {
                      title: "Sinh viên",
                      key: "student",
                      width: 180,
                      render: (_, record) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.studentName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.studentCode}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Môn học",
                      key: "subject",
                      width: 220,
                      render: (_, record) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.subjectName}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.subjectCode}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: "Lớp",
                      dataIndex: "classCode",
                      key: "classCode",
                      width: 150,
                    },
                    {
                      title: "Ngày",
                      key: "date",
                      width: 120,
                      render: (_, record) =>
                        new Date(record.date).toLocaleDateString("vi-VN"),
                    },
                    {
                      title: "Ca học",
                      dataIndex: "timeSlotName",
                      key: "timeSlotName",
                      width: 100,
                    },
                    {
                      title: "Trạng thái",
                      key: "status",
                      width: 150,
                      align: "center" as const,
                      render: (_, record) => (
                        <Space direction="vertical" size={0} align="center">
                          {record.isPresent ? (
                            <Tag color="green">Có mặt</Tag>
                          ) : record.isExcused ? (
                            <Tag color="orange">Có phép</Tag>
                          ) : (
                            <Tag color="red">Vắng mặt</Tag>
                          )}
                          {record.notes && (
                            <Text
                              type="secondary"
                              style={{ fontSize: 11 }}
                              ellipsis
                            >
                              {record.notes}
                            </Text>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: "Ghi chú",
                      dataIndex: "notes",
                      key: "notes",
                      width: 200,
                      ellipsis: true,
                      render: (text: string) => text || "—",
                    },
                    {
                      title: "Blockchain",
                      key: "blockchain",
                      width: 100,
                      align: "center" as const,
                      render: (_, record) => (
                        <Tag
                          color={record.isOnBlockchain ? "green" : "default"}
                        >
                          {record.isOnBlockchain ? "Đã lưu" : "Chưa lưu"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Thao tác",
                      key: "action",
                      width: 100,
                      align: "center" as const,
                      fixed: "right" as const,
                      render: (_, record) => (
                        <Button
                          size="small"
                          type="primary"
                          danger
                          onClick={() =>
                            handleOpenAttendanceTamperModal(record)
                          }
                        >
                          Giả mạo
                        </Button>
                      ),
                    },
                  ]}
                />

                <Modal
                  title="Giả mạo dữ liệu điểm danh"
                  open={isAttendanceModalOpen}
                  onCancel={handleCloseAttendanceTamperModal}
                  className="tamper-modal"
                  footer={null}
                >
                  {selectedAttendance && (
                    <Space
                      direction="vertical"
                      style={{ width: "100%" }}
                      size="middle"
                    >
                      <Alert
                        message="Hành động này sẽ làm sai lệch dữ liệu giữa Database và Blockchain."
                        type="error"
                        showIcon
                      />

                      <Descriptions bordered size="small" column={1}>
                        <Descriptions.Item label="Sinh viên">
                          {selectedAttendance.studentName} (
                          {selectedAttendance.studentCode})
                        </Descriptions.Item>
                        <Descriptions.Item label="Môn học">
                          {selectedAttendance.subjectName} (
                          {selectedAttendance.subjectCode})
                        </Descriptions.Item>
                        <Descriptions.Item label="Lớp">
                          {selectedAttendance.classCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày">
                          {new Date(selectedAttendance.date).toLocaleDateString(
                            "vi-VN"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ca học">
                          {selectedAttendance.timeSlotName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái hiện tại">
                          <Space>
                            {selectedAttendance.isPresent ? (
                              <Tag color="green">Có mặt</Tag>
                            ) : selectedAttendance.isExcused ? (
                              <Tag color="orange">Có phép</Tag>
                            ) : (
                              <Tag color="red">Vắng mặt</Tag>
                            )}
                            {selectedAttendance.notes && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                ({selectedAttendance.notes})
                              </Text>
                            )}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú">
                          {selectedAttendance.notes || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái Blockchain">
                          <Tag
                            color={
                              selectedAttendance.isOnBlockchain
                                ? "green"
                                : "default"
                            }
                          >
                            {selectedAttendance.isOnBlockchain
                              ? "Đã lưu trên Blockchain"
                              : "Chưa lưu trên Blockchain"}
                          </Tag>
                        </Descriptions.Item>
                      </Descriptions>

                      <div>
                        <Text
                          strong
                          style={{ marginBottom: 12, display: "block" }}
                        >
                          {selectedAttendance.isPresent
                            ? "Đổi trạng thái thành Vắng mặt:"
                            : "Đổi trạng thái thành Có mặt:"}
                        </Text>
                        {selectedAttendance.isPresent ? (
                          <Button
                            danger
                            size="large"
                            block
                            loading={tamperingAttendance}
                            onClick={() => handleTamperAttendance(false)}
                            icon={<WarningOutlined />}
                          >
                            Vắng mặt (False)
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            size="large"
                            block
                            loading={tamperingAttendance}
                            onClick={() => handleTamperAttendance(true)}
                            icon={<CheckCircleOutlined />}
                          >
                            Có mặt (True)
                          </Button>
                        )}
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 12,
                            marginTop: 8,
                            display: "block",
                          }}
                        >
                          {selectedAttendance.isPresent
                            ? "Bấm nút để đổi trạng thái từ Có mặt sang Vắng mặt. Chỉ có trạng thái isPresent sẽ được cập nhật vào Database."
                            : "Bấm nút để đổi trạng thái từ Vắng mặt sang Có mặt. Chỉ có trạng thái isPresent sẽ được cập nhật vào Database."}
                        </Text>
                      </div>
                    </Space>
                  )}
                </Modal>
              </>
            )}
          </Space>
        </Card>
      ),
    },
  ];

  return (
    <div className="attendance-validation-page">
      <div className="page-header">
        <Space align="center" size={12}>
          <div className="icon-wrapper">
            <CheckCircleOutlined />
          </div>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Cấu hình và giả mạo dữ liệu
            </Title>
            <Text type="secondary">
              Quản lý việc cho phép hay khóa điểm danh theo từng ngày.
            </Text>
          </div>
        </Space>
      </div>

      <Tabs items={tabItems} defaultActiveKey="configuration" />
    </div>
  );
};

export default AttendanceValidationAdminPage;
