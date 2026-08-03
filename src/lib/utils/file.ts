// src/lib/utils/file.ts

export function base64ToFile(base64String: string, filename: string): File {
  // 1. Extract mime type dynamically (e.g. "image/png", "image/jpeg", "image/webp")
  const mimeMatch = base64String.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  // 2. Map mime type to file extension
  const extension = mimeType.split('/')[1] || 'jpg';
  
  // 3. Ensure filename has the correct extension
  const cleanFilename = filename.includes('.') 
    ? filename.replace(/\.[^/.]+$/, `.${extension}`)
    : `${filename}.${extension}`;

  // 4. Decode base64 string
  const base64Data = base64String.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);

  // 5. Return File object with correct dynamic type
  return new File([byteArray], cleanFilename, { type: mimeType });
}