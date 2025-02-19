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

const toByteTable = new Map(toHexTable.map((hex, i) => {
  const uhex = hex.toUpperCase();

  return [
    [hex, i],
    [hex[0] + uhex[1], i],
    [uhex[0] + hex[1], i],
    [hex.toUpperCase(), i]
  ] as const;
}).flat());

/**
 * Decode hex to Uint8Array
 */
export const toBytes = (hex: string): Uint8Array | undefined => {
  const len = hex.length;
  if ((len & 1) === 0) {
    const arr = new Uint8Array(len);

    for (let i = 0, tmp: number | undefined; i < len; i += 2) {
      tmp = toByteTable.get(hex.substring(i, i + 2));
      if (tmp == null) return;
      arr[i >>> 1] = tmp;
    }

    return arr;
  }
};
