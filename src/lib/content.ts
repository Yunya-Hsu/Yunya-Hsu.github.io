import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import { imagesBySlug, isPlaceholder, resolveWorks, type Work } from './works';

const workImages = import.meta.glob<ImageMetadata>('/src/assets/works/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

// The real avatar is src/assets/avatar.jpg (or .png/.webp); until it exists the About page shows a grey circle.
const avatarImages = import.meta.glob<ImageMetadata>('/src/assets/avatar.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

let cache: Promise<Work[]> | undefined;

/** All works, validated and sorted by `order`. */
export function getWorks(): Promise<Work[]> {
  cache ??= getCollection('works').then((entries) => resolveWorks(entries, imagesBySlug(workImages)));
  return cache;
}

export function getAvatar(): ImageMetadata | undefined {
  return Object.values(avatarImages)[0];
}

/** True while any placeholder work or the placeholder avatar is still on the site (SPEC 6.4). */
export async function hasPlaceholderContent(): Promise<boolean> {
  const works = await getWorks();
  return works.some(isPlaceholder) || !getAvatar();
}
