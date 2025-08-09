import type { SecretKey } from './utils.ts';

export type SecretList = [list: SecretKey[], idx: number];

export const init = (list: SecretKey[]): SecretList => [list, 0];

export const rotate = (secrets: SecretList, secret: SecretKey): void => {
  secrets[0][
    secrets[1] === secrets[0].length ? (secrets[1] = 0) : secrets[1]++
  ] = secret;
};

export const get = (secrets: SecretList): SecretKey => secrets[0][secrets[1]]!;
