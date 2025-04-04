import type { KeyImporterAlgorithm } from './algorithm.js';
import { decodeBase64, textEncoder } from '../coding.js';

export type SignatureKey = string | (JsonWebKey & { kid?: string }) | CryptoKey;

const PRIVATE_KEY_USAGES: ['sign'] = ['sign'];
const PUBLIC_KEY_USAGES: ['verify'] = ['verify'];

const pemToBin = (str: string): Uint8Array =>
  decodeBase64(str.replace(/-+(BEGIN|END).*/g, '').replace(/\s/g, ''));

export const importPrivateKey = async (
  key: SignatureKey,
  alg: KeyImporterAlgorithm,
): Promise<CryptoKey> => {
  if (key instanceof CryptoKey) {
    if (key.type !== 'private' && key.type !== 'secret')
      throw new Error('Unexpected key type: ' + key.type);

    return key;
  }

  return typeof key === 'object'
    ? crypto.subtle.importKey('jwk', key, alg, false, PRIVATE_KEY_USAGES)
    : key.includes('PRIVATE')
      ? crypto.subtle.importKey(
          'pkcs8',
          pemToBin(key),
          alg,
          false,
          PRIVATE_KEY_USAGES,
        )
      : crypto.subtle.importKey(
          'raw',
          textEncoder.encode(key),
          alg,
          false,
          PRIVATE_KEY_USAGES,
        );
};

export const exportPublicJWK = async (
  privateKey: CryptoKey,
): Promise<JsonWebKey> => {
  if (privateKey.type !== 'private')
    throw new Error('Unexpected key type: ' + privateKey.type);
  if (!privateKey.extractable)
    throw new Error('Private key is not extractable');

  const jwk = await crypto.subtle.exportKey('jwk', privateKey);
  jwk.key_ops = PUBLIC_KEY_USAGES;
  return jwk;
};

export async function importPublicKey(
  key: SignatureKey,
  alg: KeyImporterAlgorithm,
): Promise<CryptoKey> {
  if (key instanceof CryptoKey) {
    if (key.type === 'public' || key.type === 'secret') return key;

    key = await exportPublicJWK(key);
  }

  if (typeof key === 'string' && key.includes('PRIVATE'))
    key = await exportPublicJWK(
      await crypto.subtle.importKey(
        'pkcs8',
        pemToBin(key),
        alg,
        true,
        PRIVATE_KEY_USAGES,
      ),
    );

  return typeof key === 'object'
    ? crypto.subtle.importKey('jwk', key, alg, false, PUBLIC_KEY_USAGES)
    : key.includes('PUBLIC')
      ? crypto.subtle.importKey(
          'spki',
          pemToBin(key),
          alg,
          false,
          PUBLIC_KEY_USAGES,
        )
      : crypto.subtle.importKey(
          'raw',
          textEncoder.encode(key),
          alg,
          false,
          PUBLIC_KEY_USAGES,
        );
}
