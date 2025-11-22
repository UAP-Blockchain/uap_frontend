/**
 * Attendance Types
 * Based on Fap.Domain.DTOs.Attendance
 */

export interface AttendanceDto {
  id: string;
  slotId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  subjectId: string;
  subjectName: string;
  date: string;
  timeSlotName: string;
  classCode: string;
  isPresent: boolean;
  notes?: string | null;
  isExcused: boolean;
  excuseReason?: string | null;
  recordedAt: string;
}

export interface AttendanceDetailDto extends AttendanceDto {
  studentEmail: string;
  teacherName: string;
  semesterName: string;
  slotStatus: string;
}

export interface AttendanceStatisticsDto {
  studentId: string;
  studentCode: string;
  studentName: string;
  totalSlots: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
  attendanceRecords: AttendanceDto[];
}

export interface ClassAttendanceReportDto {
  classId: string;
  classCode: string;
  subjectName: string;
  teacherName: string;
  totalSlots: number;
  totalStudents: number;
  averageAttendanceRate: number;
  studentSummaries: StudentAttendanceSummary[];
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentCode: string;
  studentName: string;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
}

export interface StudentAttendanceDto {
  studentId: string;
  isPresent: boolean;
  notes?: string;
}

export interface TakeAttendanceRequest {
  slotId: string;
  students: StudentAttendanceDto[];
}

export interface UpdateAttendanceRequest {
  isPresent: boolean;
  notes?: string;
}

export interface ExcuseAbsenceRequest {
  reason: string;
}

export interface AttendanceFilterRequest {
  ClassId?: string;
  StudentId?: string;
  SubjectId?: string;
  FromDate?: string;
  ToDate?: string;
  IsPresent?: boolean;
  IsExcused?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

export interface StudentAttendanceDetailDto {
  attendanceId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  studentEmail: string;
  isPresent: boolean;
  notes: string | null;
  isExcused: boolean;
  excuseReason: string | null;
}

export interface SlotAttendanceDto {
  slotId: string;
  classId: string;
  classCode: string;
  subjectName: string;
  date: string;
  timeSlotName: string;
  teacherName: string;
  hasAttendance: boolean;
  recordedAt: string;
  studentAttendances: StudentAttendanceDetailDto[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}


