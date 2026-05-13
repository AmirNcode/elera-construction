import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Logo from '~/components/brand/Logo.astro';

describe('Logo', () => {
  it('renders the horizontal lockup by default with brand name', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo);
    expect(html).toContain('ELERA');
    expect(html).toContain('CONSTRUCTION');
    expect(html).toMatch(/data-variant="horizontal"/);
  });

  it('renders the stacked lockup when variant="stacked"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo, { props: { variant: 'stacked' } });
    expect(html).toMatch(/data-variant="stacked"/);
    expect(html).toContain('ELERA');
  });

  it('renders the icon-only variant without the wordmark', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo, { props: { variant: 'icon' } });
    expect(html).toMatch(/data-variant="icon"/);
    expect(html).not.toContain('ELERA');
  });

  it('renders exactly 16 sunburst rays', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Logo);
    const rayMatches = html.match(/<line[^>]+>/g) ?? [];
    expect(rayMatches.length).toBe(16);
  });
});
