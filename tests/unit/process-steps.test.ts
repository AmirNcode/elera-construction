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
    expect(html).toContain('01');
    expect(html).toContain('04');
    expect(html).not.toContain('05');
  });
});
