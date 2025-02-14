export type Signer = [
  sign: (msg: string) => string,
  verify: (msg: string) => string | null
];
