import { categories, type Category } from './works';

/** The home page is the wall of the first category (SPEC 5.2). */
export const HOME_CATEGORY: Category = categories[0];

/** Locale-neutral path of a category's wall: the home page for the first, `/<category>/` for the rest. */
export function wallPath(category: Category): string {
  return category === HOME_CATEGORY ? '/' : `/${category}/`;
}

/** The category whose wall lives at a locale-neutral path, if any. */
export function wallCategory(path: string): Category | undefined {
  return categories.find((c) => wallPath(c) === path);
}

/** Every wall cell is 4:5 (width:height), the shape of most works (SPEC 5.2). */
const CELL_RATIO = 4 / 5;

/**
 * Width of a work inside its cell, as a percentage of the cell width, so the whole work fits
 * uncropped. Works wider than 4:5 fill the width; taller ones fill the height and get narrower.
 */
export function fitWidthPercent(width: number, height: number): number {
  const ratio = width / height;
  return ratio >= CELL_RATIO ? 100 : Math.round((ratio / CELL_RATIO) * 10000) / 100;
}
