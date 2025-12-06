import api from "../../../config/axios";

// ==================== TYPES ====================

// Credential DTOs
export interface CredentialDto {
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

export interface CredentialDetailDto extends CredentialDto {
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

export interface CertificatePublicDto {
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
  issueDate: string;
  credentialHash: string;
  blockchainTxHash?: string;
  qrCodeData?: string;
  shareUrl?: string;
  status: string;
}

export interface StudentCredentialSummaryDto {
  totalCredentials: number;
  completionCertificates: number;
  subjectCertificates: number;
  semesterCertificates: number;
  roadmapCertificates: number;
  pendingRequests: number;
}

// Credential Request DTOs
export interface CredentialRequestDto {
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

// Paged Result
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Request/Response Types
export interface GetCredentialsRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  certificateType?: string;
  studentId?: string;
}

export interface GetCredentialRequestsRequest {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  status?: string;
  certificateType?: string;
  studentId?: string;
}

export interface CreateCredentialRequest {
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

export interface RequestCredentialRequest {
  certificateType: string;
  subjectId?: string;
  semesterId?: string;
  roadmapId?: string;
  notes?: string;
}

export interface ProcessCredentialRequestRequest {
  action: "Approve" | "Reject";
  notes?: string;
  rejectionReason?: string;
}

export interface ReviewCredentialRequest {
  action: "Approve" | "Reject";
  notes?: string;
}

export interface RevokeCredentialRequest {
  reason: string;
}

export interface VerifyCredentialRequest {
  credentialHash?: string;
  credentialId?: string;
}

export interface CredentialVerificationDto {
  isValid: boolean;
  credential?: CredentialDetailDto;
  message: string;
  verifiedAt: string;
}

export interface QRCodeResponse {
  credentialId: string;
  qrCodeData: string;
  size: number;
}

export interface CredentialShareDto {
  credentialId: string;
  shareUrl: string;
  qrCodeData: string;
}

// On-chain related DTOs
export interface IssueCredentialRequest {
  templateId?: string;
  certificateType: string;
  studentId: string;
  subjectId?: string;
  semesterId?: string;
  roadmapId?: string;
  completionDate: string;
  finalGrade?: number;
  letterGrade?: string;
  classification?: string;
}

export interface SaveCredentialOnChainRequest {
  transactionHash: string;
  blockNumber?: number;
  chainId?: number;
  contractAddress?: string;
}

// Response from approve credential request / issue including on-chain payload
export interface CredentialOnChainPayload extends CredentialDetailDto {
  onChainData?: {
    studentAddress: string;
    credentialType: string;
    credentialData: string;
    expiresAt: string; // ISO string or timestamp
  };
}

// ==================== CREDENTIALS API ====================

// GET /api/credentials - Get all credentials (Admin)
export const fetchCredentialsApi = async (
  params?: GetCredentialsRequest
): Promise<PagedResult<CredentialDto>> => {
  const response = await api.get<PagedResult<CredentialDto>>("/credentials", {
    params: {
      Page: params?.page,
      PageSize: params?.pageSize,
      SearchTerm: params?.searchTerm,
      Status: params?.status,
      CertificateType: params?.certificateType,
      StudentId: params?.studentId,
    },
  });
  return response.data;
};

// GET /api/credentials/{id} - Get credential by ID
export const getCredentialByIdApi = async (
  id: string
): Promise<CredentialDetailDto> => {
  const response = await api.get<CredentialDetailDto>(`/credentials/${id}`);
  return response.data;
};

// POST /api/credentials - Create credential (Admin)
export const createCredentialApi = async (
  payload: CreateCredentialRequest
): Promise<CredentialDetailDto> => {
  const response = await api.post<CredentialDetailDto>("/credentials", payload);
  return response.data;
};

// POST /api/credentials/issue - Issue credential and prepare on-chain payload (Admin)
export const issueCredentialApi = async (
  payload: IssueCredentialRequest
): Promise<CredentialDetailDto> => {
  const response = await api.post<CredentialDetailDto>(
    "/credentials/issue",
    payload
  );
  return response.data;
};

// DELETE /api/credentials/{id} - Revoke credential (Admin)
export const revokeCredentialApi = async (
  id: string,
  payload: RevokeCredentialRequest
): Promise<void> => {
  await api.delete(`/credentials/${id}`, { data: payload });
};

// GET /api/credentials/{id}/pdf - Download credential PDF
export const downloadCredentialPdfApi = async (id: string): Promise<Blob> => {
  const response = await api.get(`/credentials/${id}/pdf`, {
    responseType: "blob",
  });
  return response.data;
};

// GET /api/credentials/{id}/qrcode - Get QR code
export const getCredentialQRCodeApi = async (
  id: string,
  size: number = 300
): Promise<QRCodeResponse> => {
  const response = await api.get<QRCodeResponse>(`/credentials/${id}/qrcode`, {
    params: { size },
  });
  return response.data;
};

// GET /api/credentials/{id}/share - Get shareable link
export const getCredentialShareInfoApi = async (
  id: string
): Promise<CredentialShareDto> => {
  const response = await api.get<CredentialShareDto>(
    `/credentials/${id}/share`
  );
  return response.data;
};

// POST /api/credentials/{id}/on-chain - Save on-chain info after frontend issues transaction
export const saveCredentialOnChainApi = async (
  id: string,
  payload: SaveCredentialOnChainRequest
) => {
  const response = await api.post(`/credentials/${id}/on-chain`, payload);
  return response.data;
};

// GET /api/credentials/public/{id} - Public certificate view (No auth)
export const getPublicCertificateApi = async (
  id: string
): Promise<CertificatePublicDto> => {
  const response = await api.get<CertificatePublicDto>(
    `/credentials/verify/${id}`
  );
  return response.data;
};

// POST /api/credentials/{id}/approve - Approve credential (Admin)
export const approveCredentialApi = async (
  id: string,
  payload: ReviewCredentialRequest
): Promise<CredentialDetailDto> => {
  const response = await api.post<CredentialDetailDto>(
    `/credentials/${id}/approve`,
    payload
  );
  return response.data;
};

// POST /api/credentials/{id}/reject - Reject credential (Admin)
export const rejectCredentialApi = async (
  id: string,
  payload: ReviewCredentialRequest
): Promise<CredentialDetailDto> => {
  const response = await api.post<CredentialDetailDto>(
    `/credentials/${id}/reject`,
    payload
  );
  return response.data;
};

// POST /api/credentials/verify - Verify credential (Public)
export const verifyCredentialApi = async (
  payload: VerifyCredentialRequest
): Promise<CredentialVerificationDto> => {
  const response = await api.post<CredentialVerificationDto>(
    "/credentials/verify",
    payload
  );
  return response.data;
};

// ==================== STUDENT CREDENTIALS API ====================

// GET /api/students/{studentId}/credentials
export const getStudentCredentialsApi = async (
  studentId: string,
  certificateType?: string
): Promise<CredentialDto[]> => {
  const response = await api.get<CredentialDto[]>(
    `/students/${studentId}/credentials`,
    {
      params: { certificateType },
    }
  );
  return response.data;
};

// GET /api/students/me/credentials - Get current student's credentials
export const getMyCredentialsApi = async (
  certificateType?: string
): Promise<CredentialDto[]> => {
  const response = await api.get<CredentialDto[]>("/students/me/credentials", {
    params: { certificateType },
  });
  return response.data;
};

// GET /api/students/me/credentials/summary
export const getMyCredentialSummaryApi =
  async (): Promise<StudentCredentialSummaryDto> => {
    const response = await api.get<StudentCredentialSummaryDto>(
      "/students/me/credentials/summary"
    );
    return response.data;
  };

// GET /api/students/me/certificates/share
export const getMyCertificatesForSharingApi = async (): Promise<
  CertificatePublicDto[]
> => {
  const response = await api.get<CertificatePublicDto[]>(
    "/students/me/certificates/share"
  );
  return response.data;
};

// ==================== CREDENTIAL REQUESTS API ====================

// GET /api/credential-requests - Get all requests (Admin)
export const fetchCredentialRequestsApi = async (
  params?: GetCredentialRequestsRequest
): Promise<PagedResult<CredentialRequestDto>> => {
  const response = await api.get<PagedResult<CredentialRequestDto>>(
    "/credential-requests",
    {
      params: {
        Page: params?.page,
        PageSize: params?.pageSize,
        SearchTerm: params?.searchTerm,
        Status: params?.status,
        CertificateType: params?.certificateType,
        StudentId: params?.studentId,
      },
    }
  );
  return response.data;
};

// GET /api/credential-requests/{id} - Get request by ID
export const getCredentialRequestByIdApi = async (
  id: string
): Promise<CredentialRequestDto> => {
  const response = await api.get<CredentialRequestDto>(
    `/credential-requests/${id}`
  );
  return response.data;
};

// POST /api/credential-requests - Create request (Student)
export const createCredentialRequestApi = async (
  payload: RequestCredentialRequest
): Promise<CredentialRequestDto> => {
  const response = await api.post<CredentialRequestDto>(
    "/credential-requests",
    payload
  );
  return response.data;
};

// POST /api/credential-requests/{id}/approve - Approve request (Admin)
export const approveCredentialRequestApi = async (
  id: string,
  payload: ProcessCredentialRequestRequest
): Promise<CredentialDetailDto> => {
  const response = await api.post<CredentialDetailDto>(
    `/credential-requests/${id}/approve`,
    payload
  );
  return response.data;
};

// POST /api/credential-requests/{id}/reject - Reject request (Admin)
export const rejectCredentialRequestApi = async (
  id: string,
  payload: ProcessCredentialRequestRequest
): Promise<void> => {
  await api.post(`/credential-requests/${id}/reject`, payload);
};

// GET /api/students/me/credential-requests - Get my requests (Student)
export const getMyCredentialRequestsApi = async (
  status?: string
): Promise<CredentialRequestDto[]> => {
  const response = await api.get<CredentialRequestDto[]>(
    "/students/me/credential-requests",
    {
      params: { status },
    }
  );
  return response.data;
};

