import api from "../../../config/axios";
import type {
  GradeComponentDto,
  CreateGradeComponentRequest,
  UpdateGradeComponentRequest,
  GradeComponentCommandResult,
  CreateSubjectGradeComponentsRequest,
} from "../../../types/GradeComponent";

const BASE_ENDPOINT = "/grade-components";

/**
 * Legacy: get flat list of grade components (optionally by subject).
 * Still available for admin overviews but not used for subject-level configuration.
 */
export const fetchGradeComponentsApi = async (
  subjectId?: string
): Promise<GradeComponentDto[]> => {
  const response = await api.get<GradeComponentDto[]>(BASE_ENDPOINT, {
    params: subjectId ? { subjectId } : undefined,
  });
  return response.data;
};

/**
 * New: get hierarchical grade component tree for a specific subject.
 * GET /api/grade-components/subject/{subjectId}/tree
 */
export const fetchGradeComponentTreeApi = async (
  subjectId: string
): Promise<GradeComponentDto[]> => {
  const response = await api.get<GradeComponentDto[]>(
    `${BASE_ENDPOINT}/subject/${subjectId}/tree`
  );
  return response.data;
};

export const getGradeComponentByIdApi = async (
  id: string
): Promise<GradeComponentDto> => {
  const response = await api.get<GradeComponentDto>(`${BASE_ENDPOINT}/${id}`);
  return response.data;
};

/**
 * Legacy single-component create. Prefer bulk configuration for new features.
 */
export const createGradeComponentApi = async (
  payload: CreateGradeComponentRequest
): Promise<GradeComponentCommandResult> => {
  const response = await api.post<GradeComponentCommandResult>(
    BASE_ENDPOINT,
    payload
  );
  return response.data;
};

/**
 * Legacy single-component update. Prefer bulk configuration for new features.
 */
export const updateGradeComponentApi = async (
  id: string,
  payload: UpdateGradeComponentRequest
): Promise<GradeComponentCommandResult> => {
  const response = await api.put<GradeComponentCommandResult>(
    `${BASE_ENDPOINT}/${id}`,
    payload
  );
  return response.data;
};

/**
 * Legacy single-component delete. Prefer bulk configuration for new features.
 */
export const deleteGradeComponentApi = async (
  id: string
): Promise<GradeComponentCommandResult> => {
  const response = await api.delete<GradeComponentCommandResult>(
    `${BASE_ENDPOINT}/${id}`
  );
  return response.data;
};

/**
 * New: bulk create/update full grading scheme for a subject in a single operation.
 * POST /api/grade-components/bulk
 *
 * Backend enforces:
 * - Total top-level weight = 100
 * - Each parent weight = sum(children weights)
 * - Cannot modify once grades exist for the subject
 */
export const createSubjectGradeComponentsApi = async (
  payload: CreateSubjectGradeComponentsRequest
): Promise<GradeComponentDto[]> => {
  const response = await api.post<GradeComponentDto[]>(
    `${BASE_ENDPOINT}/bulk`,
    payload
  );
  return response.data;
};

