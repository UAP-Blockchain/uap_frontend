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

  /**
   * Take attendance for a slot
   * Endpoint: POST /api/attendance
   */
  static async takeAttendance(
    request: import("../../types/Attendance").TakeAttendanceRequest
  ): Promise<void> {
    await api.post("/attendance", request);
  }

  /**
   * Get attendance for a specific slot
   * Endpoint: GET /api/slots/{slotId}/attendance
   */
  static async getSlotAttendance(
    slotId: string
  ): Promise<import("../../types/Attendance").SlotAttendanceDto> {
    const response = await api.get<{
      success: boolean;
      data: import("../../types/Attendance").SlotAttendanceDto;
    }>(`/slots/${slotId}/attendance`);

    if (!response.data.success) {
      throw new Error("Không thể tải dữ liệu điểm danh.");
    }

    return response.data.data;
  }

  /**
   * Take attendance for a specific slot
   * Endpoint: POST /api/slots/{slotId}/attendance
   */
  static async takeSlotAttendance(
    slotId: string,
    students: Array<{
      studentId: string;
      isPresent: boolean;
      notes?: string;
    }>
  ): Promise<void> {
    await api.post(`/slots/${slotId}/attendance`, { students });
  }

  /**
   * Update attendance for a specific slot
   * Endpoint: PUT /api/slots/{slotId}/attendance
   */
  static async updateSlotAttendance(
    slotId: string,
    students: Array<{
      studentId: string;
      isPresent: boolean;
      notes?: string;
    }>
  ): Promise<void> {
    await api.put(`/slots/${slotId}/attendance`, { students });
  }

  /**
   * Mark all students as present for a slot
   * Endpoint: POST /api/slots/{slotId}/attendance/mark-all-present
   */
  static async markAllPresent(slotId: string): Promise<void> {
    await api.post(`/slots/${slotId}/attendance/mark-all-present`);
  }

  /**
   * Mark all students as absent for a slot
   * Endpoint: POST /api/slots/{slotId}/attendance/mark-all-absent
   */
  static async markAllAbsent(slotId: string): Promise<void> {
    await api.post(`/slots/${slotId}/attendance/mark-all-absent`);
  }
}

export default AttendanceServices;

