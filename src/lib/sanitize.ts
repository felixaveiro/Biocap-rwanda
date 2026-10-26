// src/lib/sanitize.ts

import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes rich-text HTML coming from the editor before it is rendered with
 * dangerouslySetInnerHTML. Works on the server and in the browser.
 * Keeps the formatting the editor produces (bold, underline, colour, spans, links).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["target"],
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"],
  });
}
