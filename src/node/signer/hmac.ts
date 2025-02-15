import { createHmac, timingSafeEqual } from 'node:crypto';
import type { KeyData, Signer } from './types';

/**
 * A single key signer and verifier
 */
export default (secret: KeyData, hashAlg: string): Signer => [
  (val: string): string => val + '.' + createHmac(hashAlg, secret).update(val).digest('base64'),
  (val: string) => {
    const idx = val.lastIndexOf('.');
    if (idx !== -1) {
      const extractedVal = val.substring(0, idx);

      const actual = createHmac(hashAlg, secret).update(extractedVal).digest();
      const expected = Buffer.from(val.substring(idx + 1), 'base64');

      if (actual.byteLength === expected.byteLength && timingSafeEqual(actual, expected)) return extractedVal;
    }
  }
];
