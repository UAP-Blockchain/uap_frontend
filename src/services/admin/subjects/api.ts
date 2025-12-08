import api from "../../../config/axios";
import type {
  SubjectDto,
  GetSubjectsRequest,
  PagedSubjectsResponse,
} from "../../../types/Subject";

export interface CreateSubjectRequest {
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
  category?: string;
  department?: string;
  prerequisites?: string;
  specializationIds?: string[];
}

export type UpdateSubjectRequest = CreateSubjectRequest;

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

export const fetchSubjectsApi = async (
  params?: GetSubjectsRequest
): Promise<PagedSubjectsResponse> => {
  const response = await api.get<{
    data?: SubjectDto[];
    items?: SubjectDto[];
    totalCount?: number;
    pageNumber?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  }>("/Subjects", {
    params: {
      pageNumber: params?.pageNumber,
      pageSize: params?.pageSize,
      searchTerm: params?.searchTerm,
      sortBy: params?.sortBy,
      isDescending: params?.isDescending,
    },
  });
  const apiData = response.data;
  const items = normalizeItems<SubjectDto>(apiData);
  return {
    data: items,
    totalCount: apiData.totalCount || items.length,
    pageNumber: apiData.page || apiData.pageNumber || 1,
    pageSize: apiData.pageSize || 10,
    totalPages:
      apiData.totalPages ||
      Math.ceil((apiData.totalCount || items.length) / (apiData.pageSize || 10)),
  };
};

export const getSubjectByIdApi = async (id: string): Promise<SubjectDto> => {
  const response = await api.get<SubjectDto>(`/Subjects/${id}`);
  return response.data;
};

export const createSubjectApi = async (
  payload: CreateSubjectRequest
): Promise<SubjectDto> => {
  const response = await api.post<SubjectDto>("/Subjects", payload);
  return response.data;
};

export const updateSubjectApi = async (
  id: string,
  payload: UpdateSubjectRequest
): Promise<SubjectDto> => {
  const response = await api.put<SubjectDto>(`/Subjects/${id}`, payload);
  return response.data;
};

export const deleteSubjectApi = async (id: string): Promise<void> => {
  await api.delete(`/Subjects/${id}`);
};

// Re-export SubjectDto type for admin modules that need it
export type { SubjectDto } from "../../../types/Subject";