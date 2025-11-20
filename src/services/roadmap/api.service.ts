import api from "../../config/axios";
import type { StudentRoadmapDto } from "../../types/Roadmap";

class RoadmapServices {
  /**
   * Get current student's roadmap overview
   * Endpoint: GET /api/students/me/roadmap
   */
  static async getMyRoadmap(): Promise<StudentRoadmapDto> {
    const response = await api.get<StudentRoadmapDto>("/students/me/roadmap");
    return response.data;
  }
}

export default RoadmapServices;

