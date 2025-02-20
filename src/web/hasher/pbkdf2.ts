import { textEncoder } from '../coding';
import { toBytes, toHex } from '../polyfill/hex';
import timingSafeEqual from '../polyfill/timingSafeEqual';
import type { Hasher } from './types';

const DERIVE_USAGES = ['deriveBits', 'deriveKey'] as const;

export interface HashOptions {
  saltLen?: number;
  iterations?: number; // Default to 1e5
  hash?: string; // Default to SHA-256
}

const hash = async (pwd: string, options: {
  name: 'PBKDF2',
  salt: Uint8Array,
  iterations: number,
  hash: string
}): Promise<Uint8Array> => new Uint8Array(await crypto.subtle.deriveBits(
  options,
  await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(pwd),
    'PBKDF2',
    false,
    DERIVE_USAGES
  ),
  options.salt.length * 8
));

// https://webkit.org/demos/webcrypto/pbkdf2.html
export default ((options = {}) => {
  const saltLen = options.saltLen ?? 16;

  const proto = {
    name: 'PBKDF2',
    salt: null,
    iterations: options.iterations ?? 1e5,
    hash: options.hash ?? 'SHA-256'
  };

  return [
    async (pwd) => {
      const salt = crypto.getRandomValues(new Uint8Array(saltLen));
      const opts = Object.create(proto);
      // eslint-disable-next-line
      opts.salt = salt;

      return toHex(salt) + ':' + toHex(await hash(pwd, opts));
    },
    async (hashed, pwd) => {
      const delim = hashed.indexOf(':');
      if (delim !== -1) {
        const hashedPwd = toBytes(hashed.substring(delim + 1));
        if (hashedPwd != null) {
          const opts = Object.create(proto);
          // eslint-disable-next-line
          opts.salt = toBytes(hashed.substring(0, delim));
          return timingSafeEqual(await hash(pwd, opts), hashedPwd);
        }
      }
    }
  ];
}) as (options?: HashOptions) => Hasher;
