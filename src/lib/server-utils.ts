// Server-only utilities – uses Node.js built-ins (fs, path).
// Never import this file from client components.
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
];

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_FILE_SIZE = parseInt(
  process.env.MAX_FILE_SIZE ?? "10485760"
); // 10 MB

export const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export async function ensureUploadsDir(): Promise<void> {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function saveUploadedFile(file: File): Promise<{
  storedAs: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  type: "IMAGE" | "FILE";
}> {
  await ensureUploadsDir();

  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();
  const storedAs = `${uuidv4()}${ext}`;
  const filepath = path.join(UPLOADS_DIR, storedAs);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return {
    storedAs,
    filename: originalName,
    mimeType: file.type,
    sizeBytes: file.size,
    type: ALLOWED_IMAGE_TYPES.includes(file.type) ? "IMAGE" : "FILE",
  };
}

export async function deleteUploadedFile(storedAs: string): Promise<void> {
  const safeName = path.basename(storedAs);
  const filepath = path.join(UPLOADS_DIR, safeName);
  try {
    await fs.unlink(filepath);
  } catch {
    // File may already be gone – ignore
  }
}
