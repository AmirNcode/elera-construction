import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Card from '~/components/ui/Card.astro';

describe('Card', () => {
  it('renders a div by default with default-slot content', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Card, { slots: { default: 'Hello' } });
    expect(html).toMatch(/^<div/);
    expect(html).toContain('Hello');
  });

  it('renders an <a> with href when href is provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Card, {
      props: { href: '/services/bathroom' },
      slots: { default: 'Bathroom' },
    });
    expect(html).toMatch(/^<a [^>]*href="\/services\/bathroom"/);
  });
});
