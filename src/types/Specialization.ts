export interface SpecializationDto {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetSpecializationsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
}

export interface PagedSpecializationsResponse {
  data?: SpecializationDto[];
  items?: SpecializationDto[];
  totalCount?: number;
  page?: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface CreateSpecializationRequest {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateSpecializationRequest = CreateSpecializationRequest;

