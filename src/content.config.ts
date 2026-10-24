import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.strictObject({
  en: z.string().trim().min(1),
  zh: z.string().trim().min(1),
});

// One YAML file per work in src/content/works/. The file name is the slug,
// and the image is src/assets/works/<slug>.jpg (see src/lib/works.ts).
const works = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/works' }),
  schema: z.strictObject({
    title: localized,
    year: z.int().min(1900).max(2100),
    category: z.enum(['places', 'people', 'flowers']),
    medium: localized,
    edition: localized.optional(),
    alt: localized,
    order: z.number(),
  }),
});

export const collections = { works };
