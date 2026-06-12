import {
  OrderReportRow,
  PaymentReportRow,
  UserReportRow,
  VendorReportRow,
  CourierReportRow,
  ReportFilters,
} from '../interfaces/report-data.interface';

export interface IReportsRepository {
  getOrders(filters: ReportFilters): Promise<OrderReportRow[]>;
  getPayments(filters: ReportFilters): Promise<PaymentReportRow[]>;
  getUsers(): Promise<UserReportRow[]>;
  getVendorReport(vendorId: number): Promise<VendorReportRow | null>;
  getCouriers(): Promise<CourierReportRow[]>;
}
