import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const auth = () => ({ headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` } });

export interface BackupFile {
  name: string;
  size: string;
  date: string;
}

export const backupApi = {
  list: async (): Promise<BackupFile[]> => {
    const res = await axios.get(`${API_URL}/admin/backup`, auth());
    return res.data;
  },

  run: async (): Promise<{ success: boolean; files: string[] }> => {
    const res = await axios.post(`${API_URL}/admin/backup`, {}, auth());
    return res.data;
  },

  // Genera y descarga directamente un JSON combinado (PostgreSQL + MongoDB)
  downloadNow: async (): Promise<void> => {
    const res = await axios.get(`${API_URL}/admin/backup/download-now`, {
      ...auth(),
      responseType: "blob",
    });
    const disposition = res.headers["content-disposition"] || "";
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] || `urbanrush-backup-${Date.now()}.json`;

    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  download: async (name: string): Promise<void> => {
    const res = await axios.get(`${API_URL}/admin/backup/${encodeURIComponent(name)}/download`, {
      ...auth(),
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
