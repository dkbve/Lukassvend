"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

interface Attachment {
  id: string;
  type: string;
  filename: string;
  storedAs: string;
}

interface Record {
  id: string;
  title: string;
  description: string;
  workAt: string;
  createdAt: string;
  deletedAt: string | null;
  createdBy: { name: string; company: string | null };
  updatedBy: { name: string } | null;
  deletedBy: { name: string } | null;
  attachments: Attachment[];
}

interface Props {
  records: Record[];
  unitId: string;
  showDeleted?: boolean;
}

export default function RecordsList({ records: initialRecords, unitId, showDeleted = false }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showDeletedRecords, setShowDeletedRecords] = useState(showDeleted);

  const visible = records.filter((r) =>
    showDeletedRecords ? true : !r.deletedAt
  );

  const deletedCount = records.filter((r) => r.deletedAt).length;

  async function handleDelete(recordId: string) {
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/units/${unitId}/records/${recordId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === recordId
              ? { ...r, deletedAt: new Date().toISOString() }
              : r
          )
        );
        setConfirmDeleteId(null);
      } else {
        const data = await res.json();
        alert(data.error ?? "Fejl ved sletning");
      }
    } catch {
      alert("Netværksfejl – prøv igen");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-neutral-900">
            Registreringer
          </h2>
          <span className="badge-green text-xs">
            {visible.filter((r) => !r.deletedAt).length} aktive
          </span>
          {deletedCount > 0 && (
            <button
              onClick={() => setShowDeletedRecords(!showDeletedRecords)}
              className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              {showDeletedRecords
                ? "Skjul slettede"
                : `Vis ${deletedCount} slettede`}
            </button>
          )}
        </div>
        <Link href={`/app/units/${unitId}/new`} className="btn-primary btn-sm">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
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

      {/* List */}
      {visible.length === 0 ? (
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
              />
            </svg>
          </div>
          <p className="text-neutral-500 mb-3 text-sm">
            Ingen registreringer endnu
          </p>
          <Link href={`/app/units/${unitId}/new`} className="btn-primary btn-sm">
            Opret første registrering
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((record) => {
            const isDeleted = !!record.deletedAt;
            const isConfirming = confirmDeleteId === record.id;
            const isDeleting = deletingId === record.id;

            return (
              <div
                key={record.id}
                className={cn(
                  "card p-5",
                  isDeleted && "opacity-60 bg-neutral-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-neutral-900 truncate">
                        {record.title}
                      </h3>
                      {isDeleted && (
                        <span className="badge-red text-xs flex-shrink-0">
                          Slettet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                      {record.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-400">
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
                        Arbejde: {formatDate(record.workAt)}
                      </span>
                      <span>
                        Oprettet af {record.createdBy.name}
                        {record.createdBy.company &&
                          ` · ${record.createdBy.company}`}
                      </span>
                      {record.updatedBy && (
                        <span>
                          Opdateret af {record.updatedBy.name}
                        </span>
                      )}
                      {record.deletedBy && (
                        <span className="text-red-400">
                          Slettet af {record.deletedBy.name}
                        </span>
                      )}
                      {record.attachments.length > 0 && (
                        <span className="text-primary-600 flex items-center gap-1">
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
                          {record.attachments.length}{" "}
                          {record.attachments.length === 1 ? "fil" : "filer"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!isDeleted && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link
                        href={`/app/units/${unitId}/r/${record.id}/edit`}
                        className="btn-secondary btn-sm"
                      >
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
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                        <span className="hidden sm:inline">Rediger</span>
                      </Link>

                      {!isConfirming ? (
                        <button
                          onClick={() => setConfirmDeleteId(record.id)}
                          className="btn-ghost btn-sm text-neutral-400 hover:text-red-600"
                          title="Slet"
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
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDelete(record.id)}
                            disabled={isDeleting}
                            className="btn-danger btn-sm"
                          >
                            {isDeleting ? "Sletter..." : "Bekræft sletning"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="btn-ghost btn-sm"
                          >
                            Annuller
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Thumbnail previews */}
                {record.attachments.filter((a) => a.type === "IMAGE").length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {record.attachments
                      .filter((a) => a.type === "IMAGE")
                      .slice(0, 5)
                      .map((att) => (
                        <a
                          key={att.id}
                          href={`/api/files/${att.storedAs}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 w-16 h-16 rounded-lg border border-neutral-200 bg-neutral-100 overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={`/api/files/${att.storedAs}`}
                            alt={att.filename}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
