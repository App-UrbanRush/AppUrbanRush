import { IsString, IsNumber, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class WompiTransactionData {
  @ApiProperty() @IsString() id: string;
  @ApiProperty() @IsString() status: string;
  @ApiProperty() @IsNumber() amount_in_cents: number;
  @ApiProperty() @IsString() reference: string;
  @ApiProperty() @IsString() currency: string;
  @ApiProperty() @IsString() payment_method_type: string;
}

class WompiEventData {
  @ApiProperty()
  @ValidateNested()
  @Type(() => WompiTransactionData)
  transaction: WompiTransactionData;
}

class WompiSignature {
  @ApiProperty() @IsArray() properties: string[];
  @ApiProperty() @IsString() checksum: string;
}

export class WompiWebhookDto {
  @ApiProperty() @IsString() event: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WompiEventData)
  data: WompiEventData;

  @ApiProperty()
  @ValidateNested()
  @Type(() => WompiSignature)
  signature: WompiSignature;

  @ApiProperty() @IsNumber() timestamp: number;
}
