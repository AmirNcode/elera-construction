// src/lib/seo.ts
// Pure builders that return schema.org JSON-LD objects. Components render
// them as <script type="application/ld+json">. All builders import site
// facts from `~/lib/site` so changes to NAP propagate everywhere.

import { site } from '~/lib/site';

// Service areas covered by Elera in the GTA. Used in LocalBusiness areaServed.
const GTA_CITIES = [
  'Toronto',
  'Mississauga',
  'Vaughan',
  'Markham',
  'Richmond Hill',
  'Oakville',
  'Brampton',
  'Burlington',
  'Pickering',
  'Ajax',
  'Whitby',
  'Oshawa',
  'Milton',
] as const;

export interface LocalBusinessSchema {
  '@context': 'https://schema.org';
  '@type': 'LocalBusiness' | 'GeneralContractor';
  name: string;
  url: string;
  telephone: string;
  email: string;
  description: string;
  founder?: { '@type': 'Person'; givenName: string };
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
  areaServed: Array<{ '@type': 'City'; name: string }>;
}

export function buildLocalBusiness(): LocalBusinessSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: site.name,
    url: site.url,
    telephone: `+1${site.phone.replace(/[^0-9]/g, '')}`,
    email: site.email,
    description: site.description,
    founder: site.founder
      ? { '@type': 'Person', givenName: site.founder }
      : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressRegion: site.region,
      addressCountry: site.country,
    },
    areaServed: GTA_CITIES.map((c) => ({ '@type': 'City', name: c })),
  };
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  url: string;
  description: string;
  provider: { '@type': 'GeneralContractor'; name: string; url: string };
  areaServed: string;
  serviceType: string;
}

export function buildService(input: {
  name: string;
  slug: string;
  description: string;
  serviceType: string;
}): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    url: `${site.url}/services/${input.slug}`,
    description: input.description,
    provider: {
      '@type': 'GeneralContractor',
      name: site.name,
      url: site.url,
    },
    areaServed: site.serviceArea,
    serviceType: input.serviceType,
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: { '@type': 'Answer'; text: string };
  }>;
}

export function buildFAQPage(faqs: FAQItem[]): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

export function buildBreadcrumb(items: BreadcrumbItem[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${site.url}${item.url}`,
    })),
  };
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author: { '@type': 'Organization'; name: string };
  publisher: { '@type': 'Organization'; name: string };
}

export function buildArticle(input: {
  title: string;
  summary: string;
  slug: string;
  publishedAt: Date;
  updatedAt?: Date;
}): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.summary,
    url: `${site.url}/blog/${input.slug}`,
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt?.toISOString() ?? input.publishedAt.toISOString(),
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  };
}

export interface ProjectSchema {
  '@context': 'https://schema.org';
  '@type': 'CreativeWork';
  name: string;
  description: string;
  url: string;
  creator: { '@type': 'GeneralContractor'; name: string; url: string };
  dateCreated?: string;
  contentLocation?: { '@type': 'Place'; name: string };
}

export function buildProject(input: {
  title: string;
  summary: string;
  slug: string;
  year?: number;
  location?: string;
}): ProjectSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: input.title,
    description: input.summary,
    url: `${site.url}/projects/${input.slug}`,
    creator: {
      '@type': 'GeneralContractor',
      name: site.name,
      url: site.url,
    },
    dateCreated: input.year ? `${input.year}-01-01` : undefined,
    contentLocation: input.location
      ? { '@type': 'Place', name: input.location }
      : undefined,
  };
}
