import api from "../../config/axios";
import type {
  GetSemestersRequest,
  PagedSemestersResponse,
  SemesterDto,
} from "../../Types/Semester";
import type {
  GetSubjectsRequest,
  PagedSubjectsResponse,
  SubjectDto,
} from "../../Types/Subject";
import type {
  GetStudentGradesRequest,
  StudentGradeTranscriptDto,
} from "../../Types/Grade";

class GradeServices {
  /**
   * Get paginated list of semesters
   */
  static async getSemesters(
    params?: GetSemestersRequest
  ): Promise<PagedSemestersResponse> {
    const response = await api.get<PagedSemestersResponse>("/Semesters", {
      params,
    });
    return response.data;
  }

  /**
   * Get semester by ID
   */
  static async getSemesterById(id: string): Promise<SemesterDto> {
    const response = await api.get<SemesterDto>(`/Semesters/${id}`);
    return response.data;
  }

  /**
   * Get paginated list of subjects
   */
  static async getSubjects(
    params?: GetSubjectsRequest
  ): Promise<PagedSubjectsResponse> {
    const response = await api.get<PagedSubjectsResponse>("/Subjects", {
      params,
    });
    return response.data;
  }

  /**
   * Get subject by ID
   */
  static async getSubjectById(id: string): Promise<SubjectDto> {
    const response = await api.get<SubjectDto>(`/Subjects/${id}`);
    return response.data;
  }

  /**
   * Get student grade transcript
   * Endpoint: GET /api/Students/{id}/grades
   * Query parameters: SemesterId, SubjectId, SortBy, SortOrder (all optional)
   */
  static async getStudentGrades(
    studentId: string,
    params?: GetStudentGradesRequest
  ): Promise<StudentGradeTranscriptDto> {
    const response = await api.get<StudentGradeTranscriptDto>(
      `/Students/${studentId}/grades`,
      { params }
    );
    return response.data;
  }
}

export default GradeServices;

