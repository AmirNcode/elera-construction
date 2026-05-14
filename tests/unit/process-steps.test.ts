import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ProcessSteps from '~/components/sections/ProcessSteps.astro';

describe('ProcessSteps', () => {
  it('renders all 7 default process steps with numbers', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ProcessSteps);
    expect(html).toContain('Free consultation');
    expect(html).toContain('Detailed written quote');
    expect(html).toContain('Design &amp; material selection');
    expect(html).toContain('Permits &amp; scheduling');
    expect(html).toContain('Construction');
    expect(html).toContain('Final walkthrough &amp; handover');
    expect(html).toContain('2-year workmanship warranty');
    // Step numbers 01..07 should appear
    expect(html).toContain('01');
    expect(html).toContain('07');
  });

  it('renders only the first N steps when compact=true with stepLimit', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ProcessSteps, {
      props: { compact: true, stepLimit: 4 },
    });
    // Step numbers render as the text content of a <span>, e.g. ">01<".
    // Use that exact pattern to avoid colliding with line/column digits in
    // Astro's dev-mode source-loc attributes (e.g. data-astro-source-loc="50:5").
    expect(html).toMatch(/>01<\/span>/);
    expect(html).toMatch(/>04<\/span>/);
    expect(html).not.toMatch(/>05<\/span>/);
    expect(html).not.toMatch(/>07<\/span>/);
  });
});
