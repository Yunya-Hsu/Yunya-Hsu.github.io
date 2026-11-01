import { describe, expect, it } from 'vitest';
import { FORMSPREE_FORM_ID, formEndpoint } from '../../src/lib/contact';
import { intro } from '../../src/i18n/contact';

describe('contact form endpoint', () => {
  it('posts to the Formspree form', () => {
    expect(formEndpoint('xyzabcde')).toBe('https://formspree.io/f/xyzabcde');
    expect(formEndpoint()).toBe(`https://formspree.io/f/${FORMSPREE_FORM_ID}`);
  });

  it('rejects an ID that would break the URL, such as a pasted endpoint', () => {
    expect(() => formEndpoint('https://formspree.io/f/xyzabcde')).toThrow(/letters and digits/);
    expect(() => formEndpoint('')).toThrow();
  });
});

describe('contact intro', () => {
  it('lists the same kinds of work in every language', () => {
    const counts = Object.values(intro).map((text) => text.openTo.length);
    expect(new Set(counts).size).toBe(1);
  });
});
