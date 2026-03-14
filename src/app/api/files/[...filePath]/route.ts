import path from "path";
import fs from "fs/promises";
import { UPLOADS_DIR, CONTENT_TYPES } from "@/lib/server-utils";

// GET /api/files/:filename - serve uploaded files
export async function GET(
  _request: Request,
  { params }: { params: { filePath: string[] } }
) {
  // Security: only allow a single filename segment (no directory traversal)
  const rawName = params.filePath.join("/");
  const safeName = path.basename(rawName);

  if (!safeName || safeName !== rawName.replace(/\//g, "")) {
    // filePath had multiple segments, only use basename
  }

  // Construct absolute path and ensure it stays within uploads dir
  const absolutePath = path.join(UPLOADS_DIR, safeName);
  const relative = path.relative(UPLOADS_DIR, absolutePath);

  // Reject if path tries to escape uploads dir
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(absolutePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
        "Content-Disposition": `inline; filename="${safeName}"`,
      },
    });
  } catch {
    return new Response("Fil ikke fundet", { status: 404 });
  }
}
