// API Response Types (matching backend DTOs)
interface CredentialDto {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  certificateType: string;
  status: string;
  issueDate: string;
  credentialHash: string;
  blockchainTxHash?: string;
  subjectName?: string;
  semesterName?: string;
  roadmapName?: string;
  finalGrade?: number;
  letterGrade?: string;
  classification?: string;
}

interface CredentialDetailDto extends CredentialDto {
  templateId?: string;
  completionDate: string;
  ipfsHash?: string;
  issuedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface CertificatePublicDto {
  id: string;
  studentName: string;
  studentCode: string;
  certificateType: string;
  subjectName?: string;
  semesterName?: string;
  roadmapName?: string;
  finalGrade?: number;
  letterGrade?: string;
  classification?: string;
  issuedDate: string;
  completionDate?: string;
  credentialHash: string;
  blockchainTxHash?: string;
  qrCodeData?: string;
  shareUrl?: string;
  status: string;
  verificationStatus?: string;
  viewCount?: number;
  verificationHash?: string;
  credentialNumber?: string;
  fileUrl?: string;
}

interface StudentCredentialSummaryDto {
  totalCredentials: number;
  completionCertificates: number;
  subjectCertificates: number;
  semesterCertificates: number;
  roadmapCertificates: number;
  pendingRequests: number;
}

interface CredentialRequestDto {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  certificateType: string;
  status: string;
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  rejectionReason?: string;
  subjectId?: string;
  subjectName?: string;
  semesterId?: string;
  semesterName?: string;
  roadmapId?: string;
  roadmapName?: string;
}

// Form Data Types
interface CredentialFormData {
  studentId: string;
  templateId?: string;
  certificateType: string;
  subjectId?: string;
  semesterId?: string;
  roadmapId?: string;
  completionDate: string;
  finalGrade?: number;
  letterGrade?: string;
  classification?: string;
}

interface RequestCredentialFormData {
  certificateType: string;
  subjectId?: string;
  semesterId?: string;
  roadmapId?: string;
  notes?: string;
}

// Statistics
interface CredentialStats {
  total: number;
  active: number;
  revoked: number;
  pending: number;
  thisMonth: number;
  byType: {
    completion: number;
    subject: number;
    semester: number;
    roadmap: number;
  };
}

// Legacy type for backward compatibility
interface Credential extends CredentialDetailDto {}

interface StudentCredentialDto extends CredentialDetailDto {
  // Alias fields used in frontend components
  credentialId: string;
  issuedDate?: string;
  verificationHash?: string;
  shareableUrl?: string;
  isOnBlockchain?: boolean;
  viewCount?: number;
  fileUrl?: string;
}

export type {
  Credential,
  CredentialDto,
  CredentialDetailDto,
  CertificatePublicDto,
  StudentCredentialSummaryDto,
  CredentialRequestDto,
  CredentialFormData,
  RequestCredentialFormData,
  CredentialStats,
  StudentCredentialDto,
};