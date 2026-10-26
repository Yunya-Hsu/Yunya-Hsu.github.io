import { describe, expect, it } from 'vitest';
import { HOME_CATEGORY, fitWidthPercent, wallCategory, wallPath } from '../../src/lib/wall';
import { categories } from '../../src/lib/works';

describe('categories', () => {
  it('are Limited Edition Prints then Postcards, and the home page is prints', () => {
    expect(categories).toEqual(['prints', 'postcards']);
    expect(HOME_CATEGORY).toBe('prints');
  });
});

describe('wallPath', () => {
  it('puts prints on the home page and other categories under their own path', () => {
    expect(wallPath('prints')).toBe('/');
    expect(wallPath('postcards')).toBe('/postcards/');
  });

  it('round-trips with wallCategory', () => {
    for (const category of categories) expect(wallCategory(wallPath(category))).toBe(category);
  });
});

describe('wallCategory', () => {
  it('is undefined for pages that are not a wall', () => {
    expect(wallCategory('/about/')).toBeUndefined();
    expect(wallCategory('/works/a/')).toBeUndefined();
    expect(wallCategory('/prints/')).toBeUndefined();
  });
});

describe('fitWidthPercent', () => {
  it('fills the width for 4:5 and anything wider', () => {
    expect(fitWidthPercent(1600, 2000)).toBe(100);
    expect(fitWidthPercent(1800, 1800)).toBe(100);
    expect(fitWidthPercent(2000, 1500)).toBe(100);
  });

  it('narrows works taller than 4:5 so their height fills the cell', () => {
    expect(fitWidthPercent(1500, 2000)).toBe(93.75);
    expect(fitWidthPercent(1000, 2000)).toBe(62.5);
  });
});
