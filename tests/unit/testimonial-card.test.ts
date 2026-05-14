import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import TestimonialCard from '~/components/sections/TestimonialCard.astro';

describe('TestimonialCard', () => {
  it('renders quote, attribution, and project context when provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TestimonialCard, {
      props: {
        quote: 'They finished on time and on budget.',
        author: 'Maria T.',
        context: 'Kitchen renovation, Leslieville',
      },
    });
    expect(html).toContain('They finished on time and on budget.');
    expect(html).toContain('Maria T.');
    expect(html).toContain('Kitchen renovation, Leslieville');
  });

  it('renders a placeholder when no quote is provided', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(TestimonialCard);
    expect(html).toMatch(/data-placeholder/);
  });
});
