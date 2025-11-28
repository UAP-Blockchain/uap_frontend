import api from "../../../config/axios";
import type {
  ClassSummary,
  ClassesApiResponse,
  CreateClassRequest,
  UpdateClassRequest,
  EligibleStudent,
  GetClassesRequest,
  PagedResult,
} from "../../../types/Class";
import type { SubjectDto } from "../../../types/Subject";
import type { TeacherOption } from "../../../types/Teacher";
import type { SlotDto, CreateSlotRequest, UpdateSlotRequest } from "../../../types/Slot";

const normalizeItems = <T>(payload: {
  data?: T[];
  items?: T[];
}): T[] => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
};

export const fetchClassesApi = async (
  params?: GetClassesRequest
): Promise<PagedResult<ClassSummary>> => {
  const response = await api.get<ClassesApiResponse>("/Classes", {
    params: {
      page: params?.page,
      pageSize: params?.pageSize,
      subjectId: params?.subjectId,
      teacherId: params?.teacherId,
      semesterId: params?.semesterId,
      classCode: params?.classCode,
      searchTerm: params?.searchTerm,
      sortBy: params?.sortBy,
      sortOrder: params?.sortOrder,
    },
  });

  const items =
    response.data?.items ??
    (Array.isArray(response.data?.data) ? response.data.data : []);

  const totalCount =
    (response.data as any)?.totalCount ??
    (response.data as any)?.TotalCount ??
    items.length;
  const page =
    (response.data as any)?.page ??
    (response.data as any)?.Page ??
    params?.page ??
    1;
  const pageSize =
    (response.data as any)?.pageSize ??
    (response.data as any)?.PageSize ??
    params?.pageSize ??
    10;

  return {
    items,
    totalCount,
    page,
    pageSize,
  };
};

export const createClassApi = async (
  payload: CreateClassRequest
): Promise<void> => {
  await api.post("/Classes", payload);
};

export const fetchSubjectsApi = async (): Promise<SubjectDto[]> => {
  const response = await api.get<{ data?: SubjectDto[]; items?: SubjectDto[] }>(
    "/Subjects",
    {
      params: {
        pageNumber: 1,
        pageSize: 200,
      },
    }
  );
  return normalizeItems<SubjectDto>(response.data);
};

export const fetchTeachersApi = async (): Promise<TeacherOption[]> => {
  const response = await api.get<{
    data?: TeacherOption[];
    items?: TeacherOption[];
  }>("/Teachers");
  return normalizeItems<TeacherOption>(response.data);
};

export const getClassByIdApi = async (id: string): Promise<ClassSummary> => {
  const response = await api.get<ClassSummary>(`/Classes/${id}`);
  return response.data;
};

export const updateClassApi = async (
  id: string,
  payload: UpdateClassRequest
): Promise<void> => {
  await api.put(`/Classes/${id}`, payload);
};

export const getClassSlotsApi = async (id: string): Promise<SlotDto[]> => {
  const response = await api.get<{ data?: SlotDto[]; items?: SlotDto[] }>(
    `/Classes/${id}/slots`
  );
  return normalizeItems<SlotDto>(response.data);
};

export const deleteClassApi = async (id: string): Promise<void> => {
  await api.delete(`/Classes/${id}`);
};

export const createSlotApi = async (payload: CreateSlotRequest) => {
  const response = await api.post("/Slots", payload);
  return response.data;
};

export const updateSlotApi = async (id: string, payload: UpdateSlotRequest) => {
  const response = await api.put(`/Slots/${id}`, payload);
  return response.data;
};

export const deleteSlotApi = async (id: string) => {
  await api.delete(`/Slots/${id}`);
};

export interface StudentRoster {
  id: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  email: string;
  enrollmentDate?: string;
  gpa?: number;
}

interface ClassRosterResponse {
  data?: StudentRoster[];
  items?: StudentRoster[];
  students?: Array<{
    studentId: string;
    studentCode: string;
    fullName: string;
    email: string;
    joinedAt?: string;
    gpa?: number;
  }>;
}

export const getClassRosterApi = async (
  id: string
): Promise<StudentRoster[]> => {
  const response = await api.get<ClassRosterResponse>(`/Classes/${id}/roster`);

  if (Array.isArray(response.data?.students)) {
    return response.data.students.map((student) => ({
      id: student.studentId,
      studentId: student.studentId,
      studentCode: student.studentCode,
      fullName: student.fullName,
      email: student.email,
      enrollmentDate: student.joinedAt,
      gpa: student.gpa,
    }));
  }

  return normalizeItems<StudentRoster>(response.data);
};

export const getEligibleStudentsForClassApi = async (
  classId: string
): Promise<EligibleStudent[]> => {
  const response = await api.get<{
    data?: EligibleStudent[];
    items?: EligibleStudent[];
    students?: EligibleStudent[];
  }>(`/students/eligible-for-class/${classId}`);

  if (Array.isArray(response.data?.students)) {
    return response.data.students;
  }

  return normalizeItems<EligibleStudent>(response.data);
};

export const assignStudentsToClassApi = async (
  classId: string,
  studentIds: string[]
): Promise<void> => {
  await api.post(`/Classes/${classId}/students`, { studentIds });
};

