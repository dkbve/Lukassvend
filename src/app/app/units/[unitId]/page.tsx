import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import QRCodeDisplay from "@/components/installer/QRCodeDisplay";
import RecordsList from "@/components/installer/RecordsList";
import type { Metadata } from "next";

interface Props {
  params: { unitId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
    select: { name: true },
  });
  return { title: unit ? `${unit.name} – ElDok` : "Enhed – ElDok" };
}

export default async function UnitDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
  });

  if (!unit) notFound();

  const records = await prisma.record.findMany({
    where: { unitId: unit.id },
    orderBy: { workAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, company: true } },
      updatedBy: { select: { id: true, name: true } },
      deletedBy: { select: { id: true, name: true } },
      attachments: {
        select: { id: true, type: true, filename: true, storedAs: true },
      },
    },
  });

  const serialized = records.map((r) => ({
    ...r,
    workAt: r.workAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    deletedAt: r.deletedAt?.toISOString() ?? null,
    attachments: r.attachments.map((a) => ({
      ...a,
      type: a.type as "IMAGE" | "FILE",
    })),
  }));

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5">
        <Link
          href="/app/units"
          className="hover:text-neutral-900 transition-colors"
        >
          Enheder
        </Link>
        <svg
          className="w-4 h-4 text-neutral-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
        <span className="text-neutral-900 font-medium truncate">{unit.name}</span>
      </nav>

      {/* Unit header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{unit.name}</h1>
          {unit.address && (
            <p className="text-neutral-500 text-sm mt-1 flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {unit.address}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/app/units/${unit.id}/audit`}
            className="btn-ghost btn-sm text-neutral-500"
            title="Revisionslog"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <span className="hidden sm:inline">Log</span>
          </Link>
          <Link
            href={`/app/units/${unit.id}/new`}
            className="btn-primary flex-shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Ny registrering
          </Link>
        </div>
      </div>

      {/* QR Code section */}
      <div className="mb-6">
        <QRCodeDisplay
          unitId={unit.id}
          publicToken={unit.publicToken}
          unitName={unit.name}
        />
      </div>

      {/* Records list */}
      <RecordsList records={serialized} unitId={unit.id} />
    </div>
  );
}
