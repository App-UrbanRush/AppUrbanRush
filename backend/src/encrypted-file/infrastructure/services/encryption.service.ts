import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ENCRYPTION_MASTER_KEY } from 'src/config/constants';

export interface EncryptionResult {
  encryptedBuffer: Buffer;
  iv: string;
  authTag: string;
  wrappedKey: string;
}

@Injectable()
export class EncryptionService {
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const hex = this.configService.get<string>(ENCRYPTION_MASTER_KEY) ?? '';
    this.masterKey = Buffer.from(hex, 'hex');
  }

  encrypt(buffer: Buffer): EncryptionResult {
    // 1. Generar clave aleatoria por archivo (32 bytes = AES-256)
    const fileKey = crypto.randomBytes(32);

    // 2. Encriptar archivo con AES-256-GCM
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', fileKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // 3. Envolver (wrap) la fileKey con la master key
    const wrappedKey = this.wrapKey(fileKey);

    return {
      encryptedBuffer: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      wrappedKey,
    };
  }

  decrypt(encryptedBuffer: Buffer, ivHex: string, authTagHex: string, wrappedKey: string): Buffer {
    // 1. Desenvolver la fileKey
    const fileKey = this.unwrapKey(wrappedKey);

    // 2. Descifrar archivo
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', fileKey, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  }

  private wrapKey(fileKey: Buffer): string {
    const wrapIv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, wrapIv);
    const wrapped = Buffer.concat([cipher.update(fileKey), cipher.final()]);
    const wrapTag = cipher.getAuthTag();

    // Formato: wrapIv(12) + wrapTag(16) + wrappedKey(32) = 60 bytes → hex
    return Buffer.concat([wrapIv, wrapTag, wrapped]).toString('hex');
  }

  private unwrapKey(wrappedHex: string): Buffer {
    const data = Buffer.from(wrappedHex, 'hex');
    const wrapIv = data.subarray(0, 12);
    const wrapTag = data.subarray(12, 28);
    const wrapped = data.subarray(28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, wrapIv);
    decipher.setAuthTag(wrapTag);

    return Buffer.concat([decipher.update(wrapped), decipher.final()]);
  }
}
