export interface TimeSlotDto {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalSlots: number;
}

export interface CreateTimeSlotRequest {
  name: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTimeSlotRequest {
  name: string;
  startTime: string;
  endTime: string;
}

export interface TimeSlotResponse {
  success: boolean;
  message: string;
  timeSlotId?: string;
  errors?: string[];
}