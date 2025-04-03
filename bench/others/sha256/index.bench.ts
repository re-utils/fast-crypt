import { summary, run, bench, do_not_optimize } from 'mitata';
import ohash from './ohash';
import { hash } from 'node:crypto';
import { encodeBase64Url, textEncoder } from 'fast-crypt/web/coding';
import optimized from './optimized';

summary(() => {
  const MSG = 'hello world';

  bench('ohash', function* () {
    yield {
      [0]() {
        return MSG;
      },

      bench(msg: string) {
        do_not_optimize(ohash(msg));
      }
    }
  });

  bench('optimized ohash', function* () {
    yield {
      [0]() {
        return MSG;
      },

      bench(msg: string) {
        do_not_optimize(optimized(msg));
      }
    }
  });

  bench('node crypto', function* () {
    yield {
      [0]() {
        return MSG;
      },

      bench(msg: string) {
        do_not_optimize(hash('sha256', msg, 'base64url'));
      }
    }
  });

  bench('web crypto', function* () {
    yield {
      [0]() {
        return MSG;
      },

      async bench(msg: string) {
        do_not_optimize(
          encodeBase64Url(
            new Uint8Array(
              await crypto.subtle.digest('SHA-256', textEncoder.encode(msg))
            )
          )
        );
      }
    }
  });
});

run();
