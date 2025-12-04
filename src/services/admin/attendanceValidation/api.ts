import api from "../../../config/axios";

// Trạng thái validate ngày điểm danh ở mức hệ thống (không theo từng ngày)
export interface AttendanceValidationStatus {
  enabled: boolean;
  message?: string;
}

interface AttendanceValidationApiResponse {
  success: boolean;
  message?: string;
  data: {
    enabled: boolean;
  };
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
}

export default AttendanceValidationAdminService;
