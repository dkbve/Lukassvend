import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";
import { updateUnitSchema } from "@/lib/validations";

// GET /api/units/:unitId
export async function GET(
  _request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
    include: {
      _count: {
        select: { records: { where: { deletedAt: null } } },
      },
    },
  });

  if (!unit) return apiError("Enhed ikke fundet", 404);
  return apiOk(unit);
}

// PATCH /api/units/:unitId
export async function PATCH(
  request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Ugyldigt request body", 400);
  }

  const parsed = updateUnitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.errors.map((e) => e.message).join(", "),
      422
    );
  }

  const unit = await prisma.unit.findUnique({ where: { id: params.unitId } });
  if (!unit) return apiError("Enhed ikke fundet", 404);

  const updated = await prisma.unit.update({
    where: { id: params.unitId },
    data: parsed.data,
  });

  return apiOk(updated);
}

// DELETE /api/units/:unitId
export async function DELETE(
  _request: Request,
  { params }: { params: { unitId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const unit = await prisma.unit.findUnique({ where: { id: params.unitId } });
  if (!unit) return apiError("Enhed ikke fundet", 404);

  await prisma.unit.delete({ where: { id: params.unitId } });

  return apiOk({ message: "Enhed slettet" });
}
