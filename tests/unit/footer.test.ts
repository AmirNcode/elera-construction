import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from '~/components/layout/Footer.astro';

describe('Footer', () => {
  it('renders site name, phone, email, all five service links, and policy links', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Footer);
    expect(html).toContain('Elera Construction');
    expect(html).toContain('416-837-6897');
    expect(html).toContain('leads@eleraconstruction.com');
    expect(html).toContain('/services/bathroom-renovation');
    expect(html).toContain('/services/kitchen-renovation');
    expect(html).toContain('/services/flooring');
    expect(html).toContain('/services/cabinetry');
    expect(html).toContain('/services/full-home-renovation');
    expect(html).toContain('/privacy');
    expect(html).toContain('/terms');
  });
});
