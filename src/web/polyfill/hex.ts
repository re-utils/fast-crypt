const toHexTable: string[] = new Array(256)
  .fill(0)
  .map((_, i) => i.toString(16).padStart(2, '0'));

/**
 * Encode an Uint8Array to hex
 */
export const toHex = (arr: Uint8Array): string => {
  let res = '';
  for (let i = 0; i < arr.length; i++) res += toHexTable[arr[i]];
  return res;
};

const toByteTable: number[] = [];
for (let i = 0; i < 10; i++) toByteTable[i + 48] = i;
for (let i = 10; i < 16; i++) toByteTable[i + 55] = toByteTable[i + 87] = i;

/**
 * Decode hex to Uint8Array
 */
export const toBytes = (hex: string): Uint8Array | undefined => {
  const len = hex.length;
  if ((len & 1) === 0) {
    const arr = new Uint8Array(len / 2);

    for (let i = 0, tmp: number; i < len; i += 2) {
      // eslint-disable-next-line
      tmp = (toByteTable[hex.charCodeAt(i)] << 4) | toByteTable[hex.charCodeAt(i + 1)];
      // eslint-disable-next-line
      if (tmp !== tmp) return; // NaN
      arr[i >>> 1] = tmp;
    }

    return arr;
  }
};
