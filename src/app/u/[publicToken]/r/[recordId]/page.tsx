import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { formatDate, formatDateTime, formatFileSize } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: { publicToken: string; recordId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
    select: { name: true },
  });
  return {
    title: unit ? `Registrering – ${unit.name} | ElDok` : "ElDok",
  };
}

export default async function CustomerRecordDetailPage({ params }: Props) {
  const unit = await prisma.unit.findUnique({
    where: { publicToken: params.publicToken },
  });

  if (!unit) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="card max-w-md w-full p-8 text-center">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">
            Link udløbet
          </h1>
          <p className="text-neutral-500 text-sm">
            Dette QR-link er ikke længere gyldigt.
          </p>
        </div>
      </div>
    );
  }

  const record = await prisma.record.findFirst({
    where: {
      id: params.recordId,
      unitId: unit.id,
      deletedAt: null,
    },
    include: {
      createdBy: { select: { name: true, company: true } },
      updatedBy: { select: { name: true } },
      attachments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!record) notFound();

  const images = record.attachments.filter((a) => a.type === "IMAGE");
  const files = record.attachments.filter((a) => a.type === "FILE");

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href={`/u/${params.publicToken}`}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
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
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            <span className="hidden sm:inline">{unit.name}</span>
            <span className="sm:hidden">Tilbage</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex items-center justify-center w-7 h-7 bg-primary-500 rounded-md">
              <svg
                className="w-4 h-4 text-white"
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
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {/* Title */}
        <div className="card p-6 mb-4">
          <span className="badge-green text-xs mb-3 inline-block">
            Elektrisk arbejde
          </span>
          <h1 className="text-xl font-bold text-neutral-900 mb-4">
            {record.title}
          </h1>

          {/* Meta info */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
                Udførelses dato
              </dt>
              <dd className="font-medium text-neutral-800">
                {formatDate(record.workAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
                Udført af
              </dt>
              <dd className="font-medium text-neutral-800">
                {record.createdBy.company
                  ? `${record.createdBy.name}, ${record.createdBy.company}`
                  : record.createdBy.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
                Registreret
              </dt>
              <dd className="text-neutral-600">
                {formatDateTime(record.createdAt)}
              </dd>
            </div>
            {record.updatedBy && (
              <div>
                <dt className="text-xs text-neutral-400 font-medium uppercase tracking-wide mb-1">
                  Sidst opdateret af
                </dt>
                <dd className="text-neutral-600">
                  {record.updatedBy.name} ·{" "}
                  {formatDateTime(record.updatedAt)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Description */}
        <div className="card p-6 mb-4">
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Beskrivelse
          </h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-neutral-800 leading-relaxed whitespace-pre-wrap">
              {record.description}
            </p>
          </div>
        </div>

        {/* Images */}
        {images.length > 0 && (
          <div className="card p-6 mb-4">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Billeder ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <a
                  key={img.id}
                  href={`/api/files/${img.storedAs}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 hover:opacity-90 transition-opacity group"
                >
                  <img
                    src={`/api/files/${img.storedAs}`}
                    alt={img.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                      />
                    </svg>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{img.filename}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Dokumenter ({files.length})
            </h2>
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.id}>
                  <a
                    href={`/api/files/${file.storedAs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.filename}
                    className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-800 truncate">
                        {file.filename}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatFileSize(file.sizeBytes)}
                      </p>
                    </div>
                    <svg
                      className="w-4 h-4 text-neutral-400 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {record.attachments.length === 0 && (
          <div className="card p-6 text-center text-sm text-neutral-400">
            Ingen vedhæftede filer
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-neutral-400">
        Dokumentation leveret af ElDok
      </footer>
    </div>
  );
}
