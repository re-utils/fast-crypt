import type { KeyObject } from 'node:crypto';
import { createHmac, timingSafeEqual, type BinaryLike } from 'node:crypto';
import type { Signer } from './types.js';

/**
 * A single key signer and verifier
 */
export default (secret: BinaryLike | KeyObject, hashAlg: string): Signer => [
  (val: string): string =>
    val + '.' + createHmac(hashAlg, secret).update(val).digest('base64url'),
  (val: string) => {
    const idx = val.lastIndexOf('.');
    if (idx !== -1) {
      const extractedVal = val.substring(0, idx);

      const actual = createHmac(hashAlg, secret).update(extractedVal).digest();
      const expected = Buffer.from(val.substring(idx + 1), 'base64url');

      if (
        actual.byteLength === expected.byteLength &&
        timingSafeEqual(actual, expected)
      )
        return extractedVal;
    }
  },
];
