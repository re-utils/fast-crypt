import type { KeyObject } from 'node:crypto';
import { createHmac, timingSafeEqual, type BinaryLike } from 'node:crypto';

import { decodeBase64Url, encodeBase64Url } from '../coding';
import type { Signer } from './types';

export type KeyData = BinaryLike | KeyObject;

/**
 * A single key signer and verifier
 */
export default (secret: KeyData, hashAlg: string = 'sha256'): Signer => {
  const sign = (val: string): string => encodeBase64Url(val) + '.' + createHmac(hashAlg, secret).update(val).digest('base64url');

  return [
    sign,
    (val: string) => {
      const idx = val.lastIndexOf('.');
      if (idx !== -1) {
        // Decode the actual value
        const extractedVal = decodeBase64Url(val.substring(0, idx));

        // Safe buffer comparison
        const actualBuf = Buffer.from(sign(extractedVal));
        const expectedBuf = Buffer.from(val);

        if (actualBuf.length === expectedBuf.length && timingSafeEqual(actualBuf, expectedBuf))
          return extractedVal;
      }

      return null;
    }
  ];
};
