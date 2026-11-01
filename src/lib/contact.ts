/**
 * Formspree form that forwards the contact form to Yunya's inbox (SPEC 5.5). The ID is not a secret: it is in the
 * page's HTML either way, and the inbox it forwards to lives only in Formspree. To switch forms, use the ID from
 * https://formspree.io/forms (the last part of the form's endpoint, https://formspree.io/f/<ID>).
 */
export const FORMSPREE_FORM_ID = 'mrppykoe';

export function formEndpoint(id: string = FORMSPREE_FORM_ID): string {
  if (!/^[A-Za-z0-9]+$/.test(id)) throw new Error(`Formspree form ID must be letters and digits: "${id}"`);
  return `https://formspree.io/f/${id}`;
}

/** Subject line of the email Formspree sends, so messages from the site are easy to spot in the inbox. */
export const EMAIL_SUBJECT = 'New message from Yours, Yunya';
