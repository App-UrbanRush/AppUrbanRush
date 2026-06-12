import axios from "axios";
import { authLocalStorage } from "../persistence/authLocalStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ReportFilters {
  from?: string;
  to?: string;
  status?: string;
}

const downloadBlob = async (
  path: string,
  filename: string,
  filters: ReportFilters = {},
) => {
  const params = new URLSearchParams();
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.status) params.append("status", filters.status);

  const res = await axios.get(`${API_URL}${path}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${authLocalStorage.getToken()}` },
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const reportsApi = {
  ordersPdf: (f: ReportFilters) => downloadBlob("/reports/orders/pdf", "reporte-pedidos.pdf", f),
  ordersExcel: (f: ReportFilters) => downloadBlob("/reports/orders/excel", "reporte-pedidos.xlsx", f),
  paymentsPdf: (f: ReportFilters) => downloadBlob("/reports/payments/pdf", "reporte-pagos.pdf", f),
  paymentsExcel: (f: ReportFilters) => downloadBlob("/reports/payments/excel", "reporte-pagos.xlsx", f),
  usersExcel: () => downloadBlob("/reports/users/excel", "reporte-usuarios.xlsx"),
  couriersExcel: () => downloadBlob("/reports/couriers/excel", "reporte-domiciliarios.xlsx"),
};
