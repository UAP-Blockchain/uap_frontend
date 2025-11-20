import api from "../../config/axios";
import type {
  AttendanceDto,
  AttendanceFilterRequest,
  AttendanceStatisticsDto,
} from "../../types/Attendance";

interface AttendanceListResponse {
  success: boolean;
  message?: string;
  data: AttendanceDto[];
}

interface AttendanceStatsResponse {
  success: boolean;
  data: AttendanceStatisticsDto;
}

class AttendanceServices {
  /**
   * Get current student's attendance records
   * Endpoint: GET /api/students/me/attendance
   */
  static async getMyAttendance(
    params?: AttendanceFilterRequest
  ): Promise<AttendanceDto[]> {
    const response = await api.get<AttendanceListResponse>(
      "/students/me/attendance",
      {
        params,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể tải dữ liệu điểm danh."
      );
    }

    return response.data.data;
  }

  /**
   * Get attendance statistics for current student
   * Endpoint: GET /api/students/me/attendance/statistics
   */
  static async getMyAttendanceStatistics(
    classId?: string
  ): Promise<AttendanceStatisticsDto> {
    const response = await api.get<AttendanceStatsResponse>(
      "/students/me/attendance/statistics",
      {
        params: classId ? { classId } : undefined,
      }
    );

    if (!response.data.success) {
      throw new Error("Không thể tải thống kê điểm danh.");
    }

    return response.data.data;
  }
}

export default AttendanceServices;

