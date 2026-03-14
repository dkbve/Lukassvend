import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";
import {
  saveUploadedFile,
  deleteUploadedFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/server-utils";

// GET /api/units/:unitId/records/:recordId
export async function GET(
  _request: Request,
  { params }: { params: { unitId: string; recordId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const record = await prisma.record.findFirst({
    where: { id: params.recordId, unitId: params.unitId },
    include: {
      createdBy: { select: { id: true, name: true, company: true } },
      updatedBy: { select: { id: true, name: true } },
      deletedBy: { select: { id: true, name: true } },
      attachments: true,
      auditLogs: {
        include: { installer: { select: { name: true } } },
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!record) return apiError("Registrering ikke fundet", 404);
  return apiOk(record);
}

// PATCH /api/units/:unitId/records/:recordId - edit record
export async function PATCH(
  request: Request,
  { params }: { params: { unitId: string; recordId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const record = await prisma.record.findFirst({
    where: { id: params.recordId, unitId: params.unitId, deletedAt: null },
    include: { attachments: true },
  });

  if (!record) return apiError("Registrering ikke fundet", 404);

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
  const removeAttachmentIds = formData
    .getAll("removeAttachmentIds")
    .map((v) => v.toString())
    .filter(Boolean);

  if (title !== undefined && title.length < 2) {
    return apiError("Titel skal være mindst 2 tegn", 422);
  }
  if (description !== undefined && description.length < 10) {
    return apiError("Beskrivelse skal være mindst 10 tegn", 422);
  }

  const workAt = workAtRaw ? new Date(workAtRaw) : undefined;
  if (workAt && isNaN(workAt.getTime())) {
    return apiError("Ugyldig arbejdsdato", 422);
  }

  // Validate new files
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      return apiError(
        `Filen "${file.name}" overstiger den maksimale filstørrelse på 10 MB`,
        422
      );
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return apiError(`Filtypen "${file.type}" er ikke tilladt`, 422);
    }
  }

  // Save new files
  const savedFiles = await Promise.all(
    files.filter((f) => f.size > 0).map(saveUploadedFile)
  );

  // Build diff for audit log
  const diff: Record<string, unknown> = {};
  if (title && title !== record.title) diff.title = { from: record.title, to: title };
  if (description && description !== record.description)
    diff.description = { from: record.description.substring(0, 100) + "...", to: description.substring(0, 100) + "..." };
  if (workAt) diff.workAt = { from: record.workAt, to: workAt };
  if (removeAttachmentIds.length) diff.removedAttachments = removeAttachmentIds;
  if (savedFiles.length) diff.addedAttachments = savedFiles.map((f) => f.filename);

  // Verify removeAttachmentIds belong to this record
  const validRemoveIds = record.attachments
    .filter((a) => removeAttachmentIds.includes(a.id))
    .map((a) => a.id);

  const attachmentsToDelete = record.attachments.filter((a) =>
    validRemoveIds.includes(a.id)
  );

  const updated = await prisma.$transaction(async (tx) => {
    // Delete removed attachments
    if (validRemoveIds.length) {
      await tx.attachment.deleteMany({ where: { id: { in: validRemoveIds } } });
    }

    const updatedRecord = await tx.record.update({
      where: { id: params.recordId },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(workAt ? { workAt } : {}),
        updatedById: session.user.id,
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
        updatedBy: { select: { id: true, name: true } },
      },
    });

    await tx.auditLog.create({
      data: {
        action: "UPDATE",
        recordId: params.recordId,
        unitId: params.unitId,
        installerId: session.user.id,
        diffJson: JSON.stringify(diff),
      },
    });

    return updatedRecord;
  });

  // Delete files from disk (after DB transaction succeeds)
  for (const att of attachmentsToDelete) {
    await deleteUploadedFile(att.storedAs);
  }

  return apiOk(updated);
}

// DELETE /api/units/:unitId/records/:recordId - soft delete
export async function DELETE(
  _request: Request,
  { params }: { params: { unitId: string; recordId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const record = await prisma.record.findFirst({
    where: { id: params.recordId, unitId: params.unitId, deletedAt: null },
  });

  if (!record) return apiError("Registrering ikke fundet", 404);

  await prisma.$transaction(async (tx) => {
    await tx.record.update({
      where: { id: params.recordId },
      data: {
        deletedAt: new Date(),
        deletedById: session.user.id,
      },
    });

    await tx.auditLog.create({
      data: {
        action: "DELETE",
        recordId: params.recordId,
        unitId: params.unitId,
        installerId: session.user.id,
        diffJson: JSON.stringify({ title: record.title }),
      },
    });
  });

  return apiOk({ message: "Registrering slettet" });
}
