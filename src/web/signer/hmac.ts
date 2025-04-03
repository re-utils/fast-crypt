import { decodeBase64, encodeBase64, stringToByteArray, textEncoder } from '../coding.js';
import type { HashAlgorithm } from '../types.js';
import type { Signer } from './types.js';

export type KeyData = string | BufferSource;

/**
 * A single key signer and verifier
 */
export default async (secret: KeyData, hashAlg?: HashAlgorithm): Promise<Signer> => {
  // Prepare the key
  const key = await crypto.subtle.importKey(
    'raw',
    typeof secret === 'string'
      ? textEncoder.encode(secret)
      : secret,
    {
      name: 'HMAC',
      hash: hashAlg ?? 'SHA-256'
    },
    false,
    ['sign', 'verify']
  );

  return [
    async (msg) => msg + '.' + encodeBase64(new Uint8Array(await crypto.subtle.sign('HMAC', key, textEncoder.encode(msg)))),
    async (msg) => {
      const delim = msg.lastIndexOf('.');
      if (delim !== -1) {
        try {
          const payload = msg.substring(0, delim);
          if (await crypto.subtle.verify('HMAC', key, decodeBase64(msg.slice(delim + 1)), stringToByteArray(payload)))
            return payload;
        } catch {}
      }
    }
  ];
};
