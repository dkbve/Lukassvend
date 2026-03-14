import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";

// GET /api/public/:publicToken - get unit info (public, no auth)
export async function GET(
  _request: Request,
  { params }: { params: { publicToken: string } }
) {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
    select: {
      id: true,
      name: true,
      address: true,
      createdAt: true,
      _count: {
        select: { records: { where: { deletedAt: null } } },
      },
    },
  });

  if (!unit) return apiError("Linket er udløbet eller ugyldigt", 404);
  return apiOk(unit);
}
