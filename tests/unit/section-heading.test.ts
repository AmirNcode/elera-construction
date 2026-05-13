import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import SectionHeading from '~/components/ui/SectionHeading.astro';

describe('SectionHeading', () => {
  it('renders the eyebrow, heading and subhead', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SectionHeading, {
      props: {
        eyebrow: 'OUR SERVICES',
        heading: 'Renovations, done properly.',
        subhead: 'From a single bathroom to a full home.',
      },
    });
    expect(html).toContain('OUR SERVICES');
    expect(html).toContain('Renovations, done properly.');
    expect(html).toContain('From a single bathroom to a full home.');
    expect(html).toMatch(/<h2/);
  });

  it('renders an H3 when level=3', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(SectionHeading, {
      props: { eyebrow: '', heading: 'Smaller', level: 3 },
    });
    expect(html).toMatch(/<h3/);
  });
});
