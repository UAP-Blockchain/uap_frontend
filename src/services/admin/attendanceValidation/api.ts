import api from "../../../config/axios";

// Trạng thái validate ngày điểm danh ở mức hệ thống (không theo từng ngày)
export interface AttendanceValidationStatus {
  enabled: boolean;
  message?: string;
}

export interface CredentialInfo {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  certificateName: string;
  fileUrl: string;
  ipfsHash: string;
  issuedDate: string;
  isOnBlockchain: boolean;
}

export interface GradeInfo {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  gradeComponentId: string;
  gradeComponentName: string;
  score: number;
  letterGrade: string;
  updatedAt: string;
  onChainGradeId?: string | null;
  onChainTxHash?: string | null;
  onChainBlockNumber?: string | null;
  onChainChainId?: string | null;
  onChainContractAddress?: string | null;
}

interface AttendanceValidationApiResponse {
  success: boolean;
  message?: string;
  data: {
    enabled: boolean;
  };
}

interface CredentialApiResponse {
  success: boolean;
  message?: string;
  data: CredentialInfo;
}

interface CredentialListApiResponse {
  success: boolean;
  message?: string;
  data: CredentialInfo[];
}

interface GradeListApiResponse {
  success: boolean;
  message?: string;
  data: GradeInfo[];
}

interface GradeApiResponse {
  success: boolean;
  message?: string;
  data: GradeInfo;
}

export class AttendanceValidationAdminService {
  /**
   * Lấy trạng thái validate ngày điểm danh (bật/tắt) hiện tại
   * Backend: GET /api/validation/attendance_date
   */
  static async getStatus(): Promise<AttendanceValidationStatus> {
    const response = await api.get<AttendanceValidationApiResponse>(
      "/validation/attendance_date"
    );
    const body = response.data;
    return {
      enabled: body.data.enabled,
      message: body.message,
    };
  }

  /**
   * Cập nhật trạng thái validate ngày điểm danh (bật/tắt)
   * Backend: POST /api/validation/attendance_date
   */
  static async updateStatus(
    enabled: boolean
  ): Promise<AttendanceValidationStatus> {
    const response = await api.post<AttendanceValidationApiResponse>(
      "/validation/attendance_date",
      { enabled }
    );
    const body = response.data;
    return {
      enabled: body.data.enabled,
      message: body.message,
    };
  }

  /**
   * Lấy danh sách chứng chỉ (Top 50)
   * Backend: GET /api/validation/credentials
   */
  static async getCredentials(): Promise<CredentialInfo[]> {
    const response = await api.get<CredentialListApiResponse>(
      "/validation/credentials"
    );
    return response.data.data;
  }

  /**
   * Lấy thông tin chứng chỉ mới nhất
   * Backend: GET /api/validation/latest_credential
   */
  static async getLatestCredential(): Promise<CredentialInfo> {
    const response = await api.get<CredentialApiResponse>(
      "/validation/latest_credential"
    );
    return response.data.data;
  }

  /**
   * Giả mạo chứng chỉ theo ID
   * Backend: PUT /api/validation/tamper_credential/{id}
   */
  static async tamperCredential(
    id: string,
    fileUrl: string,
    ipfsHash?: string
  ): Promise<CredentialInfo> {
    const response = await api.put<CredentialApiResponse>(
      `/validation/tamper_credential/${id}`,
      { fileUrl, ipfsHash }
    );
    return response.data.data;
  }

  /**
   * Lấy danh sách điểm số
   * Backend: GET /api/validation/grades
   */
  static async getGrades(): Promise<GradeInfo[]> {
    const response = await api.get<GradeListApiResponse>(
      "/validation/grades"
    );
    return response.data.data;
  }

  /**
   * Giả mạo điểm số theo ID
   * Backend: PUT /api/validation/tamper_grade/{id}
   */
  static async tamperGrade(
    id: string,
    score: number
  ): Promise<GradeInfo> {
    const response = await api.put<GradeApiResponse>(
      `/validation/tamper_grade/${id}`,
      { score }
    );
    return response.data.data;
  }
}

export default AttendanceValidationAdminService;
