import { test, expect } from 'bun:test';

import nodeHmac from 'fast-crypt/node/signer/hmac';
import webHmac from 'fast-crypt/web/signer/hmac';

import { encodeBase64Url } from 'fast-crypt/node/coding';

test('Sign & Verify', async () => {
  const KEY = crypto.randomUUID();

  const MSG = 'hello';
  const BASE64_MSG = encodeBase64Url(MSG);

  {
    const [sign, verify] = nodeHmac(KEY);
    const signed = sign(MSG);

    expect(signed).toStartWith(BASE64_MSG);
    expect(verify(signed)).toBe(MSG);
  }

  {
    const [sign, verify] = await webHmac(KEY);
    const signed = await sign(MSG);

    expect(signed).toStartWith(BASE64_MSG);
    expect(await verify(signed)).toBe('hello');
  }
})
