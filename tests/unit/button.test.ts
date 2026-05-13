import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Button from '~/components/ui/Button.astro';

describe('Button', () => {
  it('renders an <a> when href is provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/contact' },
      slots: { default: 'Get a quote' },
    });
    expect(html).toMatch(/<a [^>]*href="\/contact"/);
    expect(html).toContain('Get a quote');
  });

  it('renders a <button> when no href is given', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      slots: { default: 'Submit' },
    });
    expect(html).toMatch(/<button[^>]*type="button"/);
  });

  it('applies the primary variant by default with the midnight bg class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/' },
      slots: { default: 'Primary' },
    });
    expect(html).toContain('bg-midnight');
  });

  it('applies the secondary variant outline styling', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/', variant: 'secondary' },
      slots: { default: 'Secondary' },
    });
    expect(html).toMatch(/border/);
    expect(html).not.toContain('bg-midnight');
  });

  it('applies the ghost variant (text-only)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Button, {
      props: { href: '/', variant: 'ghost' },
      slots: { default: 'Ghost' },
    });
    expect(html).toContain('underline');
  });
});
