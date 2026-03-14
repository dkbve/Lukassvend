import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import RecordForm from "@/components/installer/RecordForm";
import type { Metadata } from "next";

interface Props {
  params: { unitId: string };
}

export const metadata: Metadata = {
  title: "Ny registrering – ElDok",
};

export default async function NewRecordPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
    select: { id: true, name: true },
  });

  if (!unit) notFound();

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5">
        <Link href="/app/units" className="hover:text-neutral-900 transition-colors">
          Enheder
        </Link>
        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link
          href={`/app/units/${unit.id}`}
          className="hover:text-neutral-900 transition-colors truncate max-w-[150px]"
        >
          {unit.name}
        </Link>
        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-neutral-900 font-medium">Ny registrering</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Ny registrering</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Dokumentér det udførte elektriske arbejde på{" "}
          <span className="font-medium text-neutral-700">{unit.name}</span>
        </p>
      </div>

      <div className="card p-6">
        <RecordForm unitId={unit.id} mode="create" />
      </div>
    </div>
  );
}
