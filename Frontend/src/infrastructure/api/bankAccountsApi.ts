import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";
import type { BankAccount, CreateBankAccountInput } from "../../domain/types/earnings.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const authHeader = () => ({
  headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
});

export const bankAccountsApi = {
  list: async (): Promise<BankAccount[]> => {
    const response = await axios.get(`${API_URL}/bank-accounts`, authHeader());
    return response.data;
  },

  create: async (input: CreateBankAccountInput): Promise<BankAccount> => {
    const response = await axios.post(`${API_URL}/bank-accounts`, input, authHeader());
    return response.data;
  },

  remove: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await axios.delete(`${API_URL}/bank-accounts/${id}`, authHeader());
    return response.data;
  },
};
