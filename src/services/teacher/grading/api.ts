import api from "../../../config/axios";

// Types
export interface TeachingClass {
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterName: string;
  totalStudents: number;
  totalSlots: number;
}

export interface TeacherProfile {
  id: string;
  teacherCode: string;
  fullName: string;
  email: string;
  classes: TeachingClass[];
}

export interface ClassStudent {
  studentId: string;
  studentCode: string;
  fullName: string;
  email?: string;
}

export interface ClassDetail {
  id: string;
  classCode: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semesterId: string;
  semesterName: string;
  students: ClassStudent[];
}

export interface GradeComponent {
  id: string;
  name: string;
  weightPercent: number;
  maxScore?: number;
  description?: string;
}

export interface GradeInput {
  gradeComponentId: string;
  score: number;
}

export interface SubmitGradesRequest {
  subjectId: string;
  studentId: string;
  grades: GradeInput[];
}

export interface SubmitGradesResponse {
  success: boolean;
  message: string;
  gradeIds?: string[];
}

/**
 * Get current teacher's profile with classes
 * GET /api/teachers/me
 */
export const getTeacherProfileApi = async (): Promise<TeacherProfile> => {
  const response = await api.get<TeacherProfile>("/teachers/me");
  return response.data;
};

/**
 * Get class details including students
 * GET /api/Classes/{classId}
 */
export const getClassByIdApi = async (
  classId: string
): Promise<ClassDetail> => {
  const response = await api.get<ClassDetail>(`/Classes/${classId}`);
  return response.data;
};

/**
 * Get grade components for a subject
 * GET /api/grade-components
 * Note: Backend may not support subjectId filter, so we filter on frontend if needed
 */
export const getGradeComponentsApi = async (
  subjectId?: string
): Promise<GradeComponent[]> => {
  const response = await api.get<GradeComponent[]>("/grade-components", {
    params: subjectId ? { subjectId } : undefined,
  });
  
  // If backend doesn't filter by subjectId, return all components
  // (In real implementation, backend should filter by subjectId)
  const components = Array.isArray(response.data) ? response.data : [];
  
  // If subjectId is provided but backend doesn't filter, we can filter on frontend
  // For now, return all components as backend may not have subjectId relationship
  return components;
};

/**
 * Submit grades for a student
 * POST /api/grades (multiple calls, one per grade component)
 */
export const submitGradesApi = async (
  request: SubmitGradesRequest
): Promise<SubmitGradesResponse> => {
  // Create multiple grade records (one per grade component)
  const gradePromises = request.grades
    .filter((grade) => grade.score > 0) // Only submit non-zero scores
    .map((grade) =>
      api.post("/grades", {
        studentId: request.studentId,
        subjectId: request.subjectId,
        gradeComponentId: grade.gradeComponentId,
        score: grade.score,
      })
    );

  if (gradePromises.length === 0) {
    return {
      success: true,
      message: "Không có điểm nào để lưu",
    };
  }

  const responses = await Promise.all(gradePromises);
  const gradeIds = responses.map(
    (res) => res.data.gradeId || res.data.id || ""
  );

  return {
    success: true,
    message: "Đã lưu điểm thành công",
    gradeIds,
  };
};

/**
 * Submit grades for multiple students in a class
 * POST /api/grades (multiple calls)
 */
export const submitClassGradesApi = async (
  classId: string,
  grades: Array<{
    studentId: string;
    subjectId: string;
    grades: GradeInput[];
  }>
): Promise<SubmitGradesResponse> => {
  const allPromises = grades.map((studentGrade) =>
    submitGradesApi({
      subjectId: studentGrade.subjectId,
      studentId: studentGrade.studentId,
      grades: studentGrade.grades,
    })
  );

  await Promise.all(allPromises);

  return {
    success: true,
    message: `Đã lưu điểm cho ${grades.length} sinh viên`,
  };
};

