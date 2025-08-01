import { Cookie, CookieMap } from 'bun';

import { parse as cookieParse } from 'cookie';
import { parse as honoParse } from 'hono/utils/cookie';

import { summary, run, bench, do_not_optimize } from 'mitata';

summary(() => {
  bench('Bun.Cookie', function* () {
    yield {
      [0]() {
        return Math.random();
      },
      bench(n: string) {
        do_not_optimize(
          Cookie.from('id', n, {
            httpOnly: true,
            secure: true,
          }).serialize(),
        );
      },
    };
  });
});

summary(() => {
  const values = new Array(500)
    .fill(0)
    .map(
      () =>
        `name=${Math.random()}; theme=${Math.random()}; foo=${Math.random()}`,
    );

  bench('Bun.CookieMap', function* () {
    yield {
      [0]() {
        return values;
      },
      bench(str: string[]) {
        for (let i = 0; i < str.length; i++) {
          const parsed = new CookieMap(str[i]);
          do_not_optimize(parsed.get('name'));
          do_not_optimize(parsed.get('theme'));
          do_not_optimize(parsed.get('foo'));
        }
      },
    };
  });

  bench('cookie', function* () {
    yield {
      [0]() {
        return values;
      },
      bench(str: string[]) {
        for (let i = 0; i < str.length; i++) {
          const parsed = cookieParse(str[i]);
          do_not_optimize(parsed.name);
          do_not_optimize(parsed.theme);
          do_not_optimize(parsed.foo);
        }
      },
    };
  });

  bench('hono', function* () {
    yield {
      [0]() {
        return values;
      },
      bench(str: string[]) {
        for (let i = 0; i < str.length; i++) {
          const parsed = honoParse(str[i]);
          do_not_optimize(parsed.name);
          do_not_optimize(parsed.theme);
          do_not_optimize(parsed.foo);
        }
      },
    };
  });
});

run();
