import type { Locator } from '@playwright/test';

/** Colour of the selected-state underline, drawn as an ::after line under nav items (SPEC 2.5). */
export const underline = (item: Locator) =>
  item.evaluate((el) => getComputedStyle(el, '::after').backgroundColor);

export const SELECTED = 'rgb(47, 44, 39)';
/** The same underline on the dark frame: the sidebar, and from 1024px the Work menu that grows out of it. */
export const SELECTED_ON_FRAME = 'rgb(244, 241, 234)';
export const NONE = 'rgba(0, 0, 0, 0)';
