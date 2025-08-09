import { Buffer } from 'node:buffer';
import { type BinaryLike, randomBytes, scrypt } from 'node:crypto';
import { timingSafeEqual } from './utils.ts';

export interface Options {
  /**
   * Generated hash byte length.
   * @default 32
   */
  keyLen?: number;

  /**
   * Generated salt byte length, must be at minimum 16.
   * @default 16
   */
  saltLen?: number;

  /**
   * CPU & memory cost, must be at mininum 1 and maximum 63.
   * @default 14
   */
  cost?: number;

  /**
   * Size of the block allotted.
   * @default 8
   */
  blockSize?: number;

  /**
   * @default 1
   */
  parallelization?: number;
}

/**
 * Create a scrypt signer
 * @param options
 * @returns - A signer that create hashes with format: `$scrypt0$N={cost},r={blockSize},p={parallelization}${salt}${hash}`
 */
export const signer = (
  options?: Options,
): ((pwd: BinaryLike) => Promise<string | Error>) => {
  const { keyLen = 32, saltLen = 16 } = (options ??= {});

  const log2cost = (options.cost ??= 14);
  options.cost = 2 ** log2cost;

  const prefix =
    '$scrypt0$N=' +
    log2cost +
    ',r=' +
    (options.blockSize ?? 8) +
    ',p=' +
    (options.parallelization ?? 1) +
    '$';

  return (pwd) =>
    new Promise((res) => {
      randomBytes(saltLen, (e0, salt) => {
        if (e0 == null)
          scrypt(pwd, salt, keyLen, options, (e1, key) =>
            res(e1 ?? prefix + salt.toBase64() + '$' + key.toBase64()),
          );
        else res(e0);
      });
    });
};

export const verify = (
  pwd: string,
  hash: string,
): Promise<boolean> | boolean => {
  const parts =
    /^\$scrypt0\$N=([1-9]|[1-5][0-9]|6[0-3]),r=(\d+),p=(\d+)\$([^$]+)\$([^$]+)$/.exec(
      hash,
    );

  if (parts !== null) {
    const r = +parts[2];
    const p = +parts[3];

    if (
      Number.isSafeInteger(r) &&
      Number.isSafeInteger(p) &&
      p * r <= 1073741824
    ) {
      const salt = Buffer.from(parts[4], 'base64');
      const hashKey = Buffer.from(parts[5], 'base64');

      if (salt.byteLength > 15)
        return new Promise((res) =>
          scrypt(
            pwd,
            salt,
            hashKey.byteLength,
            { N: 2 ** +parts[1], r, p },
            (err, pwdHash) => {
              res(err == null && timingSafeEqual(pwdHash, hashKey));
            },
          ),
        );
    }
  }

  return false;
};
