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

// Hàm dịch message từ tiếng Anh sang tiếng Việt
const translateVerificationMessage = (message: string | null | undefined): string => {
	if (!message) return "";

	const trimmedMessage = message.trim();

	// Xử lý message có pattern "Certificate has been revoked. Reason: {reason}"
	if (trimmedMessage.includes("Certificate has been revoked")) {
		let translated = "Chứng chỉ đã bị thu hồi";
		
		// Tìm pattern "Reason: {reason}" - có thể có dấu chấm trước hoặc không, và có thể kết thúc bằng bất kỳ ký tự nào
		const reasonPattern = /Reason:\s*(.+)/i;
		const reasonMatch = trimmedMessage.match(reasonPattern);
		if (reasonMatch && reasonMatch[1]) {
			const reason = reasonMatch[1].trim();
			// Loại bỏ dấu chấm ở cuối nếu có
			const cleanReason = reason.replace(/\.$/, "");
			translated += `. Lý do: ${cleanReason}`;
			return translated;
		}
		
		// Xử lý "Certificate has been revoked on {date}"
		if (trimmedMessage.includes("on ")) {
			const datePattern = /on\s+(.+)/i;
			const dateMatch = trimmedMessage.match(datePattern);
			if (dateMatch && dateMatch[1]) {
				const date = dateMatch[1].trim().replace(/\.$/, "");
				return `Chứng chỉ đã bị thu hồi vào ngày ${date}`;
			}
		}
		
		return translated;
	}

	const translations: Record<string, string> = {
		"Certificate is valid and authentic": "Chứng chỉ hợp lệ và xác thực",
		"On-chain verification failed": "Xác minh on-chain thất bại",
		"On-chain record is revoked or expired": "Bản ghi on-chain đã bị thu hồi hoặc hết hạn",
		"Data does not match blockchain record (hash mismatch)": "Dữ liệu không khớp với bản ghi blockchain (hash không khớp)",
		"Error verifying certificate": "Lỗi khi xác minh chứng chỉ",
	};

	// Kiểm tra exact match
	if (translations[trimmedMessage]) {
		return translations[trimmedMessage];
	}

	// Kiểm tra partial match cho các message có thể chứa thông tin động
	for (const [key, value] of Object.entries(translations)) {
		if (trimmedMessage.includes(key)) {
			return trimmedMessage.replace(key, value);
		}
	}

	// Nếu không tìm thấy translation, trả về message gốc
	return trimmedMessage;
};

const VerificationResults: React.FC = () => {
	const { credentialId } = useParams<{ credentialId: string }>();
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [certificate, setCertificate] =
		useState<CertificatePublicDto | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [verifyLoading, setVerifyLoading] = useState(false);
	const [verifyResult, setVerifyResult] = useState<
		{ isValid: boolean; message: string } | null
	>(null);
	const [verifyError, setVerifyError] = useState<string | null>(null);
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
			setVerifyError(null);
			setVerifyResult(null);
			try {
				const data = await CredentialServices.getPublicCertificateById(
					credentialId
				);
				setCertificate(data as CertificatePublicDto);

				// Verify authenticity against blockchain
				const credentialNumber =
					searchParams.get("credentialNumber") ||
					(data as any).credentialId ||
					credentialId;
				const verificationHash =
					searchParams.get("verificationHash") ||
					(data as any).verificationHash ||
					undefined;

				setVerifyLoading(true);
				try {
					const verified = await CredentialServices.verifyCredential({
						credentialNumber: credentialNumber || undefined,
						verificationHash,
					});
					setVerifyResult({
						isValid: !!verified?.isValid,
						message: verified?.message || "",
					});
				} catch (verifyErr) {
					const messageText =
						((verifyErr as {
							response?: { data?: { message?: string; detail?: string } };
							message?: string;
						})?.response?.data?.message ||
							(verifyErr as { response?: { data?: { detail?: string } } })
								?.response?.data?.detail ||
							(verifyErr as { message?: string }).message ||
							"Không thể xác thực dữ liệu on-chain");
					setVerifyError(messageText);
					setVerifyResult(null);
				} finally {
					setVerifyLoading(false);
				}
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
							onClick={() => navigate("/verify")}
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
					onClick={() => navigate("/verify")}
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

			{verifyLoading ? (
				<div style={{ marginBottom: 16 }}>
					<Spin />
				</div>
			) : verifyResult ? (
				<div style={{ marginBottom: 16 }}>
					<Alert
						showIcon
						type={verifyResult.isValid ? "success" : "error"}
						message={
							verifyResult.isValid
								? "Xác thực: Hợp lệ"
								: "Xác thực: Không hợp lệ"
						}
						description={
							verifyResult.message
								? translateVerificationMessage(verifyResult.message)
								: ""
						}
					/>
				</div>
			) : verifyError ? (
				<div style={{ marginBottom: 16 }}>
					<Alert
						showIcon
						type="warning"
						message="Không thể xác thực on-chain"
						description={
							verifyError ? translateVerificationMessage(verifyError) : ""
						}
					/>
				</div>
			) : null}

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
