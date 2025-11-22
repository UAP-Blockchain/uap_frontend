import axios from "axios";
import api from "../../config/axios";
import type { CurriculumRoadmapDto, StudentRoadmapDto } from "../../types/Roadmap";

const BLOCKCHAIN_API_BASE_URL = "https://uap-blockchain.azurewebsites.net/api";

class RoadmapServices {
  /**
   * Get current student's curriculum roadmap from blockchain API
   * Endpoint: GET https://uap-blockchain.azurewebsites.net/api/students/me/curriculum-roadmap
   */
  static async getMyCurriculumRoadmap(): Promise<CurriculumRoadmapDto> {
    const token = localStorage.getItem("token") || "";
    const response = await axios.get<CurriculumRoadmapDto>(
      `${BLOCKCHAIN_API_BASE_URL}/students/me/curriculum-roadmap`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  /**
   * Get current student's roadmap overview (legacy)
   * Endpoint: GET /api/students/me/roadmap
   */
  static async getMyRoadmap(): Promise<StudentRoadmapDto> {
    const response = await api.get<StudentRoadmapDto>("/students/me/roadmap");
    return response.data;
  }
}

export default RoadmapServices;

