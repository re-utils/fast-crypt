import { test, expect, describe } from 'bun:test';

import nodeHmac from 'fast-crypt/node/signer/hmac';
import webHmac from 'fast-crypt/web/signer/hmac';

describe('HMAC Signer', () => {
  test('Sign & Verify', async () => {
    const KEY = crypto.randomUUID();
    const MSG = 'hello';

    {
      const [sign, verify] = nodeHmac(KEY, 'sha256');
      const signed = sign(MSG);
      expect(verify(signed)).toBe(MSG);
    }

    {
      const [sign, verify] = await webHmac(KEY);
      const signed = await sign(MSG);
      expect(await verify(signed)).toBe(MSG);
    }
  });
});
