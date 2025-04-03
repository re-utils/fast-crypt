import { summary, run, bench, do_not_optimize } from 'mitata';

import { sign as honoSign, verify as honoVerify } from 'hono/jwt';
import cryptJwt from 'fast-crypt/web/jwt';

const DAT = new Array(500).fill(0).map(() => ({ msg: '' + Math.random() }));
const KEY = crypto.randomUUID();

const [fastCryptSign, fastCryptVerify] = await cryptJwt(KEY);

// for (let i = 0; i < 3; i++) {
//   console.log('jsonwebtoken:', baseJwt.sign(DAT[i], KEY));
//   console.log('fast-crypt:', await cryptSign(DAT[i]));
//   console.log('hono/jwt:', await honoSign(DAT[i], KEY));
// }

// Example benchmark
summary(() => {
  bench('sign - fast-crypt (web)', async () => {
    for (let i = 0; i < DAT.length; i++)
      do_not_optimize(await fastCryptSign(DAT[i]));
  });

  bench('sign - hono/jwt (web)', async () => {
    for (let i = 0; i < DAT.length; i++)
      do_not_optimize(await honoSign(DAT[i], KEY));
  });
});

{
  const createTokens = (f: (d: typeof DAT[number]) => Promise<any>) => Promise.all(DAT.map(f));

  const fastCryptTokens = await createTokens(fastCryptSign);
  const honoTokens = await createTokens((d) => honoSign(d, KEY));

  summary(() => {
    bench('verify - fast-crypt (web)', async () => {
      for (let i = 0; i < fastCryptTokens.length; i++)
        do_not_optimize(await fastCryptVerify(fastCryptTokens[i]));
    });

    bench('verify - hono/jwt (web)', async () => {
      for (let i = 0; i < honoTokens.length; i++)
        do_not_optimize(await honoVerify(honoTokens[i], KEY));
    });
  });
}

// Start the benchmark
run();
