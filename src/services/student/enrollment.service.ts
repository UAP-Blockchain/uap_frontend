import api from "../../config/axios";

export interface CreateEnrollmentRequest {
  classId: string;
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  enrollmentId?: string;
  errors?: string[];
  warnings?: string[];
}

export const createEnrollment = async (
  request: CreateEnrollmentRequest
): Promise<EnrollmentResponse> => {
  const response = await api.post<EnrollmentResponse>(
    "/Enrollments",
    request
  );
  return response.data;
};

