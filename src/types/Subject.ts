/**
 * Subject Types
 * Type definitions for Subject API requests and responses
 * Based on backend DTOs in Fap.Domain.DTOs.Subject
 */

// ==================== Request Types ====================

export interface GetSubjectsRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string; // "SubjectCode" | "SubjectName" | "Credits"
  isDescending?: boolean;
}

// ==================== Response Types ====================

import type { SpecializationDto } from "./Specialization";

export interface SubjectDto {
  id: string;
  subjectCode: string;
  subjectName: string;
  description?: string;
  credits: number;
  category?: string;
  department?: string;
  prerequisites?: string;
  totalOfferings?: number;
  specializations?: SpecializationDto[];
}

export interface SubjectFormValues {
  subjectCode: string;
  subjectName: string;
  credits: number;
  description?: string;
  category?: string;
  department?: string;
  prerequisites?: string;
}

export interface PagedSubjectsResponse {
  data: SubjectDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

