import { describe, expect, it } from 'vitest';
import { authPathFor, safeReturnPath } from './returnPath';

describe('safeReturnPath', () => {
  it('keeps pages inside the app, with their query', () => {
    expect(safeReturnPath('/app/wallet')).toBe('/app/wallet');
    expect(safeReturnPath('%2Fapp%2Fmoney%3Ftab%3Dgoals')).toBe('/app/money?tab=goals');
    expect(safeReturnPath('/app')).toBe('/app');
  });

  it('refuses anything that could leave the app', () => {
    for (const bad of ['https://evil.example/app', '//evil.example/app', '/cards', '/application', '/app/../cards', '/app/../x\\y', '/app/sign-in', 'javascript:alert(1)', '', null]) {
      expect(safeReturnPath(bad as string)).toBeNull();
    }
  });
});

describe('authPathFor', () => {
  it('carries the page to come back to', () => {
    expect(authPathFor('signin', '/app/wallet')).toBe('/app/sign-in?redirect_url=%2Fapp%2Fwallet');
    expect(authPathFor('signup', '/app/money?tab=goals')).toBe('/app/sign-up?redirect_url=%2Fapp%2Fmoney%3Ftab%3Dgoals');
  });

  it('leaves the plain address when there is nowhere special to go back to', () => {
    expect(authPathFor('signin', '/app')).toBe('/app/sign-in');
    expect(authPathFor('signin', 'https://evil.example')).toBe('/app/sign-in');
  });
});
