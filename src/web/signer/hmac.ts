import { decodeBase64Url, decodeBase64UrlToString, encodeBase64Url, stringToByteArray, textEncoder } from '../coding';
import type { Signer } from './types';

export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
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
    async (msg) => {
      const encodedBuf = textEncoder.encode(msg);
      return encodeBase64Url(encodedBuf) + '.' + encodeBase64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encodedBuf)));
    },

    async (msg) => {
      const delim = msg.lastIndexOf('.');
      if (delim !== -1) {
        try {
          const payload = decodeBase64UrlToString(msg.substring(0, delim));
          if (await crypto.subtle.verify('HMAC', key, decodeBase64Url(msg.slice(delim + 1)), stringToByteArray(payload)))
            return payload;
        } catch {}
      }

      return null;
    }
  ];
};
