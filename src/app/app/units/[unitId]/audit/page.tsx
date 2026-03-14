import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: { unitId: string };
}

export const metadata: Metadata = {
  title: "Revisionslog – ElDok",
};

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Oprettet", color: "badge-green" },
  UPDATE: { label: "Opdateret", color: "badge-blue" },
  DELETE: { label: "Slettet", color: "badge-red" },
};

export default async function AuditLogPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const unit = await prisma.unit.findUnique({
    where: { id: params.unitId },
    select: { id: true, name: true },
  });

  if (!unit) notFound();

  const logs = await prisma.auditLog.findMany({
    where: { unitId: params.unitId },
    orderBy: { timestamp: "desc" },
    take: 200,
    include: {
      installer: { select: { name: true, company: true } },
      record: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="max-w-4xl">
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
          className="hover:text-neutral-900 transition-colors"
        >
          {unit.name}
        </Link>
        <svg className="w-4 h-4 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-neutral-900 font-medium">Revisionslog</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Revisionslog</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Alle ændringer for {unit.name}
          </p>
        </div>
        <Link href={`/app/units/${unit.id}`} className="btn-secondary btn-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Tilbage
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="card p-8 text-center text-sm text-neutral-500">
          Ingen hændelser registreret endnu
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Tidspunkt
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Handling
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Registrering
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                    Installateur
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden lg:table-cell">
                    Detaljer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {logs.map((log) => {
                  const actionMeta = ACTION_LABELS[log.action] ?? {
                    label: log.action,
                    color: "badge-gray",
                  };
                  let diffSummary = "";
                  if (log.diffJson) {
                    try {
                      const diff = JSON.parse(log.diffJson);
                      diffSummary = Object.keys(diff)
                        .map((k) => {
                          const fieldNames: Record<string, string> = {
                            title: "Titel",
                            description: "Beskrivelse",
                            workAt: "Dato",
                            removedAttachments: "Fjernede filer",
                            addedAttachments: "Tilføjede filer",
                          };
                          return fieldNames[k] ?? k;
                        })
                        .join(", ");
                    } catch {
                      diffSummary = "";
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 text-neutral-600 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={actionMeta.color}>
                          {actionMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {log.record ? (
                          <span className="text-neutral-700 truncate block">
                            {log.record.title}
                          </span>
                        ) : (
                          <span className="text-neutral-400 italic">
                            Slettet
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-neutral-700">
                          {log.installer.name}
                        </span>
                        {log.installer.company && (
                          <span className="text-neutral-400 text-xs block">
                            {log.installer.company}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                        {diffSummary || "–"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400 mt-3 text-center">
        Viser op til 200 seneste hændelser · Revisionsloggen er append-only og kan ikke ændres
      </p>
    </div>
  );
}
