export const toHexTable: string[] = new Array(256)
  .fill(0)
  .map((_, i) => i.toString(16).padStart(2, '0'));

const toByteTable: number[] = [];
for (let i = 0; i < 10; i++) toByteTable[i + 48] = i;
for (let i = 10; i < 16; i++) toByteTable[i + 55] = toByteTable[i + 87] = i;

/**
 * Decode hex to Uint8Array
 */
export const toBytes = (
  hex: string,
  start: number,
  chars: number,
): Uint8Array | undefined => {
  const arr = new Uint8Array(chars);

  chars <<= 1;
  for (let i = 0, tmp: number; i < chars; i += 2) {
    // eslint-disable-next-line
    tmp =
      (toByteTable[hex.charCodeAt(i + start)] << 4) |
      toByteTable[hex.charCodeAt(i + start + 1)];
    if (Number.isNaN(tmp)) return;
    arr[i >>> 1] = tmp;
  }

  return arr;
};
