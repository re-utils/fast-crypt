export default (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;

  let res = 0;
  for (let i = 0; i < a.length; i++) res |= a[i] ^ b[i];
  return res === 0;
};
