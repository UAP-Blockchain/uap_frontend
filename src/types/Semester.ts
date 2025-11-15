/**
 * Semester Types
 * Type definitions for Semester API requests and responses
 * Based on backend DTOs in Fap.Domain.DTOs.Semester
 */

// ==================== Request Types ====================

export interface GetSemestersRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  isClosed?: boolean;
  sortBy?: string; // "Name" | "StartDate" | "EndDate"
  isDescending?: boolean;
}

export interface CreateSemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
}

// PUT API only updates name, startDate, endDate
// Status changes use separate PATCH APIs: /active and /close
export type UpdateSemesterRequest = CreateSemesterRequest;

// ==================== Response Types ====================

export interface SemesterDto {
  id: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalSubjects: number;
  isActive: boolean;
  isClosed: boolean;
}

export interface PagedSemestersResponse {
  data: SemesterDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}


