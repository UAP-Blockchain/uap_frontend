import api from "../../../config/axios";
import type {
  TimeSlotDto,
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
  TimeSlotResponse,
} from "../../../types/TimeSlot";

/**
 * TimeSlot API Service
 * Quản lý các ca học (Time Slots) trong hệ thống
 */

/**
 * Lấy tất cả time slots
 * GET /api/TimeSlots
 */
export const getAllTimeSlots = async (): Promise<TimeSlotDto[]> => {
  const response = await api.get<TimeSlotDto[]>("/TimeSlots", {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

/**
 * Lấy time slot theo ID
 * GET /api/TimeSlots/{id}
 */
export const getTimeSlotById = async (id: string): Promise<TimeSlotDto> => {
  const response = await api.get<TimeSlotDto>(`/TimeSlots/${id}`, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

/**
 * Tạo time slot mới
 * POST /api/TimeSlots
 * Requires: Admin role
 */
export const createTimeSlot = async (
  request: CreateTimeSlotRequest
): Promise<TimeSlotResponse> => {
  const response = await api.post<TimeSlotResponse>("/TimeSlots", request, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

/**
 * Cập nhật time slot
 * PUT /api/TimeSlots/{id}
 * Requires: Admin role
 */
export const updateTimeSlot = async (
  id: string,
  request: UpdateTimeSlotRequest
): Promise<TimeSlotResponse> => {
  const response = await api.put<TimeSlotResponse>(`/TimeSlots/${id}`, request, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

/**
 * Xóa time slot
 * DELETE /api/TimeSlots/{id}
 * Requires: Admin role
 */
export const deleteTimeSlot = async (id: string): Promise<TimeSlotResponse> => {
  const response = await api.delete<TimeSlotResponse>(`/TimeSlots/${id}`, {
    skipGlobalErrorHandler: true,
  } as any);
  return response.data;
};

