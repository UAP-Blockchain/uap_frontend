import api from "../../config/axios";
import type { GraduationEligibilityDto } from "../../types/CredentialRequest";

export const getGraduationStatus = async (): Promise<GraduationEligibilityDto> => {
  const response = await api.get<GraduationEligibilityDto>(
    "/students/me/graduation-status"
  );
  return response.data;
};

