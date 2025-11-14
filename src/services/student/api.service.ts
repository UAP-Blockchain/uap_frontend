import api from "../../config/axios";
import type { Student } from "../../types/Student";

class StudentServices {
  /**
   * Get current student profile (me)
   * Endpoint: GET /api/Students/me
   * Requires: Student role
   */
  static async getCurrentStudentProfile(): Promise<Student> {
    const response = await api.get<Student>("/Students/me");
    return response.data;
  }

  /**
   * Get student by ID
   * Endpoint: GET /api/Students/{id}
   */
  static async getStudentById(id: string): Promise<Student> {
    const response = await api.get<Student>(`/Students/${id}`);
    return response.data;
  }
}

export default StudentServices;

