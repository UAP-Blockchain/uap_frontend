import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
	Alert,
	Badge,
	Button,
	Card,
	Col,
	Divider,
	Modal,
	Row,
	Space,
	Spin,
	Tag,
	Tooltip,
	Typography,
} from "antd";
import {
	ArrowLeftOutlined,
	CalendarOutlined,
	DownloadOutlined,
	SafetyCertificateOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import CredentialServices from "../../../services/credential/api.service";
import type { CertificatePublicDto } from "../../../types/Credential";
import "./VerificationResults.scss";

const { Title, Text, Paragraph } = Typography;

const certificateLabels: Record<string, string> = {
	SubjectCompletion: "Chứng chỉ hoàn thành môn học",
	SemesterCompletion: "Chứng chỉ hoàn thành học kỳ",
	RoadmapCompletion: "Chứng chỉ hoàn thành lộ trình",
};

const VerificationResults: React.FC = () => {
	const { credentialId } = useParams<{ credentialId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [certificate, setCertificate] =
		useState<CertificatePublicDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchDetail = async () => {
			if (!credentialId) {
				setError("Thiếu mã chứng chỉ");
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);
			try {
				const data = await CredentialServices.getPublicCertificateById(
					credentialId
				);
				setCertificate(data as CertificatePublicDto);
				// Nếu cần có thể gọi thêm verifyCredential với query param ở đây
				// const credentialNumber = searchParams.get("credentialNumber") || credentialId;
				// const verificationHash = searchParams.get("verificationHash") || undefined;
				// void CredentialServices.verifyCredential({ credentialNumber, verificationHash });
			} catch (err) {
				const messageText =
					((err as {
						response?: { data?: { message?: string } };
						message?: string;
					})?.response?.data?.message ||
					(err as { message?: string }).message ||
					"Không thể tải dữ liệu chứng chỉ");
				setError(messageText);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchDetail();
	}, [credentialId, searchParams]);

	const certificateTitle = useMemo(() => {
		if (!certificate) return "";
		return (
			certificate.subjectName ||
			certificate.roadmapName ||
			certificateLabels[certificate.certificateType] ||
			certificate.certificateType
		);
	}, [certificate]);
	console.log("certificate", certificate);
	const formattedIssuedDate = certificate?.issuedDate
		? dayjs(certificate.issuedDate).format("DD/MM/YYYY")
		: "—";

	const handleDownloadPdf = () => {
		if (!certificate || !(certificate as any).fileUrl) {
			return;
		}
		const url = (certificate as any).fileUrl as string;
		window.open(url, "_blank");
	};

	if (isLoading) {
		return (
			<div className="verification-results-page">
				<Spin size="large" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="verification-results-page">
				<Alert
					type="error"
					message="Không thể xác thực chứng chỉ"
					description={error}
					showIcon
					action={
						<Button
							type="primary"
							onClick={() => navigate("/public-portal/verify")}
						>
							Quay lại cổng xác thực
						</Button>
					}
				/>
			</div>
		);
	}

	if (!certificate) {
		return (
			<div className="verification-results-page">
				<Alert
					message="Không tìm thấy chứng chỉ hoặc chứng chỉ không hợp lệ"
					type="warning"
					showIcon
				/>
			</div>
		);
	}

	const displayName = certificate.studentName || "—";
	const fileUrl = (certificate as any).fileUrl as string | undefined;

	return (
		<div className="verification-results-page">
			<div className="results-header">
				<Button
					icon={<ArrowLeftOutlined />}
					onClick={() => navigate("/public-portal/verify")}
				>
					Quay lại cổng xác thực
				</Button>
				<div className="certificate-actions">
					<Button
						type="primary"
						icon={<DownloadOutlined />}
						onClick={handleDownloadPdf}
						disabled={!(certificate as any).fileUrl}
					>
						Tải chứng chỉ PDF
					</Button>
					
				</div>
			</div>

			<Row gutter={[24, 24]}>
				<Col xs={24} lg={12}>
					<Card className="result-card" bordered={false}>
						<Space direction="vertical" size={12} style={{ width: "100%" }}>
							<Space>
								<SafetyCertificateOutlined
									style={{ fontSize: 32, color: "#1a94fc" }}
								/>
								<div>
									<Text type="secondary">
										{certificateLabels[certificate.certificateType] ||
												"Chứng chỉ"}
									</Text>
									<Title level={3} style={{ margin: 0 }}>
										{certificateTitle}
									</Title>
								</div>
							</Space>

							<Paragraph type="secondary" style={{ marginBottom: 0 }}>
								Chứng chỉ điện tử đã được xác thực bởi UAP Blockchain. Thông tin dưới
								dây được truy xuất trực tiếp từ hệ thống và không thể bị chỉnh sửa.
							</Paragraph>

							<Divider />

							<Space direction="vertical" size={12} style={{ width: "100%" }}>
								<div className="info-row">
									<span>Họ và tên</span>
									<span className="strong-text">{displayName}</span>
								</div>
								<div className="info-row">
									<span>Mã sinh viên</span>
									<span>{certificate.studentCode || "—"}</span>
								</div>
								<div className="info-row">
									<span>Mã chứng chỉ</span>
									<Tag color="blue">
										{(certificate as any).credentialNumber || certificate.id}
									</Tag>
								</div>
								<div className="info-row">
									<span>Ngày cấp</span>
									<span>
										{formattedIssuedDate}
									</span>
								</div>
								<div className="info-row">
									<span>Ngày hoàn thành</span>
									<span>
										{(certificate as any).completionDate
												? dayjs((certificate as any).completionDate).format("DD/MM/YYYY")
											: "—"}
									</span>
								</div>
								<div className="info-row">
									<span>Trạng thái</span>
									<Tag color={certificate.verificationStatus === "Verified" ? "green" : "orange"}>
										{certificate.verificationStatus}
									</Tag>
								</div>
								<div className="info-row">
									<span>Loại</span>
									<span>
										{certificateLabels[certificate.certificateType] ||
											certificate.certificateType}
									</span>
								</div>
								<div className="info-row">
									<span>Điểm chữ</span>
									<span>{certificate.letterGrade || "—"}</span>
								</div>
								<div className="info-row">
									<span>Điểm số</span>
									<span>
										{typeof (certificate as any).finalGrade === "number"
											? (certificate as any).finalGrade
											: "—"}
									</span>
								</div>
								{(certificate as any).verificationHash && (
									<div className="info-row">
										<span>Verification Hash</span>
										<Tooltip title={(certificate as any).verificationHash}>
											<Text code>
												{(certificate as any).verificationHash.slice(0, 12)}...
											</Text>
										</Tooltip>
									</div>
								)}
							</Space>
						</Space>
					</Card>
				</Col>
				<Col xs={24} lg={12}>
					<Card bordered={false} className="certificate-preview-card">
						{fileUrl ? (
							<iframe
								src={fileUrl}
								title="Certificate PDF"
								style={{ width: "100%", height: 600, border: "none" }}
							/>
						) : (
							<Paragraph type="secondary">
								Không tìm thấy file chứng chỉ để hiển thị.
							</Paragraph>
						)}
					</Card>
				</Col>
			</Row>

		</div>
	);
};

export default VerificationResults;
