import { textEncoder } from '../coding';
import { toBytes, toHex } from '../polyfill/hex';
import timingSafeEqual from '../polyfill/timingSafeEqual';
import type { HashAlgorithm } from '../types';
import type { Hasher } from './types';

const DERIVE_USAGES = ['deriveBits'] as const;

export interface HashOptions {
  salt?: number;
  iterations?: number; // Default to 1e5
  hash?: HashAlgorithm; // Default to SHA-256
}

// https://webkit.org/demos/webcrypto/pbkdf2.html
export default ((options = {}) => {
  // @ts-expect-error Make options the prototype
  options.name = 'PBKDF2';
  const alg = options.hash ??= 'SHA-256';

  // Store meta for recovery
  const meta = '.' + btoa(alg) + '.' + btoa('' + (options.iterations ??= 1e5));

  // Select correct size for output to avoid unnecessary rehashing
  // https://www.chosenplaintext.ca/2015/10/08/pbkdf2-design-flaw.html
  const outputBitLen = +alg.slice(4);

  // Hash password to Uint8Array
  const hashToBytes = async (
    pwd: string,
    salt: Uint8Array
  ): Promise<Uint8Array> => {
    const opts = Object.create(options);
    // eslint-disable-next-line
    opts.salt = salt;

    return new Uint8Array(await crypto.subtle.deriveBits(
      opts,
      await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(pwd),
        'PBKDF2',
        false,
        DERIVE_USAGES
      ),
      outputBitLen
    ));
  };

  // Expected length
  const outputLen = outputBitLen >>> 3;
  const saltLen = options.salt ?? 16;

  // The expected positions
  const sepPos = saltLen << 1;
  const outputPos = sepPos + 1;
  const expectedLen = outputPos + (outputLen << 1) + meta.length;

  return [
    async (pwd) => {
      const salt = crypto.getRandomValues(new Uint8Array(saltLen));
      return toHex(salt) + '.' + toHex(await hashToBytes(pwd, salt)) + meta;
    },

    async (hashed, pwd) => {
      if (hashed.length !== expectedLen && hashed.charCodeAt(sepPos) !== 46)
        return false;

      const salt = toBytes(hashed, 0, saltLen);
      const hashedPwd = toBytes(hashed, outputPos, outputLen);
      return salt != null && hashedPwd != null && timingSafeEqual(await hashToBytes(pwd, salt), hashedPwd);
    }
  ];
}) as (options?: HashOptions) => Hasher;
