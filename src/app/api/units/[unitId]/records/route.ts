import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";
import {
  saveUploadedFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/server-utils";

// GET /api/units/:unitId/records
export async function GET(
  _request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const unit = await prisma.unit.findUnique({ where: { id: params.unitId } });
  if (!unit) return apiError("Enhed ikke fundet", 404);

  const records = await prisma.record.findMany({
    where: { unitId: params.unitId },
    orderBy: { workAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, company: true } },
      updatedBy: { select: { id: true, name: true } },
      deletedBy: { select: { id: true, name: true } },
      attachments: true,
    },
  });

  return apiOk(records);
}

// POST /api/units/:unitId/records - create a record (with optional file uploads)
export async function POST(
  request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const unit = await prisma.unit.findUnique({ where: { id: params.unitId } });
  if (!unit) return apiError("Enhed ikke fundet", 404);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError("Ugyldigt form data", 400);
  }

  const title = (formData.get("title") as string | null)?.trim();
  const description = (formData.get("description") as string | null)?.trim();
  const workAtRaw = formData.get("workAt") as string | null;
  const files = formData.getAll("files") as File[];

  if (!title || title.length < 2) {
    return apiError("Titel skal være mindst 2 tegn", 422);
  }
  if (!description || description.length < 10) {
    return apiError("Beskrivelse skal være mindst 10 tegn", 422);
  }

  const workAt = workAtRaw ? new Date(workAtRaw) : new Date();
  if (isNaN(workAt.getTime())) {
    return apiError("Ugyldig arbejdsdato", 422);
  }

  // Validate files
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `Filen "${file.name}" overstiger den maksimale filstørrelse på 10 MB`,
        422
      );
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return apiError(
        `Filtypen "${file.type}" er ikke tilladt for "${file.name}"`,
        422
      );
    }
  }

  // Save files
  const savedFiles = await Promise.all(
    files.filter((f) => f.size > 0).map(saveUploadedFile)
  );

  // Create record + attachments in a transaction
  const record = await prisma.$transaction(async (tx) => {
    const newRecord = await tx.record.create({
      data: {
        unitId: params.unitId,
        title,
        description,
        workAt,
        createdById: session.user.id,
        attachments: {
          create: savedFiles.map((sf) => ({
            type: sf.type,
            filename: sf.filename,
            mimeType: sf.mimeType,
            storedAs: sf.storedAs,
            sizeBytes: sf.sizeBytes,
          })),
        },
      },
      include: {
        attachments: true,
        createdBy: { select: { id: true, name: true, company: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        action: "CREATE",
        recordId: newRecord.id,
        unitId: params.unitId,
        installerId: session.user.id,
        diffJson: JSON.stringify({ title, description, workAt }),
      },
    });

    return newRecord;
  });

  return apiOk(record, 201);
}
