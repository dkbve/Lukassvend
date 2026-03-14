import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import RecordForm from "@/components/installer/RecordForm";
import { formatDateTimeInput } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: { unitId: string; recordId: string };
}

export const metadata: Metadata = {
  title: "Rediger registrering – ElDok",
};

export default async function EditRecordPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
    select: { id: true, name: true },
  });

  if (!unit) notFound();

  const record = await prisma.record.findFirst({
    where: {
      id: params.recordId,
      unitId: params.unitId,
      deletedAt: null,
    },
    include: {
      attachments: true,
    },
  });

  if (!record) notFound();

  const serializedAttachments = record.attachments.map((a) => ({
    id: a.id,
    type: a.type as "IMAGE" | "FILE",
    filename: a.filename,
    storedAs: a.storedAs,
    sizeBytes: a.sizeBytes,
  }));

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-5 flex-wrap">
        <Link href="/app/units" className="hover:text-neutral-900 transition-colors">
          Enheder
        </Link>
        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <Link
          href={`/app/units/${unit.id}`}
          className="hover:text-neutral-900 transition-colors truncate max-w-[120px]"
        >
          {unit.name}
        </Link>
        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-neutral-900 font-medium">Rediger</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Rediger registrering</h1>
        <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
          {record.title}
        </p>
      </div>

      {/* Audit info */}
      <div className="card p-4 mb-5 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-2 text-amber-800">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-xs">
            <span className="font-semibold">Bemærk:</span> Ændringer registreres i revisionsloggen og kan ikke fortrydes.
            Den originale registrering bevares i historikken.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <RecordForm
          unitId={unit.id}
          recordId={record.id}
          mode="edit"
          initialTitle={record.title}
          initialDescription={record.description}
          initialWorkAt={formatDateTimeInput(record.workAt)}
          initialAttachments={serializedAttachments}
        />
      </div>
    </div>
  );
}
