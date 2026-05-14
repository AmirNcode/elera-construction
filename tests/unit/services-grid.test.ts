import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ServicesGrid from '~/components/sections/ServicesGrid.astro';

describe('ServicesGrid', () => {
  it('renders the five services with links to their detail pages', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(ServicesGrid);
    expect(html).toContain('Bathroom Renovations');
    expect(html).toContain('Kitchen Renovations');
    expect(html).toContain('Flooring');
    expect(html).toContain('Cabinetry');
    expect(html).toContain('Full-Home Renovations');
    expect(html).toContain('/services/bathroom-renovation');
    expect(html).toContain('/services/kitchen-renovation');
    expect(html).toContain('/services/flooring');
    expect(html).toContain('/services/cabinetry');
    expect(html).toContain('/services/full-home-renovation');
  });
});
