import { jwtDecode } from "jwt-decode";
import { AuthService } from "./auth.service";

export const DecodeUser = {
  async getUserIdFromToken() {
    const token = AuthService.getAccessToken();
    if (!token) {
      console.warn("Access token not found");
      return null;
    }

    try {
      const decoded = jwtDecode(token) as { sub?: string; user_id?: string; id?: string };
      return decoded.sub || decoded.user_id || decoded.id || null;
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  },
};