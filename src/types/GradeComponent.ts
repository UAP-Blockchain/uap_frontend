/**
 * Grade Component Types
 * Synced with Fap.Domain.DTOs.GradeComponent
 */

export interface GradeComponentDto {
  id: string;
  subjectId: string;
  /**
   * Subject code (for reference only)
   */
  subjectCode?: string;
  /**
   * Subject name (for reference only)
   */
  subjectName?: string;
  name: string;
  weightPercent: number;
  /**
   * Number of grade records that reference this component (including children)
   * Used to determine if the grading scheme can be edited
   */
  gradeCount?: number;
  /**
   * Parent component ID (null for root components)
   */
  parentId?: string | null;
  /**
   * Child components (hierarchical grading structure)
   */
  subComponents?: GradeComponentDto[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Legacy create/update request for single component operations.
 * Still used by some admin APIs but not for the new bulk configuration flow.
 */
export interface CreateGradeComponentRequest {
  subjectId: string;
  name: string;
  weightPercent: number;
}

export interface UpdateGradeComponentRequest extends CreateGradeComponentRequest {}

export interface GradeComponentCommandResult {
  success: boolean;
  gradeComponentId?: string;
  errors?: string[];
}

/**
 * Hierarchical create DTO used by POST /api/grade-components/bulk
 */
export interface CreateGradeComponentTreeItem {
  name: string;
  /**
   * Weight percentage of this component (0-100)
   */
  weightPercent: number;
  /**
   * Optional nested sub components
   */
  subComponents?: CreateGradeComponentTreeItem[];
}

export interface CreateSubjectGradeComponentsRequest {
  subjectId: string;
  components: CreateGradeComponentTreeItem[];
}

