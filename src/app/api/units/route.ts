import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { apiError, apiOk } from "@/lib/utils";
import { createUnitSchema } from "@/lib/validations";

// GET /api/units - list all units (installer)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  const units = await prisma.unit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          records: {
            where: { deletedAt: null },
          },
        },
      },
    },
  });

  return apiOk(units);
}

// POST /api/units - create a unit (installer)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return apiError("Ikke autoriseret", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("Ugyldigt request body", 400);
  }

  const parsed = createUnitSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      parsed.error.errors.map((e) => e.message).join(", "),
      422
    );
  }

  const unit = await prisma.unit.create({
    data: {
      name: parsed.data.name,
      address: parsed.data.address,
    },
  });

  return apiOk(unit, 201);
}
