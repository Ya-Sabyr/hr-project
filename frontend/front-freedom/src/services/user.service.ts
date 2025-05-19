import axiosInstance from "../data/axiosInstance";
import { AuthService } from "./auth.service";

export const UserService = {
  async getProfile() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("api/v1/user/profile", {
      params: { token },
    });
  },

  async getAcceptedVacancies() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get("api/v1/user/accepted", {
      params: { token },
    });
  },

  async getAcceptedVacancyById(vacancyId: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`api/v1/user/accepted/${vacancyId}`, {
      params: { token },
    });
  },

  async uploadResume(file: File) {
    const token = AuthService.getAccessToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/api/v1/user/?token=${token}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  async getResume() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/user/`, {
      params: { token },
    });
  },

  async createApplication(vacancyId: number, resumeId: number) {
    const token = AuthService.getAccessToken();
    try {
      const response = await axiosInstance.post(
        `/api/v1/user/applications/?vacancy_id=${vacancyId}&resume_id=${resumeId}&token=${token}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Ошибка при отправке отклика:",
        error.response?.data || error
      );
      throw error;
    }
  },

  async getApplications() {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/user/applications/`, {
      params: { token },
    });
  },

  async getAppliedVacancies(userId: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/user/user/${userId}/vacancies`, {
      params: { token },
    });
  },
  
  async getAppliedVacancyDetails(userId: string) {
    const token = AuthService.getAccessToken();
    return axiosInstance.get(`/api/v1/user/user/${userId}/vacancies/details`, {
      params: { token },
    });
  },
};
