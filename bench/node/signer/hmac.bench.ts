import { summary, run, bench, do_not_optimize } from 'mitata';

import cryptHmac from 'fast-crypt/node/signer/hmac';
// @ts-ignore
import { sign as cookieSign, unsign as cookieVerify } from 'cookie-signature';

const KEY = crypto.randomUUID();
const HASH = 'sha256';
const DAT = new Array(500).fill(0).map(() =>  '' + Math.random());

const [cryptSign, cryptVerify] = cryptHmac(KEY, HASH);

summary(() => {
  bench('sign - fast-crypt', () => {
    for (let i = 0; i < DAT.length; i++)
      do_not_optimize(cryptSign(DAT[i]));
  });

  bench('sign - node-cookie-signature', () => {
    for (let i = 0; i < DAT.length; i++)
      do_not_optimize(cookieSign(DAT[i], KEY));
  });
});

summary(() => {
  {
    const encrypted = DAT.map(cryptSign);
    bench('verify - fast-crypt', () => {
      for (let i = 0; i < encrypted.length; i++)
        do_not_optimize(cryptVerify(encrypted[i]));
    });
  }

  {
    const encrypted = DAT.map((d) => cookieSign(d, KEY));
    bench('verify - node-cookie-signature', () => {
      for (let i = 0; i < encrypted.length; i++)
        do_not_optimize(cookieVerify(encrypted[i], KEY));
    });
  }
});

run();
