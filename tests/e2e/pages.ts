// Every page on the site, by locale-neutral path. Extend as pages are added.
export const FIRST_WORK = '/works/placeholder-1/';

export const neutralPaths = ['/', '/postcards/', '/about/', FIRST_WORK];

export const allPages = [...neutralPaths, ...neutralPaths.map((p) => `/zh${p}`)];
