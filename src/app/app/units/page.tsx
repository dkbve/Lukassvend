import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import UnitsList from "@/components/installer/UnitsList";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enheder – ElDok",
};

export default async function UnitsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const units = await prisma.unit.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { records: { where: { deletedAt: null } } },
      },
    },
  });

  const serialized = units.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
  }));

  return <UnitsList units={serialized} />;
}
