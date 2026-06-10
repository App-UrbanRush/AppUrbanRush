import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { IVendorLiquidationRepository } from '../../domain/repositories/vendor-liquidation.repository.interface';
import { ICourierEarningRepository } from '../../domain/repositories/courier-earning.repository.interface';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { IPayoutTransactionRepository } from '../../domain/repositories/payout-transaction.repository.interface';
import { IPayoutGateway } from '../../domain/gateways/payout.gateway.interface';
import { PayoutTransactionModel, PayoutBeneficiaryType } from '../../domain/entities/payout-transaction.model';
import { BankAccountModel } from '../../domain/entities/bank-account.model';
import { LiquidationNotificationService } from '../../infrastructure/services/liquidation-notification.service';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';

interface VendorGroup {
  user_id: number;
  vendor_id: number;
  ids: string[];
  total_net: number;
  total_commission: number;
}

interface CourierGroup {
  user_id: number;
  courier_id: number;
  ids: string[];
  total: number;
}

@Injectable()
export class ProcessWeeklyLiquidationUseCase {
  private readonly logger = new Logger(ProcessWeeklyLiquidationUseCase.name);

  constructor(
    @Inject('IVendorLiquidationRepository')
    private readonly liqRepo: IVendorLiquidationRepository,
    @Inject('ICourierEarningRepository')
    private readonly earningRepo: ICourierEarningRepository,
    @Inject('IBankAccountRepository')
    private readonly bankRepo: IBankAccountRepository,
    @Inject('IPayoutTransactionRepository')
    private readonly payoutRepo: IPayoutTransactionRepository,
    @Inject('IPayoutGateway')
    private readonly payoutGateway: IPayoutGateway,
    @InjectRepository(VendorEntity)
    private readonly vendorRepo: Repository<VendorEntity>,
    @InjectRepository(CourierEntity)
    private readonly courierRepo: Repository<CourierEntity>,
    private readonly notifier: LiquidationNotificationService,
  ) {}

  // Lunes 9:00 AM
  @Cron('0 9 * * 1')
  async processVendorLiquidation() {
    this.logger.log('Cron lunes: liquidación de vendors');
    return this.runVendorLiquidation();
  }

  // Viernes 9:00 AM
  @Cron('0 9 * * 5')
  async processCourierPayout() {
    this.logger.log('Cron viernes: pago a domiciliarios');
    return this.runCourierPayout();
  }

  async runVendorLiquidation() {
    const pending = await this.liqRepo.findAllPending();
    if (pending.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0, payouts: [] };
    }

    const groups = new Map<number, VendorGroup>();
    const vendors = await this.vendorRepo.find();
    const vendorToUser = new Map(vendors.map((v) => [v.vendor_id, v.user_id]));

    for (const liq of pending) {
      if (!liq.liquidation_id) continue;
      const userId = vendorToUser.get(liq.vendor_id);
      if (!userId) continue;

      const group = groups.get(userId) ?? {
        user_id: userId,
        vendor_id: liq.vendor_id,
        ids: [],
        total_net: 0,
        total_commission: 0,
      };
      group.ids.push(liq.liquidation_id);
      group.total_net += liq.vendor_net;
      group.total_commission += liq.platform_commission;
      groups.set(userId, group);
    }

    const { weekStart, weekEnd } = this.computeWeekRange();
    const results: any[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const group of groups.values()) {
      const result = await this.executeBeneficiaryPayout({
        userId: group.user_id,
        beneficiaryType: 'VENDOR',
        amount: group.total_net,
        earningIds: group.ids,
        concept: 'Liquidación semanal de ventas',
        markAsPaid: (ids) => this.liqRepo.markAsPaid(ids),
      });

      if (result.payout) {
        if (result.payout.status === 'SUCCESS') {
          succeeded++;
          await this.notifier.notifyWeeklySummary({
            user_id: group.user_id,
            total_amount: group.total_net,
            operations_label: 'Ventas',
            operations_count: group.ids.length,
            commission_total: group.total_commission,
            week_start: weekStart,
            week_end: weekEnd,
          });
        } else if (result.payout.status === 'FAILED') {
          failed++;
        }
        results.push(result.payout);
      } else {
        failed++;
        results.push({ user_id: group.user_id, error: result.error });
      }
    }

