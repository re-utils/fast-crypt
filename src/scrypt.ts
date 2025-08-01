import { randomBytes, scrypt, type BinaryLike } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { err, type Err } from '@safe-std/error';

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
 * @returns - A signer that create hashes with format: `s0$cost$blockSize$parallelization$salt$hash`
 */
export const signer = (
  options?: Options,
): ((pwd: BinaryLike) => Promise<string | Err<Error>>) => {
  const { keyLen = 32, saltLen = 16 } = (options ??= {});

  const log2cost = (options.cost ??= 14);
  options.cost = 2 ** log2cost;

  const prefix =
    's0$' +
    log2cost +
    '$' +
    (options.blockSize ?? 8) +
    '$' +
    (options.parallelization ?? 1) +
    '$';

  return (pwd) =>
    new Promise((res) => {
      randomBytes(saltLen, (e, salt) => {
        if (e == null)
          scrypt(pwd, salt, keyLen, options, (e, key) =>
            res(
              e == null
                ? prefix + salt.toBase64() + '$' + key.toBase64()
                : err(e),
            ),
          );
        else res(err(e));
      });
    });
};

export const verify = async (pwd: string, hash: string): Promise<boolean> => {
  const parts = hash.split('$', 6);
  if (parts.length === 6 && parts[0] === 's0') {
    const N = +parts[1];
    const r = +parts[2];
    const p = +parts[3];

    if (
      Number.isInteger(N) &&
      Number.isSafeInteger(r) &&
      Number.isSafeInteger(p) &&
      N > 0 &&
      N < 64 &&
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
            { N: 2 ** N, r, p },
            (err, pwdHash) => {
              res(err == null && pwdHash.compare(hashKey) === 0);
            },
          ),
        );
    }
  }

  return false;
};
