export type Hasher = [
  sign: (msg: string) => Promise<string>,
  verify: (hash: string, msg: string) => Promise<boolean>,
];
