import { timingSafeEqual } from 'node:crypto';

import { decodeBase64Url } from '../coding';
import type { Signer, Verifier } from './types';

export const verifier = (sign: Signer): Verifier => (val: string) => {
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
};
