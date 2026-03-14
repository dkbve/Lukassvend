import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

// POST /api/units/:unitId/regenerate-token
export async function POST(
  _request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const unit = await prisma.unit.findUnique({ where: { id: params.unitId } });
  if (!unit) return apiError("Enhed ikke fundet", 404);

  const newToken = uuidv4();

  const updated = await prisma.unit.update({
    where: { id: params.unitId },
    data: { publicToken: newToken },
  });

  return apiOk({ publicToken: updated.publicToken });
}
