import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '~/components/layout/Header.astro';

describe('Header', () => {
  it('renders all primary nav links and the phone pill', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(Header);
    expect(html).toContain('href="/services"');
    expect(html).toContain('href="/projects"');
    expect(html).toContain('href="/process"');
    expect(html).toContain('href="/about"');
    expect(html).toContain('href="/faq"');
    expect(html).toContain('416-837-6897');
    expect(html).toMatch(/aria-label="Open menu"/);
  });
});
