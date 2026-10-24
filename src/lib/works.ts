import type { ImageMetadata } from 'astro';

export const categories = ['places', 'people', 'flowers'] as const;
export type Category = (typeof categories)[number];

type Localized = { en: string; zh: string };

export interface WorkData {
  title: Localized;
  year: number;
  category: Category;
  medium: Localized;
  edition?: Localized;
  alt: Localized;
  order: number;
}

export interface Work extends WorkData {
  slug: string;
  image: ImageMetadata;
}

/** Placeholder works and images are the files whose name starts with this prefix. */
export const PLACEHOLDER_PREFIX = 'placeholder-';

/** Turn a src/assets/works/ glob result into slug → image. */
export function imagesBySlug(modules: Record<string, ImageMetadata>): Map<string, ImageMetadata> {
  const map = new Map<string, ImageMetadata>();
  for (const [file, image] of Object.entries(modules)) {
    const slug = file.split('/').pop()!.replace(/\.[^.]+$/, '');
    if (map.has(slug)) {
      throw new Error(`Two images share the name "${slug}" in src/assets/works/. Keep only one.`);
    }
    map.set(slug, image);
  }
  return map;
}

/**
 * Join each work with its image and sort by `order`.
 * Throws a readable error for a missing image, a duplicate order or an orphan image,
 * so the build fails instead of shipping a broken wall.
 */
export function resolveWorks(
  entries: { id: string; data: WorkData }[],
  images: Map<string, ImageMetadata>,
): Work[] {
  const problems: string[] = [];

  for (const { id } of entries) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
      problems.push(
        `src/content/works/${id}.yaml: the file name is used in the URL, so use only lowercase letters, numbers and dashes (e.g. lisbon-tram.yaml).`,
      );
    }
    if (!images.has(id)) {
      problems.push(`src/content/works/${id}.yaml: no image found. Add src/assets/works/${id}.jpg.`);
    }
  }

  const ids = new Set(entries.map((e) => e.id));
  for (const slug of images.keys()) {
    if (!ids.has(slug)) {
      problems.push(`src/assets/works/${slug}: no data file found. Add src/content/works/${slug}.yaml.`);
    }
  }

  const byOrder = new Map<number, string[]>();
  for (const { id, data } of entries) {
    byOrder.set(data.order, [...(byOrder.get(data.order) ?? []), id]);
  }
  for (const [order, slugs] of byOrder) {
    if (slugs.length > 1) {
      problems.push(`order ${order} is used by more than one work: ${slugs.join(', ')}. Give each work a different order.`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`Work data has problems:\n- ${problems.join('\n- ')}`);
  }

  return entries
    .map(({ id, data }) => ({ ...data, slug: id, image: images.get(id)! }))
    .sort((a, b) => a.order - b.order);
}

export function isPlaceholder(work: Pick<Work, 'slug'>): boolean {
  return work.slug.startsWith(PLACEHOLDER_PREFIX);
}
