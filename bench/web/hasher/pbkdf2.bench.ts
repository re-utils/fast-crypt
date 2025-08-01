/**
 * @module
 * This checks whether pbkdf2 takes a reasonable
 * amount of time to calculate
 */

import { run, bench, do_not_optimize } from 'mitata';
import pbkdf2 from 'fast-crypt/web/hasher/pbkdf2';

const [hash, verify] = pbkdf2(),
  messages = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    '111111',
    '12345678',
    '12345',
    '654321',
    'abcdef',
  ],
  hashedMessages = await Promise.all(messages.map(hash));

bench('Create hash', function* () {
  yield {
    [0]() {
      return messages;
    },
    [1]() {
      return Math.round(Math.random() * (messages.length - 1));
    },

    async bench(data: typeof messages, i: number) {
      do_not_optimize(await hash(data[i]));
    },
  };
});

bench('Verify hash', function* () {
  yield {
    [0]() {
      return hashedMessages;
    },
    [1]() {
      return messages;
    },
    [2]() {
      return Math.round(Math.random() * (messages.length - 1));
    },

    async bench(
      hashed: typeof hashedMessages,
      data: typeof messages,
      i: number,
    ) {
      do_not_optimize(await verify(hashed[i], data[i]));
    },
  };
});

run();