    return { processed: groups.size, succeeded, failed, payouts: results };
  }

  async runCourierPayout() {
    const pending = await this.earningRepo.findAllPending();
    if (pending.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0, payouts: [] };
    }

    const couriers = await this.courierRepo.find();
    const courierToUser = new Map(couriers.map((c) => [c.couriers_id, c.user_id]));

    const groups = new Map<number, CourierGroup>();
    for (const e of pending) {
      if (!e.earning_id) continue;
      const userId = courierToUser.get(e.courier_id);
      if (!userId) continue;

      const group = groups.get(userId) ?? {
        user_id: userId,
        courier_id: e.courier_id,
        ids: [],
        total: 0,
      };
      group.ids.push(e.earning_id);
      group.total += e.delivery_fee;
      groups.set(userId, group);
    }

    const { weekStart, weekEnd } = this.computeWeekRange();
    const results: any[] = [];
    let succeeded = 0;
    let failed = 0;

    for (const group of groups.values()) {
      const result = await this.executeBeneficiaryPayout({
        userId: group.user_id,
        beneficiaryType: 'COURIER',
        amount: group.total,
        earningIds: group.ids,
        concept: 'Pago semanal de entregas',
        markAsPaid: (ids) => this.earningRepo.markAsPaid(ids),
      });

      if (result.payout) {
        if (result.payout.status === 'SUCCESS') {
          succeeded++;
          await this.notifier.notifyWeeklySummary({
            user_id: group.user_id,
            total_amount: group.total,
            operations_label: 'Entregas',
            operations_count: group.ids.length,
            week_start: weekStart,
            week_end: weekEnd,
          });
        } else if (result.payout.status === 'FAILED') {
          failed++;
        }
        results.push(result.payout);
      } else {
        failed++;
        results.push({ user_id: group.user_id, error: result.error });
      }
    }

    return { processed: groups.size, succeeded, failed, payouts: results };
  }

  async runAll() {
    const vendors = await this.runVendorLiquidation();
    const couriers = await this.runCourierPayout();
    return { vendors, couriers };
  }

  private async executeBeneficiaryPayout(params: {
    userId: number;
    beneficiaryType: PayoutBeneficiaryType;
    amount: number;
    earningIds: string[];
    concept: string;
    markAsPaid: (ids: string[]) => Promise<number>;
  }) {
    const account = await this.bankRepo.findDefaultByUserId(params.userId);
    if (!account) {
      this.logger.warn(`Usuario ${params.userId} no tiene cuenta bancaria por defecto`);
      return { payout: null, error: 'NO_BANK_ACCOUNT' };
    }

    const reference = `urbanrush-payout-${params.beneficiaryType.toLowerCase()}-${params.userId}-${randomUUID()}`;
    const snapshot = this.snapshotAccount(account);

    const payoutRecord = await this.payoutRepo.create(
      new PayoutTransactionModel(
        null,
        params.userId,
        params.beneficiaryType,
        account.bank_account_id!,
        snapshot,
        params.amount,
        'COP',
        'PENDING',
        null,
        reference,
        null,
        params.earningIds,
        null,
        null,
      ),
    );

    const result = await this.payoutGateway.executePayout({
      amount: params.amount,
      currency: 'COP',
      reference,
      bankAccount: account,
    });

    if (result.success) {
      await params.markAsPaid(params.earningIds);
      const updated = await this.payoutRepo.updateStatus(payoutRecord.payout_id!, 'SUCCESS', {
        wompi_transaction_id: result.provider_transaction_id,
        completed_at: new Date(),
      });
      await this.notifier.notifyPayoutSuccess({
        user_id: params.userId,
        amount: params.amount,
        reference,
        bank_name: account.bank_name,
        account_masked: snapshot.account_number_masked,
        concept: params.concept,
      });
      return { payout: updated };
    }

    const updated = await this.payoutRepo.updateStatus(payoutRecord.payout_id!, 'FAILED', {
      wompi_transaction_id: result.provider_transaction_id,
      failure_reason: result.failure_reason ?? 'Error desconocido',
    });
    await this.notifier.notifyPayoutFailed({
      user_id: params.userId,
      amount: params.amount,
      reference,
      bank_name: account.bank_name,
      account_masked: snapshot.account_number_masked,
      reason: result.failure_reason ?? 'Error desconocido',
    });
    return { payout: updated };
  }

  private snapshotAccount(account: BankAccountModel) {
    return {
      bank_name: account.bank_name,
      account_type: account.account_type,
      account_number_masked:
        account.account_number.length > 4
          ? `****${account.account_number.slice(-4)}`
          : '****',
      holder_name: account.holder_name,
    };
  }

  private computeWeekRange(): { weekStart: Date; weekEnd: Date } {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday - 7);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { weekStart: monday, weekEnd: sunday };
  }
}
