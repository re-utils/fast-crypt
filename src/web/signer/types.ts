export type Signer = [
  sign: (msg: string) => Promise<string>,
  verify: (msg: string) => Promise<string | undefined>
];
