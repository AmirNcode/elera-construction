import { describe, it, expect } from 'vitest';
import {
  buildLocalBusiness,
  buildService,
  buildFAQPage,
  buildBreadcrumb,
  buildArticle,
  buildProject,
} from '~/lib/seo';

describe('buildLocalBusiness', () => {
  it('returns valid JSON-LD for the company', () => {
    const schema = buildLocalBusiness();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('GeneralContractor');
    expect(schema.name).toBe('Elera Construction');
    expect(schema.telephone).toMatch(/^\+1\d{10}$/);
    expect(schema.email).toBe('leads@eleraconstruction.com');
    expect(schema.address.addressLocality).toBe('Toronto');
    expect(schema.areaServed.length).toBeGreaterThan(5);
    expect(schema.areaServed[0]).toEqual({ '@type': 'City', name: 'Toronto' });
  });

  it('includes the founder when site.founder is set', () => {
    const schema = buildLocalBusiness();
    expect(schema.founder).toEqual({ '@type': 'Person', givenName: 'Kaveh' });
  });
});

describe('buildService', () => {
  it('returns Service JSON-LD with the canonical URL', () => {
    const schema = buildService({
      name: 'Kitchen Renovations',
      slug: 'kitchen-renovation',
      description: 'Custom cabinetry, stone counters, supplier-direct pricing.',
      serviceType: 'Kitchen renovation',
    });
    expect(schema['@type']).toBe('Service');
    expect(schema.url).toBe('https://eleraconstruction.com/services/kitchen-renovation');
    expect(schema.provider.name).toBe('Elera Construction');
    expect(schema.areaServed).toBe('Greater Toronto Area');
  });
});

describe('buildFAQPage', () => {
  it('maps each Q&A to a Question entity', () => {
    const schema = buildFAQPage([
      { question: 'How long?', answer: '6 weeks.' },
      { question: 'Permits?', answer: 'We handle them.' },
    ]);
    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('6 weeks.');
  });
});

describe('buildBreadcrumb', () => {
  it('produces a positioned BreadcrumbList with absolute item URLs', () => {
    const schema = buildBreadcrumb([
      { name: 'Home', url: '/' },
      { name: 'Services', url: '/services' },
      { name: 'Kitchen', url: '/services/kitchen-renovation' },
    ]);
    expect(schema.itemListElement).toHaveLength(3);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[2].item).toBe(
      'https://eleraconstruction.com/services/kitchen-renovation',
    );
  });
});

describe('buildArticle', () => {
  it('returns Article JSON-LD with ISO dates and blog URL', () => {
    const published = new Date('2026-01-15T00:00:00Z');
    const schema = buildArticle({
      title: 'Kitchen Reno Costs 2026',
      summary: 'What to expect in the GTA.',
      slug: 'kitchen-reno-cost-2026',
      publishedAt: published,
    });
    expect(schema['@type']).toBe('Article');
    expect(schema.url).toBe('https://eleraconstruction.com/blog/kitchen-reno-cost-2026');
    expect(schema.datePublished).toBe('2026-01-15T00:00:00.000Z');
    expect(schema.dateModified).toBe(schema.datePublished);
  });
});

describe('buildProject', () => {
  it('returns CreativeWork JSON-LD with project URL and location', () => {
    const schema = buildProject({
      title: 'Leslieville Kitchen',
      summary: 'Full kitchen renovation.',
      slug: 'leslieville-kitchen',
      year: 2025,
      location: 'Leslieville, Toronto',
    });
    expect(schema['@type']).toBe('CreativeWork');
    expect(schema.url).toBe('https://eleraconstruction.com/projects/leslieville-kitchen');
    expect(schema.dateCreated).toBe('2025-01-01');
    expect(schema.contentLocation).toEqual({
      '@type': 'Place',
      name: 'Leslieville, Toronto',
    });
  });
});
