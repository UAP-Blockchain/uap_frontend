import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Row, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ClassStudentList.scss";

const { Title, Text } = Typography;

interface StudentData {
  index: number;
  image?: string;
  member: string; // Student ID
  code: string; // Last name initial + first name initial
  surname: string;
  middleName: string;
  givenName: string;
}

const ClassStudentList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromActivity = location.state?.fromActivity || false;

  // Mock student data (based on the image provided)
  const studentsData: StudentData[] = [
    {
      index: 1,
      image: "", // Empty like in original
      member: "HE173025",
      code: "Nghiêm",
      surname: "Ngọc",
      middleName: "Nhật",
      givenName: "",
    },
    {
      index: 2,
      image: "/api/placeholder/150/200", // Mock student photo
      member: "SE161310",
      code: "Nghiêm",
      surname: "Đức",
      middleName: "Hưng",
      givenName: "",
    },
    {
      index: 3,
      image: "/api/placeholder/150/200", // Mock student photo
      member: "SE162108",
      code: "Nghiêm",
      surname: "Như",
      middleName: "Tân",
      givenName: "",
    },
    {
      index: 4,
      image: "/api/placeholder/150/200", // Mock student photo (current user)
      member: "SE170117",
      code: "Nghiêm",
      surname: "Văn",
      middleName: "Hoàng",
      givenName: "",
    },
    {
      index: 5,
      image: "/api/placeholder/150/200", // Mock student photo
      member: "SE170118",
      code: "Huỳnh",
      surname: "Gia",
      middleName: "Bảo",
      givenName: "",
    },
    {
      index: 6,
      image: "",
      member: "SE170119",
      code: "Trần",
      surname: "Minh",
      middleName: "Khang",
      givenName: "",
    },
    {
      index: 7,
      image: "/api/placeholder/150/200",
      member: "SE170120",
      code: "Lê",
      surname: "Thanh",
      middleName: "Tùng",
      givenName: "",
    },
    {
      index: 8,
      image: "",
      member: "SE170121",
      code: "Phạm",
      surname: "Quốc",
      middleName: "Duy",
      givenName: "",
    },
    {
      index: 9,
      image: "/api/placeholder/150/200",
      member: "SE170122",
      code: "Ngô",
      surname: "Bảo",
      middleName: "Long",
      givenName: "",
    },
    {
      index: 10,
      image: "",
      member: "SE170123",
      code: "Vũ",
      surname: "Minh",
      middleName: "Đức",
      givenName: "",
    },
    // Add more students to make it 15-35 as requested
    {
      index: 11,
      image: "/api/placeholder/150/200",
      member: "SE170124",
      code: "Đặng",
      surname: "Thị",
      middleName: "Hoa",
      givenName: "",
    },
    {
      index: 12,
      image: "",
      member: "SE170125",
      code: "Bùi",
      surname: "Văn",
      middleName: "Nam",
      givenName: "",
    },
    {
      index: 13,
      image: "/api/placeholder/150/200",
      member: "SE170126",
      code: "Hoàng",
      surname: "Thị",
      middleName: "Lan",
      givenName: "",
    },
    {
      index: 14,
      image: "",
      member: "SE170127",
      code: "Đinh",
      surname: "Quang",
      middleName: "Huy",
      givenName: "",
    },
    {
      index: 15,
      image: "/api/placeholder/150/200",
      member: "SE170128",
      code: "Võ",
      surname: "Thành",
      middleName: "Đạt",
      givenName: "",
    },
    {
      index: 16,
      image: "",
      member: "SE170129",
      code: "Lý",
      surname: "Minh",
      middleName: "Tuấn",
      givenName: "",
    },
    {
      index: 17,
      image: "/api/placeholder/150/200",
      member: "SE170130",
      code: "Trịnh",
      surname: "Thị",
      middleName: "Mai",
      givenName: "",
    },
    {
      index: 18,
      image: "",
      member: "SE170131",
      code: "Đỗ",
      surname: "Văn",
      middleName: "Phú",
      givenName: "",
    },
    {
      index: 19,
      image: "/api/placeholder/150/200",
      member: "SE170132",
      code: "Cao",
      surname: "Thành",
      middleName: "Long",
      givenName: "",
    },
    {
      index: 20,
      image: "",
      member: "SE170133",
      code: "Dương",
      surname: "Minh",
      middleName: "Quang",
      givenName: "",
    },
    {
      index: 21,
      image: "/api/placeholder/150/200",
      member: "SE170134",
      code: "Mai",
      surname: "Thị",
      middleName: "Hương",
      givenName: "",
    },
    {
      index: 22,
      image: "",
      member: "SE170135",
      code: "Tô",
      surname: "Văn",
      middleName: "Sơn",
      givenName: "",
    },
    // Total: 22 students (within 15-35 range as requested)
  ];

  const handleBackClick = () => {
    if (fromActivity) {
      navigate(-1); // Go back to activity detail
    } else {
      navigate("/student-portal/timetable");
    }
  };

  const filteredStudents = studentsData;

  const columns: ColumnsType<StudentData> = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 80,
      align: "center",
      render: (index: number) => <Text strong>{index}</Text>,
    },
    {
      title: "ẢNH",
      dataIndex: "image",
      key: "image",
      width: 100,
      align: "center",
      render: (image: string) => (
        <Avatar
          size={64}
          src={image || undefined}
          icon={<UserOutlined />}
          style={{
            background: image ? "none" : "#f0f0f0",
            border: "1px solid #d9d9d9",
          }}
        />
      ),
    },
    {
      title: "MÃ SV",
      dataIndex: "member",
      key: "member",
      width: 120,
      render: (member: string) => <Text strong>{member}</Text>,
    },
    {
      title: "HỌ",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "TÊN ĐỆM",
      dataIndex: "surname",
      key: "surname",
      width: 100,
    },
    {
      title: "TÊN",
      dataIndex: "middleName",
      key: "middleName",
      width: 120,
    },
    {
      title: "TÊN GỌI",
      dataIndex: "givenName",
      key: "givenName",
      width: 120,
      render: (givenName: string) => givenName || "-",
    },
  ];

  return (
    <div className="class-student-list">
      {/* Header */}
      <div className="list-header">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBackClick}
          style={{ marginBottom: 16 }}
        >
          {fromActivity ? "Quay lại hoạt động" : "Quay lại thời khóa biểu"}
        </Button>

        <Row
          align="middle"
          justify="space-between"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Danh sách sinh viên
            </Title>
          </Col>
        </Row>
      </div>

      {/* Student List Table */}
      <Card className="student-table-card">
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="member"
          pagination={{
            total: filteredStudents.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng số ${total} sinh viên`,
          }}
          scroll={{ x: 800 }}
          size="middle"
          className="student-list-table"
          bordered
          rowClassName={(record) =>
            record.member === "SE170117" ? "current-user-row" : ""
          }
        />
      </Card>
    </div>
  );
};

export default ClassStudentList;
