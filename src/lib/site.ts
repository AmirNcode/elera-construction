// src/lib/site.ts
export const site = {
  name: 'Elera Construction',
  tagline: '', // intentionally blank
  description:
    'Premium home renovations across the GTA — bathrooms, kitchens, flooring, cabinetry, and full-home renovations.',
  url: 'https://eleraconstruction.com',
  phone: '416-837-6897',
  phoneHref: 'tel:+14168376897',
  email: 'leads@eleraconstruction.com',
  founder: 'Kaveh',
  city: 'Toronto',
  region: 'Ontario',
  country: 'Canada',
  serviceArea: 'Greater Toronto Area',
  availabilityCopy: 'Available 7 days a week — reach out anytime.',
  social: {
    instagram: '', // placeholder, populate later
    facebook: '',
  },
  trust: {
    insuranceCopy: 'Insured up to $2M',
    wsibCopy: 'WSIB Cleared',
    warrantyCopy: '2-Year Workmanship Warranty',
    serviceAreaCopy: 'Serving All of the GTA',
  },
} as const;

export type Site = typeof site;
