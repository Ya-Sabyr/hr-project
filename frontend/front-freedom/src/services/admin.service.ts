import axiosInstance from "../data/axiosInstance";
import { AuthService } from "./auth.service";

export const AdminService = {
  async getUsers() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/admin/users", {
      params: { token },
    });
  },

  async deleteUser(userId: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.delete(`/api/v1/admin/users/${userId}`, {
      params: { token },
    });
  },

  async toggleBlockUser(userId: string) {
    const token = AuthService.getAccessToken();

    return axiosInstance.put(
      `/api/v1/admin/toggle-block/user/${userId}`,
      { userId },
      {
        params: { token },
      }
    );
  },

  async getHrs() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/admin/hrs", {
      params: { token },
    });
  },

  async getPendingHrs() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/admin/hrs/pending", {
      params: { token },
    });
  },

  async deleteHr(hrId: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.delete(`/api/v1/admin/hrs/${hrId}`, {
      params: { token },
    });
  },

  async approveHr(hrId: string) {
    const token = AuthService.getAccessToken();

    return axiosInstance.put(
      `/api/v1/admin/approve/hr/${hrId}`,
      { hrId },
      {
        params: { token },
      }
    );
  },

  async toggleBlockHr(hrId: string) {
    const token = AuthService.getAccessToken();

    return axiosInstance.put(
      `/api/v1/admin/toggle-block/hr/${hrId}`,
      { hrId },
      {
        params: { token },
      }
    );
  },

  async getVacanciesUnderReview() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("/api/v1/admin/vacancies/review", {
      params: { token },
    });
  },

  async changeVacancyStatus(vacancyId: number, status: "Accepted" | "Rejected") {
    const token = AuthService.getAccessToken();
    return axiosInstance.patch(
      `/api/v1/admin/${vacancyId}/status`,
      { status },
      {
        params: { token },
      }
    );
  },
};
