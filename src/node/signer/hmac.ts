import { createHmac, timingSafeEqual } from 'node:crypto';
import type { KeyData, Signer } from './types';

/**
 * A single key signer and verifier
 */
export default (secret: KeyData, hashAlg: string = 'sha256'): Signer => [
  (val: string): string => {
    const buf = Buffer.from(val, 'utf8');
    return buf.toString('base64url') + '.' + createHmac(hashAlg, secret).update(buf).digest('base64url');
  },
  (val: string) => {
    const idx = val.lastIndexOf('.');
    if (idx !== -1) {
      const extractedVal = Buffer.from(val.substring(0, idx), 'base64url');
      if (timingSafeEqual(
        createHmac(hashAlg, secret).update(extractedVal).digest(),
        Buffer.from(val.substring(idx + 1), 'base64url')
      )) return extractedVal.toString('utf8');
    }
  }
];
