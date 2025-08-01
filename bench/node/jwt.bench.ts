import { summary, run, bench, do_not_optimize } from 'mitata';

import jsonwebtoken from 'jsonwebtoken';
import { createSigner as fastJwtSigner } from 'fast-jwt';

const DAT = new Array(500).fill(0).map(() => ({ msg: '' + Math.random() }));
const KEY = crypto.randomUUID();

const fastJwtSign = fastJwtSigner({ key: KEY });

// Example benchmark
summary(() => {
  bench('sign - jsonwebtoken (node)', () => {
    for (let i = 0; i < DAT.length; i++)
      do_not_optimize(jsonwebtoken.sign(DAT[i], KEY));
  });

  bench('sign - fast-jwt (node)', () => {
    for (let i = 0; i < DAT.length; i++) do_not_optimize(fastJwtSign(DAT[i]));
  });
});

// Start the benchmark
run();
