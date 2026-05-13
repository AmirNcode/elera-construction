import { describe, it, expect } from 'vitest';
import { site } from '~/lib/site';

describe('site config', () => {
  it('uses the eleraconstruction.com origin', () => {
    expect(site.url).toBe('https://eleraconstruction.com');
  });

  it('has the founder first name set', () => {
    expect(site.founder).toBe('Kaveh');
  });

  it('exposes a tel: link in addition to the display phone', () => {
    expect(site.phoneHref.startsWith('tel:+')).toBe(true);
    expect(site.phoneHref.replace(/[^0-9]/g, '')).toContain('14168376897');
  });
});
