import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FaqAccordion from '~/components/ui/FaqAccordion.astro';

describe('FaqAccordion', () => {
  it('renders <details> + <summary> for each item', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(FaqAccordion, {
      props: {
        items: [
          { question: 'How long does a kitchen take?', answer: 'About 6 weeks.' },
          { question: 'Do you handle permits?', answer: 'Yes, every time.' },
        ],
      },
    });
    expect((html.match(/<details/g) ?? []).length).toBe(2);
    expect(html).toContain('How long does a kitchen take?');
    expect(html).toContain('About 6 weeks.');
  });
});
