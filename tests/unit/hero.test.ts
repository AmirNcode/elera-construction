import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Hero from '~/components/sections/Hero.astro';

describe('Hero', () => {
  it('renders headline, eyebrow, subhead, and both CTAs', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Hero, {
      props: {
        eyebrow: 'GTA',
        headline: 'Renovations built the way',
        headlineAccent: 'top developers',
        headlineTail: 'build.',
        subhead: 'Bathrooms, kitchens, full-home.',
        primaryCta: { label: 'Get a free quote', href: '/contact' },
        secondaryCta: { label: 'See our work', href: '/projects' },
      },
    });
    expect(html).toContain('GTA');
    expect(html).toContain('Renovations built the way');
    expect(html).toContain('top developers');
    expect(html).toContain('build.');
    expect(html).toContain('Get a free quote');
    expect(html).toContain('See our work');
    expect(html).toMatch(/<h1/);
  });

  it('uses the dark variant background when variant="dark"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Hero, {
      props: {
        eyebrow: 'WHY ELERA',
        headline: 'Ten years building',
        headlineAccent: 'for top developers.',
        primaryCta: { label: 'Read our story', href: '/about' },
        variant: 'dark',
      },
    });
    expect(html).toContain('bg-ink');
  });
});
