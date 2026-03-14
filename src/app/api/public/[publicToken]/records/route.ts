import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";

// GET /api/public/:publicToken/records - list records for a unit (public, no auth)
export async function GET(
  _request: Request,
  { params }: { params: { publicToken: string } }
) {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
  });

  if (!unit) return apiError("Linket er udløbet eller ugyldigt", 404);

  const records = await prisma.record.findMany({
    where: {
      unitId: unit.id,
      deletedAt: null,
    },
    orderBy: { workAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      workAt: true,
      createdAt: true,
      createdBy: {
        select: { name: true, company: true },
      },
      _count: {
        select: { attachments: true },
      },
    },
  });

  return apiOk(records);
}
