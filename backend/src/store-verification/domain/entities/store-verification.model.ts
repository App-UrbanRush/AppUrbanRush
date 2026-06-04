export enum VerificationResult {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
}

export class StoreVerificationModel {
  constructor(
    public id: string | null,
    public vendor_id: number,
    public business_name: string,
    public result: VerificationResult,
    public confidence: number,
    public detected_text: string,
    public is_real_sign: boolean,
    public name_matches: boolean,
    public reasons: string[],
    public image_url: string | null,
    public created_at: Date | null,
  ) {}
}
