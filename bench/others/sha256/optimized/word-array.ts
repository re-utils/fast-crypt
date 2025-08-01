const base64KeyStr =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export type Words = [words: number[], sigBytes: number];

export const initWords = (words: number[], sigBytes?: number): Words => [
  words,
  sigBytes ?? words.length * 4,
];

export const initWordsFromUtf8 = (input: string): Words => {
  const str = unescape(encodeURIComponent(input)); // utf8 => latin1
  const len = str.length;

  const words: number[] = [];
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }
  return [words, len];
};

export const wordsToBase64 = (wordArr: Words): string => {
  const words = wordArr[0];
  const sigBytes = wordArr[1];

  let base64Chars: string = '';
  for (let i = 0; i < sigBytes; i += 3) {
    const triplet =
      // Byte 1
      (((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff) << 16) |
      // Byte 2
      (((words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff) << 8) |
      // Byte 3
      ((words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff);

    for (let j = 0; j < 4 && i * 8 + j * 6 < sigBytes * 8; j++)
      base64Chars += base64KeyStr[(triplet >>> (6 * (3 - j))) & 0x3f];
  }
  return base64Chars;
};

export const concatWords = (to: Words, from: Words): void => {
  const desWords = to[0];
  const sourceWords = from[0];

  const curSigBytes = to[1];
  const sourceSigBytes = from[1];

  // Clamp excess bits
  desWords[curSigBytes >>> 2] &= 0xff_ff_ff_ff << (32 - (curSigBytes % 4) * 8);
  desWords.length = Math.ceil(curSigBytes / 4);

  // Concat
  if ((curSigBytes & 3) !== 0) {
    // Copy one byte at a time
    for (let i = 0; i < sourceSigBytes; i++)
      desWords[(curSigBytes + i) >>> 2] |=
        // thatByte
        ((sourceWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff) <<
        (24 - ((curSigBytes + i) % 4) * 8);
  } else {
    // Copy one word at a time
    for (let j = 0; j < sourceSigBytes; j += 4)
      desWords[(curSigBytes + j) >>> 2] = sourceWords[j >>> 2];
  }

  to[1] += sourceSigBytes;
};
