import Link from "next/link";
import prisma from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: { publicToken: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
    select: { name: true },
  });

  if (!unit) {
    return { title: "Link udløbet – ElDok" };
  }

  return {
    title: `${unit.name} – Elektrisk dokumentation | ElDok`,
    description: `Se dokumentation for elektrisk arbejde på ${unit.name}`,
  };
}

export default async function CustomerUnitPage({ params }: Props) {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
  });

  if (!unit) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">
            Link udløbet
          </h1>
          <p className="text-neutral-500 text-sm">
            Dette QR-link er ikke længere gyldigt. Kontakt din elektriker for et
            opdateret link.
          </p>
        </div>
      </div>
    );
  }

  const records = await prisma.record.findMany({
    where: { unitId: unit.id, deletedAt: null },
    orderBy: { workAt: "desc" },
    include: {
      createdBy: { select: { name: true, company: true } },
      _count: { select: { attachments: true } },
    },
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-9 h-9 bg-primary-500 rounded-lg flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
              Elektrisk dokumentation
            </p>
            <h1 className="text-base font-semibold text-neutral-900 truncate">
              {unit.name}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Unit info */}
        {unit.address && (
          <div className="card p-4 mb-5 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-0.5"
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
            <div>
              <p className="text-xs text-neutral-500 mb-0.5">Adresse</p>
              <p className="text-sm font-medium text-neutral-800">
                {unit.address}
              </p>
            </div>
          </div>
        )}

        {/* Records heading */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Elektrisk arbejde
          </h2>
          <span className="badge-gray text-xs">
            {records.length}{" "}
            {records.length === 1 ? "registrering" : "registreringer"}
          </span>
        </div>

        {/* Records list */}
        {records.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-full mb-3">
              <svg
                className="w-6 h-6 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                />
              </svg>
            </div>
            <p className="text-sm text-neutral-500">
              Ingen registreringer endnu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <Link
                key={record.id}
                href={`/u/${params.publicToken}/r/${record.id}`}
                className="card-hover block p-5 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors truncate">
                      {record.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                      {record.description}
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 flex-shrink-0 mt-0.5 transition-colors"
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
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5"
                      />
                    </svg>
                    {formatDate(record.workAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    {record.createdBy.company
                      ? `${record.createdBy.name} · ${record.createdBy.company}`
                      : record.createdBy.name}
                  </span>
                  {record._count.attachments > 0 && (
                    <span className="flex items-center gap-1 text-primary-600">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                        />
                      </svg>
                      {record._count.attachments}{" "}
                      {record._count.attachments === 1 ? "fil" : "filer"}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-neutral-400">
        Dokumentation leveret af ElDok
      </footer>
    </div>
  );
}
