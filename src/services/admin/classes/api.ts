import api from "../../../config/axios";
import type {
  ClassSummary,
  ClassesApiResponse,
  CreateClassRequest,
  UpdateClassRequest,
} from "../../../types/Class";
import type { SubjectDto } from "../../../types/Subject";
import type { TeacherOption } from "../../../types/Teacher";

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

export const fetchClassesApi = async (): Promise<ClassSummary[]> => {
  const response = await api.get<ClassesApiResponse>("/Classes");
  return normalizeItems<ClassSummary>(response.data);
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

export const deleteClassApi = async (id: string): Promise<void> => {
  await api.delete(`/Classes/${id}`);
};

