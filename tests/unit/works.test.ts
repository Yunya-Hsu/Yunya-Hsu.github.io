import type { ImageMetadata } from 'astro';
import { describe, expect, it } from 'vitest';
import { imagesBySlug, isPlaceholder, resolveWorks, type WorkData } from '../../src/lib/works';

const image = (src: string) => ({ src, width: 100, height: 100, format: 'jpg' }) as ImageMetadata;

const data = (order: number): WorkData => ({
  title: { en: 'T', zh: 'T' },
  year: 2025,
  category: 'places',
  medium: { en: 'Digital illustration', zh: '數位插畫' },
  alt: { en: 'A', zh: 'A' },
  order,
});

const images = (...slugs: string[]) => new Map(slugs.map((s) => [s, image(`/${s}.jpg`)]));

describe('imagesBySlug', () => {
  it('keys images by file name without extension', () => {
    const map = imagesBySlug({ '/src/assets/works/lisbon-tram.jpg': image('a') });
    expect([...map.keys()]).toEqual(['lisbon-tram']);
  });

  it('rejects two images with the same name', () => {
    expect(() =>
      imagesBySlug({ '/src/assets/works/a.jpg': image('a'), '/src/assets/works/a.png': image('b') }),
    ).toThrow(/Two images share the name "a"/);
  });
});

describe('resolveWorks', () => {
  it('attaches images and sorts by order', () => {
    const works = resolveWorks(
      [
        { id: 'b', data: data(20) },
        { id: 'a', data: data(10) },
      ],
      images('a', 'b'),
    );
    expect(works.map((w) => w.slug)).toEqual(['a', 'b']);
    expect(works[0].image.src).toBe('/a.jpg');
  });

  it('fails when a work has no image', () => {
    expect(() => resolveWorks([{ id: 'a', data: data(1) }], images())).toThrow(
      /a\.yaml: no image found\. Add src\/assets\/works\/a\.jpg/,
    );
  });

  it('fails when an image has no data file', () => {
    expect(() => resolveWorks([{ id: 'a', data: data(1) }], images('a', 'b'))).toThrow(
      /src\/assets\/works\/b: no data file found/,
    );
  });

  it('fails on a duplicate order and names both works', () => {
    expect(() =>
      resolveWorks(
        [
          { id: 'a', data: data(1) },
          { id: 'b', data: data(1) },
        ],
        images('a', 'b'),
      ),
    ).toThrow(/order 1 is used by more than one work: a, b/);
  });

  it('fails on a file name that is not URL-safe', () => {
    expect(() => resolveWorks([{ id: 'Lisbon Tram', data: data(1) }], images('Lisbon Tram'))).toThrow(
      /lowercase letters, numbers and dashes/,
    );
  });

  it('reports every problem at once', () => {
    const error = (() => {
      try {
        resolveWorks(
          [
            { id: 'a', data: data(1) },
            { id: 'b', data: data(1) },
          ],
          images('a'),
        );
      } catch (e) {
        return (e as Error).message;
      }
    })();
    expect(error).toMatch(/b\.yaml: no image found/);
    expect(error).toMatch(/order 1 is used by more than one work/);
  });
});

describe('isPlaceholder', () => {
  it('matches the placeholder- prefix only', () => {
    expect(isPlaceholder({ slug: 'placeholder-1' })).toBe(true);
    expect(isPlaceholder({ slug: 'lisbon-tram' })).toBe(false);
  });
});
