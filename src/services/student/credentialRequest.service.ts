import api from "../../config/axios";
import type {
  RequestCredentialRequest,
  CredentialRequestDto,
} from "../../types/CredentialRequest";

export const createCredentialRequest = async (
  request: RequestCredentialRequest
): Promise<CredentialRequestDto> => {
  const response = await api.post<CredentialRequestDto>(
    "/credential-requests",
    request
  );
  return response.data;
};

export const getMyCredentialRequests = async (
  status?: string
): Promise<CredentialRequestDto[]> => {
  const response = await api.get<CredentialRequestDto[]>(
    "/students/me/credential-requests",
    {
      params: status ? { status } : undefined,
    }
  );
  return response.data;
};

