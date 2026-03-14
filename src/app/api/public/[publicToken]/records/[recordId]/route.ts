import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";

// GET /api/public/:publicToken/records/:recordId - record detail (public, no auth)
export async function GET(
  _request: Request,
  { params }: { params: { publicToken: string; recordId: string } }
) {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
  });

  if (!unit) return apiError("Linket er udløbet eller ugyldigt", 404);

  // Verify the record belongs to this unit (prevent enumeration)
  const record = await prisma.record.findFirst({
    where: {
      id: params.recordId,
      unitId: unit.id,
      deletedAt: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      workAt: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { name: true, company: true },
      },
      updatedBy: {
        select: { name: true },
      },
      attachments: {
        select: {
          id: true,
          type: true,
          filename: true,
          mimeType: true,
          storedAs: true,
          sizeBytes: true,
          createdAt: true,
        },
      },
    },
  });

  if (!record) return apiError("Registrering ikke fundet", 404);
  return apiOk(record);
}
