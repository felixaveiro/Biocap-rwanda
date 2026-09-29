// app/lib/utils/biocapFilename.ts
/**
 * Shared naming rule for any BioCap gallery image that gets downloaded
 * from the website (this upload modal, the public gallery page, an
 * admin export, etc). Keeping it in one place means every surface that
 * offers a "Download" button produces the exact same filename for the
 * exact same image.
 *
 * Rule:
 *   - Every download is prefixed with "BioCap".
 *   - If the image HAS a caption  -> BioCap-<slugified-caption>-<referenceId>.<ext>
 *   - If the image has NO caption -> BioCap-image-<referenceId>.<ext>
 *
 * The reference id is always appended (even on the captioned path) so
 * that two images that happen to share a caption — or share no caption
 * at all — never overwrite each other once saved to the same Downloads
 * folder.
 */

export interface BioCapFilenameParams {
  /** Optional caption the uploader typed for this specific photo. */
  caption?: string | null;
  /** Stable per-image reference id (see generateImageReferenceId). */
  referenceId: string;
  /** Original file name, only used to recover the extension. */
  originalFileName: string;
}

/** Turns a free-text caption into a safe, URL/filename-friendly slug. */
export function slugifyCaption(caption: string): string {
  return caption
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // anything not alphanumeric -> hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, 60); // keep filenames reasonable
}

/** Builds the final download filename for one gallery image. */
export function getBioCapFilename({
  caption,
  referenceId,
  originalFileName,
}: BioCapFilenameParams): string {
  const extension = originalFileName.includes('.')
    ? originalFileName.slice(originalFileName.lastIndexOf('.'))
    : '';

  const cleanCaption = caption?.trim();
  const slug = cleanCaption ? slugifyCaption(cleanCaption) : '';

  const base = slug
    ? `BioCap-${slug}-${referenceId}`
    : `BioCap-image-${referenceId}`;

  return `${base}${extension}`;
}

/**
 * Generates a short, stable reference id for a newly selected image
 * (e.g. "k3f9a1p2"). Generated client-side at selection time so it can
 * be shown in the UI, sent to the backend on submit, and reused later
 * by the gallery page for downloads/deep-links.
 */
export function generateImageReferenceId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Triggers a browser download of `blobUrl` saved as `filename`. */
export function triggerBrowserDownload(blobUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}