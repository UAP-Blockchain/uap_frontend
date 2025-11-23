import api from "../../../config/axios";
import type { SubjectOffering } from "../../../types/SubjectOffering";

const normalizeItems = (payload: {
  data?: SubjectOffering[];
  items?: SubjectOffering[];
}): SubjectOffering[] => {
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.items)) {
    return payload.items;
  }
  return [];
};

export const fetchSubjectOfferingsApi = async (): Promise<SubjectOffering[]> => {
  const response = await api.get<{
    data?: SubjectOffering[];
    items?: SubjectOffering[];
  }>("/SubjectOfferings");
  return normalizeItems(response.data);
};


