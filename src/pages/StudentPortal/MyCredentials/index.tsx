import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOutlined,
  CalendarOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import dayjs from "dayjs";
import "./MyCredentials.scss";

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CredentialData {
  key: string;
  id: string;
  type: "degree" | "transcript" | "certificate";
  title: string;
  institution: string;
  issueDate: string;
  status: "active" | "pending" | "revoked";
  gpa?: string;
  grade?: string;
  blockchainHash?: string;
  verificationCount: number;
}

const MyCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, (string | number | boolean)[] | null>
  >({});

  // Mock data - Comprehensive credentials list
  const credentialsData: CredentialData[] = [
    {
      key: "1",
      id: "deg_001",
      type: "degree",
      title: "Bachelor of Software Engineering",
      institution: "FPT University",
      issueDate: "2024-06-15",
      status: "active",
      gpa: "3.85",
      blockchainHash: "0x1a2b3c4d5e6f7890abcdef",
      verificationCount: 15,
    },
    {
      key: "2",
      id: "cert_001",
      type: "certificate",
      title: "AWS Cloud Practitioner",
      institution: "Amazon Web Services",
      issueDate: "2024-03-22",
      status: "active",
      blockchainHash: "0x5e6f7g8h9i0j1k2l3m4n5o",
      verificationCount: 8,
    },
    {
      key: "3",
      id: "trans_001",
      type: "transcript",
      title: "Academic Transcript - Fall 2023",
      institution: "FPT University",
      issueDate: "2024-01-10",
      status: "active",
      gpa: "3.75",
      blockchainHash: "0x9i0j1k2l3m4n5o6p7q8r9s",
      verificationCount: 12,
    },
    {
      key: "4",
      id: "cert_002",
      type: "certificate",
      title: "React Advanced Certification",
      institution: "Meta",
      issueDate: "2024-02-28",
      status: "pending",
      verificationCount: 0,
    },
    {
      key: "5",
      id: "trans_002",
      type: "transcript",
      title: "Academic Transcript - Spring 2023",
      institution: "FPT University",
      issueDate: "2023-06-20",
      status: "active",
      gpa: "3.60",
      blockchainHash: "0xa1b2c3d4e5f6789012345",
      verificationCount: 18,
    },
    {
      key: "6",
      id: "cert_003",
      type: "certificate",
      title: "Google Cloud Professional",
      institution: "Google Cloud",
      issueDate: "2023-11-15",
      status: "active",
      blockchainHash: "0xf6789012345a1b2c3d4e5",
      verificationCount: 6,
    },
    {
      key: "7",
      id: "cert_004",
      type: "certificate",
      title: "Microsoft Azure Fundamentals",
      institution: "Microsoft",
      issueDate: "2023-09-10",
      status: "active",
      blockchainHash: "0x12345a1b2c3d4e5f67890",
      verificationCount: 4,
    },
    {
      key: "8",
      id: "trans_003",
      type: "transcript",
      title: "Academic Transcript - Fall 2022",
      institution: "FPT University",
      issueDate: "2023-01-15",
      status: "active",
      gpa: "3.45",
      blockchainHash: "0xa1b2c3d4e5f678901234567",
      verificationCount: 9,
    },
  ];

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "degree":
        return <TrophyOutlined style={{ color: "#52c41a" }} />;
      case "certificate":
        return <SafetyCertificateOutlined style={{ color: "#1890ff" }} />;
      case "transcript":
        return <BookOutlined style={{ color: "#722ed1" }} />;
      default:
        return <FileTextOutlined style={{ color: "#8c8c8c" }} />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case "active":
        return <Tag color="success">Hoạt động</Tag>;
      case "pending":
        return <Tag color="warning">Đang chờ</Tag>;
      case "revoked":
        return <Tag color="error">Đã thu hồi</Tag>;
      default:
        return <Tag>Không xác định</Tag>;
    }
  };

  const handleTableChange: TableProps<CredentialData>["onChange"] = (
    _pagination,
    filters
  ) => {
    setFilteredInfo(
      (filters as Record<string, (string | number | boolean)[] | null>) || {}
    );
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleReset = () => {
    setFilteredInfo({});
    setSearchText("");
  };

  const handleViewDetail = (credentialId: string) => {
    navigate(`/student-portal/credentials/${credentialId}`);
  };

  // Filter data based on search text
  const filteredData = credentialsData.filter(
    (item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchText.toLowerCase()) ||
      item.type.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: TableColumnsType<CredentialData> = [
    {
      title: "Chứng chỉ",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <Space>
          <Avatar icon={getCredentialIcon(record.type)} />
          <div>
            <div>
              <Text strong>{text}</Text>
              {record.gpa && (
                <Tag color="gold" style={{ marginLeft: 8 }}>
                  GPA: {record.gpa}
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.institution}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Bằng cấp", value: "degree" },
        { text: "Chứng chỉ", value: "certificate" },
        { text: "Bảng điểm", value: "transcript" },
      ],
      filteredValue: (filteredInfo.type as string[]) || null,
      onFilter: (value, record) => record.type === value,
      render: (type) => {
        const config = {
          degree: { color: "green", text: "Bằng cấp" },
          certificate: { color: "blue", text: "Chứng chỉ" },
          transcript: { color: "purple", text: "Bảng điểm" },
        };
        return (
          <Tag color={config[type as keyof typeof config].color}>
            {config[type as keyof typeof config].text}
          </Tag>
        );
      },
    },
    {
      title: "Ngày cấp",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#8c8c8c" }} />
          {dayjs(date).format("DD/MM/YYYY")}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Hoạt động", value: "active" },
        { text: "Đang chờ", value: "pending" },
        { text: "Đã thu hồi", value: "revoked" },
      ],
      filteredValue: (filteredInfo.status as string[]) || null,
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Xác thực",
      key: "verification",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            {record.blockchainHash && (
              <Tooltip title={`Blockchain: ${record.blockchainHash}`}>
                <Badge dot color="green">
                  <LinkOutlined style={{ color: "#52c41a" }} />
                </Badge>
              </Tooltip>
            )}
            <Text style={{ marginLeft: 8, fontSize: 12 }}>
              {record.verificationCount} lần xác thực
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="my-credentials">
      {/* Filters and Search */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm kiếm chứng chỉ..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo loại"
              style={{ width: "100%" }}
              size="large"
              allowClear
              onChange={(value) => {
                setFilteredInfo({
                  ...filteredInfo,
                  type: value ? [value] : null,
                });
              }}
            >
              <Option value="degree">Bằng cấp</Option>
              <Option value="certificate">Chứng chỉ</Option>
              <Option value="transcript">Bảng điểm</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              size="large"
              allowClear
              onChange={(value) => {
                setFilteredInfo({
                  ...filteredInfo,
                  status: value ? [value] : null,
                });
              }}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="pending">Đang chờ</Option>
              <Option value="revoked">Đã thu hồi</Option>
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

      {/* Credentials Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          onChange={handleTableChange}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng số ${total} chứng chỉ`,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default MyCredentials;
