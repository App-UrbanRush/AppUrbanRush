import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const auth = () => ({ headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` } });

export type EncryptedFileType = "IDENTITY_DOC" | "CONTRACT" | "VERIFICATION_IMAGE";

export interface EncryptedFile {
  id: number;
  original_filename: string;
  mime_type: string;
  file_type: EncryptedFileType;
  created_at: string;
}

export const encryptedFilesApi = {
  list: async (): Promise<EncryptedFile[]> => {
    const res = await axios.get(`${API_URL}/files/my-files`, auth());
    return res.data;
  },

  upload: async (file: File, fileType: EncryptedFileType): Promise<EncryptedFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_type", fileType);
    const res = await axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        Authorization: `Bearer ${authLocalStorage.getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  download: async (id: number, filename: string): Promise<void> => {
    const res = await axios.get(`${API_URL}/files/${id}/download`, {
      ...auth(),
      responseType: "blob",
    });
    const ct = res.headers["content-type"];
    const blob = new Blob([res.data], { type: typeof ct === "string" ? ct : "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  remove: async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/files/${id}`, auth());
  },
};
