import api from "../../config/axios";
import type {
  SubjectDto,
  GetSubjectsRequest,
  PagedSubjectsResponse,
} from "../../types/Subject";

export const searchSubjects = async (
  searchTerm: string
): Promise<SubjectDto[]> => {
  const response = await api.get<PagedSubjectsResponse>("/Subjects", {
    params: {
      searchTerm,
      pageNumber: 1,
      pageSize: 50,
    } as GetSubjectsRequest,
  });
  return response.data.data || [];
};

export const getSubjectById = async (id: string): Promise<SubjectDto> => {
  const response = await api.get<SubjectDto>(`/Subjects/${id}`);
  return response.data;
};

