import { createHmac } from 'node:crypto';

import { encodeBase64Url } from '../coding';
import type { KeyData, Signer } from './types';

/**
 * A single key signer and verifier
 */
export default (secret: KeyData, hashAlg: string = 'sha256'): Signer => (val: string): string => encodeBase64Url(val) + '.' + createHmac(hashAlg, secret).update(val).digest('base64url');
