import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TrustStrip from '~/components/sections/TrustStrip.astro';

describe('TrustStrip', () => {
  it('renders the four default trust items', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TrustStrip);
    expect(html).toContain('Insured up to $2M');
    expect(html).toContain('WSIB Cleared');
    expect(html).toContain('2-Year Workmanship Warranty');
    expect(html).toContain('Serving All of the GTA');
  });

  it('renders the dark variant when variant="dark"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TrustStrip, { props: { variant: 'dark' } });
    expect(html).toContain('bg-ink');
  });
});
