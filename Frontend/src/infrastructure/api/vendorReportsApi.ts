import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface VendorReportData {
  total_orders: number;
  total_revenue: number;
  delivered_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  orders_by_status: Record<string, number>;
  orders_by_day: { date: string; count: number; revenue: number }[];
  top_products: { product_name: string; total_quantity: number; total_revenue: number }[];
}

export const vendorReportsApi = {
  getData: async (from?: string, to?: string): Promise<VendorReportData> => {
    const token = authLocalStorage.getToken();
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const response = await axios.get(`${API_URL}/vendor/reports/data?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  downloadPdf: async (from?: string, to?: string) => {
    const token = authLocalStorage.getToken();
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const response = await axios.get(`${API_URL}/vendor/reports/orders/pdf?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reporte-pedidos.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  downloadExcel: async (from?: string, to?: string) => {
    const token = authLocalStorage.getToken();
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    const response = await axios.get(`${API_URL}/vendor/reports/orders/excel?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "reporte-pedidos.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};
