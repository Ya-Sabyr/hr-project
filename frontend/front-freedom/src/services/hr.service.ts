import axiosInstance from "../data/axiosInstance";
import { AuthService } from "./auth.service";

export const HrService = {
  async getHrProfile() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/hr/me", {
      params: { token },
    });
  },

  async updateHrProfile(data: { full_name: string; company: string; contact_info?: string }) {
    const token = AuthService.getAccessToken();
    return axiosInstance.put("/api/v1/hr/me", data, {
      params: { token },
    });
  },

  async deleteHrProfile() {
    const token = AuthService.getAccessToken();
    return axiosInstance.delete("/api/v1/hr/me", {
      params: { token },
    });
  },

  async getAllVacancies() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/hr/", {
      params: { token },
    });
  },

  async createVacancy(formattedData: any) {
    const token = AuthService.getAccessToken();
    return axiosInstance.post(
      "/api/v1/hr",
      { ...formattedData, status: "under_review" },
      {
        params: { token },
      }
    );
  },

  async getVacancyById(vacancyId: number) {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/hr/${vacancyId}`, {
      params: { token },
    });
  },

  async updateVacancy(vacancyId: number, vacancyData: any) {
    const token = AuthService.getAccessToken();

    const updatedData = {
      ...vacancyData,
      status:
        vacancyData.status === "rejected" ? "under_review" : vacancyData.status,
    };

    return axiosInstance.put(`/api/v1/hr/${vacancyId}`, updatedData, {
      params: { token },
    });
  },

  async deleteVacancy(vacancyId: number) {
    const token = AuthService.getAccessToken();
    return axiosInstance.delete(`/api/v1/hr/${vacancyId}`, {
      params: { token },
    });
  },

  async getCandidatesByVacancyId(vacancyId: number) {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/hr/vacancy/${vacancyId}`, {
      params: { token },
    });
  },

  async acceptCandidate(applicationId: number) {
    const token = AuthService.getAccessToken();
    return axiosInstance.post(
      `/api/v1/hr/applications/${applicationId}/accept`,
      null,
      {
        params: { token },
      }
    );
  },

  async rejectCandidate(applicationId: number) {
    const token = AuthService.getAccessToken();
    return axiosInstance.post(
      `/api/v1/hr/applications/${applicationId}/reject`,
      null,
      {
        params: { token },
      }
    );
  },

  async classifyVacancy(description: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.post("/api/v1/hr/classify", null, {
      params: { token, description },
    });
  },
};
