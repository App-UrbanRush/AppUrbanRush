import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class LiquidationNotificationService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PeopleEntity) private readonly peopleRepo: Repository<PeopleEntity>,
    private readonly emailService: EmailService,
  ) {}

  private async getRecipient(userId: number): Promise<{ email: string; name: string } | null> {
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) return null;
    const person = await this.peopleRepo.findOne({ where: { user_id: userId } });
    const name = person
      ? `${person.firstName} ${person.firstLastName}`.trim()
      : user.user_email.split('@')[0];
    return { email: user.user_email, name };
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO').format(Math.round(value));
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(date);
  }

  async notifyPayoutSuccess(params: {
    user_id: number;
    amount: number;
    reference: string;
    bank_name: string;
    account_masked: string;
    concept: string;
  }) {
    const recipient = await this.getRecipient(params.user_id);
    if (!recipient) return;
    await this.emailService.sendPayoutSuccessEmail(recipient.email, {
      name: recipient.name,
      amount: this.formatMoney(params.amount),
      reference: params.reference,
      bank_name: params.bank_name,
      account_masked: params.account_masked,
      concept: params.concept,
      date: this.formatDate(new Date()),
    });
  }

  async notifyPayoutFailed(params: {
    user_id: number;
    amount: number;
    reference: string;
    bank_name: string;
    account_masked: string;
    reason: string;
  }) {
    const recipient = await this.getRecipient(params.user_id);
    if (!recipient) return;
    await this.emailService.sendPayoutFailedEmail(recipient.email, {
      name: recipient.name,
      amount: this.formatMoney(params.amount),
      reference: params.reference,
      bank_name: params.bank_name,
      account_masked: params.account_masked,
      reason: params.reason,
    });
  }

  async notifyWeeklySummary(params: {
    user_id: number;
    total_amount: number;
    operations_label: string;
    operations_count: number;
    commission_total?: number;
    week_start: Date;
    week_end: Date;
  }) {
    const recipient = await this.getRecipient(params.user_id);
    if (!recipient) return;
    await this.emailService.sendWeeklyLiquidationSummary(recipient.email, {
      name: recipient.name,
      week_start: this.formatDate(params.week_start),
      week_end: this.formatDate(params.week_end),
      total_amount: this.formatMoney(params.total_amount),
      operations_label: params.operations_label,
      operations_count: params.operations_count,
      commission_total:
        params.commission_total !== undefined ? this.formatMoney(params.commission_total) : undefined,
    });
  }
}
