export interface ScheduleItemDto {
  slotId: string;
  classId: string;
  classCode: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  date: string; // ISO date string from backend
  dayOfWeek: string;
  timeSlotId: string;
  timeSlotName?: string;
  startTime?: string; // TimeSpan format from backend (HH:mm:ss) or ISO time string
  endTime?: string; // TimeSpan format from backend (HH:mm:ss) or ISO time string
  teacherId?: string;
  teacherName?: string;
  teacherCode?: string;
  substituteTeacherId?: string;
  substituteTeacherName?: string;
  substitutionReason?: string;
  status?: string;
  notes?: string;
  hasAttendance?: boolean;
  totalStudents?: number;
  presentCount?: number;
  absentCount?: number;
  isPresent?: boolean;
}

export interface DailyScheduleDto {
  date: string;
  dayOfWeek: string;
  slots: ScheduleItemDto[];
  totalSlots: number;
}

export interface WeeklyScheduleDto {
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
  days: DailyScheduleDto[];
  totalSlots: number;
}

export interface WeeklyScheduleResponse {
  success: boolean;
  data: WeeklyScheduleDto;
  message?: string;
}

