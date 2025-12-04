import api from "../../../config/axios";
import type { GradeComponentDto } from "../../../types/GradeComponent";

// Types
export interface TeachingClass {
  classId: string;
  classCode: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semesterId?: string;
  semesterName: string;
  subjectOfferingId?: string;
  teacherId?: string;
  teacherCode?: string;
  teacherName?: string;
  teacherEmail?: string;
  teacherPhone?: string;
  totalStudents: number;
  totalSlots: number;
  currentEnrollment?: number;
  maxEnrollment?: number;
  status?: string;
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
  subjectOfferingId?: string;
  credits?: number;
  semesterId: string;
  semesterName: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  teacherId?: string;
  teacherCode?: string;
  teacherName?: string;
  teacherEmail?: string;
  teacherPhone?: string;
  maxEnrollment?: number;
  currentEnrollment?: number;
  status?: string;
  room?: string;
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

export interface GradeUpdateInput {
  gradeId: string;
  score: number;
}

export interface SubmitGradesRequest {
  grades: Array<{
    studentId: string;
    subjectId: string;
    gradeComponentId: string;
    score: number;
  }>;
}

export interface UpdateGradesRequest {
  grades: Array<{
    gradeId: string;
    score: number;
  }>;
}

// Generic response type for grade operations (kept simple because
// backend GradeResponse has a slightly different shape)
export interface SubmitGradesResponse {
  success?: boolean;
  message?: string;
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
 * Get classes taught by current teacher
 * GET /api/teachers/me/classes
 */
export const getTeacherClassesApi = async (): Promise<TeachingClass[]> => {
  const response = await api.get("/teachers/me/classes");
  const payload = response.data;

  const extractArray = (
    input: unknown
  ): Record<string, unknown>[] => {
    if (Array.isArray(input)) {
      return input as Record<string, unknown>[];
    }
    if (input && typeof input === "object") {
      const obj = input as Record<string, unknown>;
      if (Array.isArray(obj.data)) {
        return obj.data as Record<string, unknown>[];
      }
      if (Array.isArray(obj.classes)) {
        return obj.classes as Record<string, unknown>[];
      }
    }
    return [];
  };

  const rawClasses = extractArray(payload);

  const toStringSafe = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
  };

  const toNumberSafe = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return rawClasses.map((cls) => {
    const subject =
      (cls.subject as Record<string, unknown> | undefined) ?? undefined;
    const teacher =
      (cls.teacher as Record<string, unknown> | undefined) ?? undefined;
    const semester =
      (cls.semester as Record<string, unknown> | undefined) ?? undefined;

    return {
      classId: toStringSafe(cls.id ?? cls.classId),
      classCode: toStringSafe(cls.classCode),
      subjectName: toStringSafe(
        cls.subjectName ?? subject?.name ?? subject?.subjectName
      ),
      subjectCode: toStringSafe(
        cls.subjectCode ?? subject?.code ?? subject?.subjectCode
      ),
      subjectOfferingId: toStringSafe(
        cls.subjectOfferingId ?? subject?.subjectOfferingId
      ),
      credits: toNumberSafe(cls.credits ?? subject?.credits),
      teacherId: toStringSafe(cls.teacherId ?? teacher?.id),
      teacherCode: toStringSafe(cls.teacherCode ?? teacher?.code),
      teacherName: toStringSafe(
        cls.teacherName ?? teacher?.name ?? teacher?.fullName
      ),
      teacherEmail: toStringSafe(cls.teacherEmail ?? teacher?.email),
      teacherPhone: toStringSafe(cls.teacherPhone ?? teacher?.phone),
      semesterId: toStringSafe(cls.semesterId ?? semester?.id),
      semesterName: toStringSafe(
        cls.semesterName ?? semester?.name ?? semester?.semesterName
      ),
      totalStudents: toNumberSafe(cls.totalStudents ?? cls.currentEnrollment),
      totalSlots: toNumberSafe(cls.totalSlots ?? cls.maxEnrollment),
      currentEnrollment: toNumberSafe(
        cls.currentEnrollment ?? cls.totalStudents
      ),
      maxEnrollment: toNumberSafe(cls.maxEnrollment ?? cls.totalSlots),
      status: toStringSafe(cls.status ?? cls.classStatus),
    } as TeachingClass;
  });
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
 * Get grade components for a subject (hierarchical tree, flattened to leaves)
 * GET /api/grade-components/subject/{subjectId}/tree
 */
export const getGradeComponentsApi = async (
  subjectId?: string
): Promise<GradeComponent[]> => {
  if (!subjectId) {
    return [];
  }

  const response = await api.get<GradeComponentDto[]>(
    `/grade-components/subject/${subjectId}/tree`
  );

  const tree = Array.isArray(response.data) ? response.data : [];

  const flattened: GradeComponent[] = [];

  const flattenNode = (node: GradeComponentDto): void => {
    if (node.subComponents && node.subComponents.length > 0) {
      node.subComponents.forEach(flattenNode);
    } else {
      // Leaf node – dùng để chấm điểm
      flattened.push({
        id: node.id,
        name: node.name,
        weightPercent: node.weightPercent,
        maxScore: undefined,
        description: undefined,
      });
    }
  };

  tree.forEach(flattenNode);

  return flattened;
};

/**
 * Get existing grades for a class
 * GET /api/classes/{classId}/grades
 */
export const getClassGradesApi = async (
  classId: string
): Promise<Array<{
  studentId: string;
  gradeComponentId: string;
  gradeId: string;
  score: number;
}>> => {
  const response = await api.get<{
    students?: Array<{
      studentId: string;
      grades?: Array<{
        gradeId?: string;
        gradeComponentId: string;
        score?: number;
      }>;
    }>;
  }>(`/Classes/${classId}/grades`);
  
  const grades: Array<{
    studentId: string;
    gradeComponentId: string;
    gradeId: string;
    score: number;
  }> = [];
  
  if (response.data?.students) {
    response.data.students.forEach((student) => {
      if (student.grades) {
        student.grades.forEach((grade) => {
          if (grade.gradeId) {
            const normalizedScore =
              grade.score !== undefined && grade.score !== null
                ? Number(grade.score)
                : 0;

            grades.push({
              studentId: student.studentId,
              gradeComponentId: grade.gradeComponentId,
              gradeId: grade.gradeId,
              score: normalizedScore,
            });
          }
        });
      }
    });
  }
  
  return grades;
};

/**
 * Submit grades for a student
 * POST /api/Grades
 */
export const submitStudentGradesApi = async (
  request: SubmitGradesRequest
): Promise<SubmitGradesResponse> => {
  const response = await api.post<SubmitGradesResponse>("/Grades", request);
  return response.data;
};

/**
 * Update grades for a student (bulk update)
 * PUT /api/Grades - Updates multiple grades in a single request
 */
export const updateStudentGradesApi = async (
  request: UpdateGradesRequest
): Promise<void> => {
  if (!request.grades || request.grades.length === 0) {
    return;
  }

  // Use bulk update endpoint: PUT /api/Grades
  await api.put("/Grades", {
    grades: request.grades.map((grade) => ({
      gradeId: grade.gradeId,
      score: grade.score,
    })),
  });
};

