// Based on https://github.com/brix/crypto-js 4.1.1 (MIT)

import {
  concatWords,
  initWords,
  initWordsFromUtf8,
  wordsToBase64,
  type Words,
} from './word-array';

// Initialization and round constants tables
const H = [
  1_779_033_703, -1_150_833_019, 1_013_904_242, -1_521_486_534, 1_359_893_119,
  -1_694_144_372, 528_734_635, 1_541_459_225,
];
const K = [
  1_116_352_408, 1_899_447_441, -1_245_643_825, -373_957_723, 961_987_163,
  1_508_970_993, -1_841_331_548, -1_424_204_075, -670_586_216, 310_598_401,
  607_225_278, 1_426_881_987, 1_925_078_388, -2_132_889_090, -1_680_079_193,
  -1_046_744_716, -459_576_895, -272_742_522, 264_347_078, 604_807_628,
  770_255_983, 1_249_150_122, 1_555_081_692, 1_996_064_986, -1_740_746_414,
  -1_473_132_947, -1_341_970_488, -1_084_653_625, -958_395_405, -710_438_585,
  113_926_993, 338_241_895, 666_307_205, 773_529_912, 1_294_757_372,
  1_396_182_291, 1_695_183_700, 1_986_661_051, -2_117_940_946, -1_838_011_259,
  -1_564_481_375, -1_474_664_885, -1_035_236_496, -949_202_525, -778_901_479,
  -694_614_492, -200_395_387, 275_423_344, 430_227_734, 506_948_616,
  659_060_556, 883_997_877, 958_139_571, 1_322_822_218, 1_537_002_063,
  1_747_873_779, 1_955_562_222, 2_024_104_815, -2_067_236_844, -1_933_114_872,
  -1_866_530_822, -1_538_233_109, -1_090_935_817, -965_641_998,
];

// Reusable object
const W: number[] = [];

type Hasher = [dat: Words, hash: Words, nDataBytes: number, minBufSize: number];

const init = (): Hasher => [[[], 0], initWords([...H]), 0, 0];

const append = (hasher: Hasher, data: string | Words) => {
  // Convert string to WordArray, else assume WordArray already
  if (typeof data === 'string') data = initWordsFromUtf8(data);

  // Append
  concatWords(hasher[0], data);
  hasher[2] += data[1];
};

const processBlock = (hasher: Hasher, M: number[], offset: number) => {
  // Shortcut
  const H = hasher[1][0];

  // Working variables
  let a = H[0];
  let b = H[1];
  let c = H[2];
  let d = H[3];
  let e = H[4];
  let f = H[5];
  let g = H[6];
  let h = H[7];

  // Computation
  for (let i = 0; i < 64; i++) {
    if (i < 16) {
      W[i] = M[offset + i] | 0;
    } else {
      const gamma0x = W[i - 15];
      const gamma0 =
        ((gamma0x << 25) | (gamma0x >>> 7)) ^
        ((gamma0x << 14) | (gamma0x >>> 18)) ^
        (gamma0x >>> 3);

      const gamma1x = W[i - 2];
      const gamma1 =
        ((gamma1x << 15) | (gamma1x >>> 17)) ^
        ((gamma1x << 13) | (gamma1x >>> 19)) ^
        (gamma1x >>> 10);

      W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    }

    const t1 =
      h +
      // sigma1
      (((e << 26) | (e >>> 6)) ^
        ((e << 21) | (e >>> 11)) ^
        ((e << 7) | (e >>> 25))) +
      // ch
      ((e & f) ^ (~e & g)) +
      K[i] +
      W[i];

    h = g;
    g = f;
    f = e;
    e = (d + t1) | 0;
    d = c;
    c = b;
    b = a;
    a =
      (t1 +
        // t2

        // sigma0
        ((((a << 30) | (a >>> 2)) ^
          ((a << 19) | (a >>> 13)) ^
          ((a << 10) | (a >>> 22))) +
          // maj
          ((a & b) ^ (a & c) ^ (b & c)))) |
      0;
  }

  // Intermediate hash value
  H[0] = (H[0] + a) | 0;
  H[1] = (H[1] + b) | 0;
  H[2] = (H[2] + c) | 0;
  H[3] = (H[3] + d) | 0;
  H[4] = (H[4] + e) | 0;
  H[5] = (H[5] + f) | 0;
  H[6] = (H[6] + g) | 0;
  H[7] = (H[7] + h) | 0;
};

const process = (hasher: Hasher, doFlush?: boolean): Words => {
  const data = hasher[0];

  // Count blocks ready
  const nBlocksReady = doFlush
    ? // Round up to include partial blocks
      Math.ceil(data[1] / 64)
    : // Round down to include only full blocks,
      // less the number of blocks that must remain in the buffer
      Math.max(((data[1] / 64) | 0) - hasher[3], 0);

  // Count words ready
  const nWordsReady = nBlocksReady * 16;

  // Count bytes ready
  const nBytesReady = Math.min(nWordsReady * 4, data[1]);

  // Process blocks
  if (nWordsReady !== 0) {
    for (let offset = 0; offset < nWordsReady; offset += 16)
      // Perform concrete-algorithm logic
      processBlock(hasher, data[0], offset);

    // Remove processed words
    data[1] -= nBytesReady;
    return [data[0].splice(0, nWordsReady), nBytesReady];
  }

  // Return processed words
  return [[], nBytesReady];
};

const finalize = (hasher: Hasher): Words => {
  const data = hasher[0];
  const dataWords = data[0];

  const nBitsTotal = hasher[2] * 8;
  const nBitsLeft = data[1] * 8;

  // Add padding
  dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32));
  dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(
    nBitsTotal / 0x1_00_00_00_00,
  );
  dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
  data[1] = dataWords.length * 4;

  // Hash final blocks
  process(hasher);

  // Return final computed hash
  return hasher[1];
};

export default (msg: string): string => {
  const t = init();
  append(t, msg);
  return wordsToBase64(finalize(t));
};
