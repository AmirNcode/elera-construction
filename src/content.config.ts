// src/content.config.ts
// Type-safe schemas for MDX content collections. Build fails if any entry
// is missing required fields — including image `alt` text.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const SERVICE_TYPES = [
  'bathroom',
  'kitchen',
  'flooring',
  'cabinetry',
  'full-home',
] as const;

const PROPERTY_TYPES = [
  'detached',
  'semi-detached',
  'townhouse',
  'condo',
] as const;

const PlaceholderImage = z.object({
  src: z.string(),
  alt: z.string().min(1, 'Image alt text is required'),
});

const FaqItem = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    serviceType: z.enum(SERVICE_TYPES),
    seoKeyword: z.string(), // e.g., "Kitchen renovation Toronto"
    heroImage: PlaceholderImage,
    whatsIncluded: z.array(z.string()).min(3),
    processNote: z.string().optional(), // Optional service-specific intro paragraph for process
    faqs: z.array(FaqItem).min(3).max(8),
    order: z.number().int().default(99), // sort key for grids
    featured: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    services: z.array(z.enum(SERVICE_TYPES)).min(1),
    propertyType: z.enum(PROPERTY_TYPES),
    location: z.string(), // neighborhood / city
    year: z.number().int().min(2000).max(2100),
    heroImage: PlaceholderImage,
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string().min(1),
          caption: z.string().optional(),
          kind: z.enum(['before', 'after', 'inProgress']).default('after'),
        }),
      )
      .default([]),
    scope: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    summary: z.string().max(220),
    heroImage: PlaceholderImage,
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Elera Construction'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, projects, blog };
