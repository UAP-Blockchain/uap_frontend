import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  LinkOutlined,
  SearchOutlined,
  ShareAltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import CredentialServices from "../../../services/credential/api.service";
import type { StudentCredentialDto } from "../../../types/Credential";
import "./MyCredentials.scss";

const { Text, Title } = Typography;
const { Search } = Input;
const { Option } = Select;

const certificateTypeMeta: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  SubjectCompletion: {
    label: "Hoàn thành môn học",
    color: "#1890ff",
    icon: <BookOutlined style={{ color: "#1890ff" }} />,
  },
  SemesterCompletion: {
    label: "Hoàn thành học kỳ",
    color: "#722ed1",
    icon: <CalendarOutlined style={{ color: "#722ed1" }} />,
  },
  RoadmapCompletion: {
    label: "Hoàn thành lộ trình",
    color: "#52c41a",
    icon: <TrophyOutlined style={{ color: "#52c41a" }} />,
  },
};

const statusMeta: Record<string, { color: string; text: string }> = {
  Issued: { color: "success", text: "Đã phát hành" },
  Pending: { color: "warning", text: "Đang xử lý" },
  Revoked: { color: "error", text: "Đã thu hồi" },
};

const MyCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<StudentCredentialDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await CredentialServices.getMyCredentials();
        setCredentials(data);
      } catch (err) {
        const messageText =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string }).message ||
          "Không thể tải danh sách chứng chỉ";
        setError(messageText);
        message.error(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchCredentials();
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return credentials.filter((credential) => {
      const matchesSearch =
        !keyword ||
        [
          credential.subjectName,
          credential.certificateType,
          credential.credentialId,
          credential.letterGrade,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(keyword));

      const matchesType =
        !filterType || credential.certificateType === filterType;

      const matchesStatus = !filterStatus || credential.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [credentials, searchText, filterType, filterStatus]);

  const summary = useMemo(() => {
    const issued = credentials.filter((item) => item.status === "Issued");
    const pending = credentials.filter((item) => item.status !== "Issued");
    const blockchain = credentials.filter((item) => item.isOnBlockchain);

    return {
      total: credentials.length,
      issued: issued.length,
      pending: pending.length,
      blockchain: blockchain.length,
    };
  }, [credentials]);

  const getCertificateTag = (type: string) => {
    const meta = certificateTypeMeta[type] || {
      label: type,
      color: "#8c8c8c",
      icon: <ShareAltOutlined style={{ color: "#8c8c8c" }} />,
    };

    return (
      <Tag
        color={meta.color}
        style={{
          borderRadius: 12,
          fontWeight: 600,
          padding: "2px 12px",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          {meta.icon}
        </span>
        {meta.label}
      </Tag>
    );
  };

  const getStatusTag = (status: string) => {
    const meta = statusMeta[status] || { color: "default", text: status };
    return (
      <Tag color={meta.color} icon={<CheckCircleOutlined />}>
        {meta.text}
      </Tag>
    );
  };

  const getCredentialIcon = (type: string) => {
    if (certificateTypeMeta[type]) {
      return certificateTypeMeta[type].icon;
    }
    return <CloudServerOutlined style={{ color: "#8c8c8c" }} />;
  };

  const handleReset = () => {
    setSearchText("");
    setFilterType(null);
    setFilterStatus(null);
  };

  const handleViewDetail = (credentialId: string) => {
    navigate(`/student-portal/credentials/${credentialId}`);
  };

  const handleOpenFile = (fileUrl: string) => {
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopyShareLink = async (shareableUrl: string) => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      message.success("Đã sao chép liên kết xác thực");
    } catch {
      message.error("Không thể sao chép liên kết");
    }
  };

  const columns: TableColumnsType<StudentCredentialDto> = [
    {
      title: "Chứng chỉ",
      dataIndex: "subjectName",
      key: "subjectName",
      render: (_value, record) => (
        <Space align="start">
          <Avatar icon={getCredentialIcon(record.certificateType)} size={48} />
          <div>
            <Text strong style={{ display: "block" }}>
              {record.subjectName ||
                record.roadmapName ||
                record.certificateType}
            </Text>
            <Space size={8} wrap>
              <Text type="secondary">{record.credentialId}</Text>
              {record.letterGrade && (
                <Tag color="gold" style={{ borderRadius: 8 }}>
                  {record.letterGrade}
                  {record.finalGrade !== null && record.finalGrade !== undefined
                    ? ` · ${record.finalGrade.toFixed(1)}`
                    : ""}
                </Tag>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "certificateType",
      key: "certificateType",
      render: (type: string) => getCertificateTag(type),
    },
    {
      title: "Ngày cấp",
      dataIndex: "issuedDate",
      key: "issuedDate",
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          {dayjs(date).isValid() ? dayjs(date).format("DD/MM/YYYY") : "—"}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Xác thực",
      key: "verification",
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            {record.isOnBlockchain ? (
              <Badge status="success" text="Blockchain" />
            ) : (
              <Badge status="default" text="Off-chain" />
            )}
            {record.verificationHash && (
              <Tooltip title={`Hash: ${record.verificationHash}`}>
                <ShareAltOutlined style={{ color: "#1a94fc" }} />
              </Tooltip>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.viewCount} lượt xem
          </Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.id)}
            />
          </Tooltip>
          {record.fileUrl && (
            <Tooltip title="Mở chứng chỉ">
              <Button
                type="text"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => handleOpenFile(record.fileUrl!)}
              />
            </Tooltip>
          )}
          {record.shareableUrl && (
            <Tooltip title="Sao chép liên kết chia sẻ">
              <Button
                type="text"
                size="small"
                icon={<LinkOutlined />}
                onClick={() => handleCopyShareLink(record.shareableUrl!)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="my-credentials student-roadmap">
      <Space direction="vertical" size={16} style={{ display: "flex" }}>
        <div className="roadmap-header">
          <div className="roadmap-header-content">
            <div className="roadmap-title-section">
              <Text style={{ color: "rgba(255, 255, 255, 0.9)" }}>
                CHỨNG CHỈ
              </Text>
              <Title
                level={2}
                style={{ margin: 0, color: "#ffffff", marginBottom: 4 }}
              >
                Chứng chỉ của tôi
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                Theo dõi các chứng chỉ học tập đã phát hành và trạng thái xác
                thực.
              </Text>
            </div>

            <div className="roadmap-metrics">
              <Card className="metric-card compact">
                <Statistic title="Tổng số chứng chỉ" value={summary.total} />
              </Card>
              <Card className="metric-card compact">
                <Statistic title="Đã phát hành" value={summary.issued} />
              </Card>
              <Card className="metric-card compact">
                <Statistic title="Đang xử lý" value={summary.pending} />
              </Card>
              <Card className="metric-card compact">
                <Statistic title="Lên blockchain" value={summary.blockchain} />
              </Card>
            </div>
          </div>
        </div>

        <Card style={{ marginBottom: 8 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Tìm kiếm theo môn học, mã chứng chỉ..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={setSearchText}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Lọc theo loại"
                style={{ width: "100%" }}
                size="large"
                allowClear
                value={filterType ?? undefined}
                onChange={(value) => setFilterType(value || null)}
              >
                <Option value="SubjectCompletion">Môn học</Option>
                <Option value="SemesterCompletion">Học kỳ</Option>
                <Option value="RoadmapCompletion">Lộ trình</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: "100%" }}
                size="large"
                allowClear
                value={filterStatus ?? undefined}
                onChange={(value) => setFilterStatus(value || null)}
              >
                <Option value="Issued">Đã phát hành</Option>
                <Option value="Pending">Đang xử lý</Option>
                <Option value="Revoked">Đã thu hồi</Option>
              </Select>
            </Col>
            <Col xs={24} md={4}>
              <Button
                size="large"
                icon={<FilterOutlined />}
                onClick={handleReset}
                style={{ width: "100%" }}
              >
                Đặt lại
              </Button>
            </Col>
          </Row>
        </Card>

        {error && (
          <Alert
            type="error"
            message="Không thể tải chứng chỉ"
            description={error}
            showIcon
          />
        )}

        <Card>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey={(record) => record.id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng số ${total} chứng chỉ`,
              }}
              scroll={{ x: 900 }}
              locale={{
                emptyText: <Empty description="Chưa có chứng chỉ nào" />,
              }}
            />
          )}
        </Card>
      </Space>
    </div>
  );
};

export default MyCredentials;
