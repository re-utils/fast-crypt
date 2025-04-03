import { Cookie, CookieMap } from 'bun';

import cookie from 'fast-crypt/cookie';
import * as opts from 'fast-crypt/cookie/options';

import { summary, run, bench, do_not_optimize } from 'mitata';

summary(() => {
  bench('Bun.Cookie', function* () {
    yield {
      [0]() {
        return Math.random();
      },
      bench(n: string) {
        do_not_optimize(Cookie.from('id', n, {
          httpOnly: true,
          secure: true
        }).serialize());
      }
    }
  });

  bench('fast-crypt', function* () {
    const [_, setId] = cookie('id', opts.httpOnly + opts.secure);

    yield {
      [0]() {
        return Math.random() + '';
      },
      bench(n: string) {
        do_not_optimize(setId(n));
      }
    }
  });
});

summary(() => {
  bench('Bun.CookieMap', function* () {
    yield {
      [0]() {
        return `name=${Math.random()}&theme=${Math.random()}&foo=${Math.random()}`;
      },
      bench(str: string) {
        const cookie = new CookieMap(str);
        do_not_optimize([
          cookie.get('name'),
          cookie.get('theme'),
          cookie.get('foo')
        ]);
      }
    }
  });

  bench('fast-crypt', function* () {
    const [getName] = cookie('name');
    const [getTheme] = cookie('theme');
    const [getFoo] = cookie('foo');

    yield {
      [0]() {
        return `name=${Math.random()}&theme=${Math.random()}&foo=${Math.random()}`;
      },
      bench(str: string) {
        do_not_optimize([
          getName(str),
          getTheme(str),
          getFoo(str)
        ]);
      }
    }
  });
});

run();
