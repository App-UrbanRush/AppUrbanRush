import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export interface UpdateProfilePayload {
  firstName?: string;
  firstLastName?: string;
  cellphone?: string;
  address?: string;
  gender?: string;
  avatarUrl?: string | null;
}

export const peopleApi = {
  // El backend usa el user_id como :id (no el people_id)
  updateMyProfile: async (userId: number, data: UpdateProfilePayload): Promise<void> => {
    await axios.put(`${API_URL}/people/${userId}`, data, authHeader());
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post(`${API_URL}/people/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${authLocalStorage.getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
