// src/lib/utils/file.ts

export function base64ToFile(base64String: string, filename: string): File {
  // Safe environment check for Next.js SSR
  if (typeof window === "undefined") {
    throw new Error("base64ToFile can only be executed in a browser environment.");
  }

  if (!base64String || typeof base64String !== "string") {
    console.error("base64ToFile received an empty or non-string input");
    return new File([""], filename, { type: "image/jpeg" });
  }

  try {
    // 1. Extract mime type dynamically (e.g. "image/png", "image/jpeg", "image/webp")
    const mimeMatch = base64String.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    // 2. Map mime type to file extension
    const extension = mimeType.split("/")[1]?.replace("+xml", "") || "jpg";

    // 3. Ensure filename has the correct extension
    const cleanFilename = filename.includes(".")
      ? filename.replace(/\.[^/.]+$/, `.${extension}`)
      : `${filename}.${extension}`;

    // 4. Safely extract raw Base64 characters (handles headers or raw strings)
    const base64Data = base64String.includes(",")
      ? base64String.split(",")[1].trim()
      : base64String.trim();

    // Clean whitespace/newlines that break atob
    const cleanBase64 = base64Data.replace(/[\n\r\s]/g, "");

    // Decode Base64 string
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // 5. Return valid File object instance
    return new File([byteArray], cleanFilename, { type: mimeType });
  } catch (error) {
    console.error("Failed to convert Base64 string to File object:", error);
    // Return a valid fallback File object so the upload payload never receives null/undefined
    return new File(["dummy"], filename, { type: "image/jpeg" });
  }
}

/**
 * 🟢 Automatically transforms Cloudinary URLs on the fly to auto-compress quality
 * and convert format to WebP/AVIF without changing backend data or re-uploading files.
 */
export function getOptimizedImageUrl(url?: string, targetWidth = 1000): string {
  if (!url || typeof url !== "string") return "";

  // Return base64 strings or non-Cloudinary image URLs as-is
  if (!url.includes("res.cloudinary.com")) return url;

  // If already contains Cloudinary auto-format/auto-quality flags, return as-is
  if (url.includes("/f_auto,q_auto")) return url;

  // Inject dynamic Cloudinary optimization parameters
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${targetWidth}/`);
}