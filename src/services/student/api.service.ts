import api from "../../config/axios";
import type {
  WeeklyScheduleDto,
  WeeklyScheduleResponse,
} from "../../types/Schedule";
import type { Student, StudentDetailDto } from "../../types/Student";
import type {
  GetStudentGradesRequest,
  StudentGradeTranscriptDto,
} from "../../types/Grade";

class StudentServices {
  /**
   * Get current student profile (me)
   * Endpoint: GET /api/students/me
   * Requires: Student role
   */
  static async getCurrentStudentProfile(): Promise<StudentDetailDto> {
    const response = await api.get<StudentDetailDto>("/students/me");
    return response.data;
  }

  /**
   * Get student by ID
   * Endpoint: GET /api/Students/{id}
   */
  static async getStudentById(id: string): Promise<Student> {
    const response = await api.get<Student>(`/Students/${id}`);
    return response.data;
  }

  /**
   * Get current student's weekly schedule
   * Endpoint: GET /api/students/me/schedule
   */
  static async getMyWeeklySchedule(
    weekStartDate?: string
  ): Promise<WeeklyScheduleDto> {
    const response = await api.get<WeeklyScheduleResponse>(
      "/students/me/schedule",
      {
        params: weekStartDate ? { weekStartDate } : undefined,
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Không thể lấy thời khóa biểu tuần."
      );
    }

    return response.data.data;
  }
}

// Export grade-related methods for student
export class StudentGradeServices {
  /**
   * Get current student's grade transcript
   * Endpoint: GET /api/students/me/grades
   * Query parameters: SemesterId, SubjectId, SortBy, SortOrder (all optional)
   */
  static async getMyGrades(
    params?: GetStudentGradesRequest
  ): Promise<StudentGradeTranscriptDto> {
    const response = await api.get<StudentGradeTranscriptDto>(
      "/students/me/grades",
      { params }
    );
    return response.data;
  }
}

export default StudentServices;
