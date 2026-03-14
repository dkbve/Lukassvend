"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDateTimeInput, formatFileSize, cn } from "@/lib/utils";

interface ExistingAttachment {
  id: string;
  type: "IMAGE" | "FILE";
  filename: string;
  storedAs: string;
  sizeBytes: number;
}

interface Props {
  unitId: string;
  recordId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialWorkAt?: string;
  initialAttachments?: ExistingAttachment[];
  mode: "create" | "edit";
}

const ACCEPTED_FILE_TYPES =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export default function RecordForm({
  unitId,
  recordId,
  initialTitle = "",
  initialDescription = "",
  initialWorkAt,
  initialAttachments = [],
  mode,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [workAt, setWorkAt] = useState(
    initialWorkAt ?? formatDateTimeInput(new Date())
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] =
    useState<ExistingAttachment[]>(initialAttachments);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    const valid = arr.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        alert(`Filen "${f.name}" er for stor (maks. 10 MB)`);
        return false;
      }
      return true;
    });
    setNewFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  }, []);

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingAttachment(id: string) {
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
    setRemovedAttachmentIds((prev) => [...prev, id]);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2)
      errs.title = "Titel skal være mindst 2 tegn";
    if (!description.trim() || description.trim().length < 10)
      errs.description = "Beskrivelse skal være mindst 10 tegn";
    if (!workAt) errs.workAt = "Arbejdsdato er påkrævet";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("workAt", workAt);

      for (const file of newFiles) {
        formData.append("files", file);
      }

      if (mode === "edit") {
        for (const id of removedAttachmentIds) {
          formData.append("removeAttachmentIds", id);
        }
      }

      const url =
        mode === "create"
          ? `/api/units/${unitId}/records`
          : `/api/units/${unitId}/records/${recordId}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Der opstod en fejl – prøv igen");
        return;
      }

      router.push(`/app/units/${unitId}`);
      router.refresh();
    } catch {
      setError("Netværksfejl – tjek din forbindelse og prøv igen");
    } finally {
      setSubmitting(false);
    }
  }

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label">
          Titel <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={cn("input", fieldErrors.title && "input-error")}
          placeholder="f.eks. Udskiftning af sikringstavle"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" }));
          }}
          maxLength={200}
          disabled={submitting}
        />
        {fieldErrors.title && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
        )}
      </div>

      {/* Work date */}
      <div>
        <label className="label">
          Udførelses dato og tid <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          className={cn("input", fieldErrors.workAt && "input-error")}
          value={workAt}
          onChange={(e) => setWorkAt(e.target.value)}
          disabled={submitting}
        />
        {fieldErrors.workAt && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.workAt}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="label">
          Beskrivelse <span className="text-red-500">*</span>
        </label>
        <textarea
          className={cn(
            "input resize-none",
            fieldErrors.description && "input-error"
          )}
          placeholder="Beskriv det udførte arbejde i detaljer, herunder materialer brugt, metoder og eventuelle observationer..."
          rows={6}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description)
              setFieldErrors((p) => ({ ...p, description: "" }));
          }}
          maxLength={5000}
          disabled={submitting}
        />
        <div className="flex items-center justify-between mt-1">
          {fieldErrors.description ? (
            <p className="text-xs text-red-600">{fieldErrors.description}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-neutral-400 ml-auto">
            {description.length}/5000
          </p>
        </div>
      </div>

      {/* Existing attachments (edit mode) */}
      {existingAttachments.length > 0 && (
        <div>
          <label className="label">Eksisterende filer</label>
          <div className="space-y-2">
            {existingAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50"
              >
                {att.type === "IMAGE" ? (
                  <div className="w-10 h-10 rounded-md border border-neutral-200 overflow-hidden flex-shrink-0 bg-neutral-100">
                    <img
                      src={`/api/files/${att.storedAs}`}
                      alt={att.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md border border-neutral-200 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-neutral-400"
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
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {att.filename}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {formatFileSize(att.sizeBytes)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeExistingAttachment(att.id)}
                  className="btn-ghost btn-sm text-neutral-400 hover:text-red-600 flex-shrink-0"
                  title="Fjern fil"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File upload */}
      <div>
        <label className="label">
          Vedhæft filer{" "}
          <span className="text-neutral-400 font-normal">(valgfri)</span>
        </label>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            dragOver
              ? "border-primary-400 bg-primary-50"
              : "border-neutral-200 hover:border-primary-300 hover:bg-neutral-50"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                dragOver ? "bg-primary-100" : "bg-neutral-100"
              )}
            >
              <svg
                className={cn(
                  "w-5 h-5",
                  dragOver ? "text-primary-600" : "text-neutral-400"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-700">
                {dragOver ? "Slip filerne her" : "Træk og slip filer her"}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                eller{" "}
                <span className="text-primary-600 font-medium">
                  vælg fra enheden
                </span>
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              JPG, PNG, PDF, DOC, XLS · Maks. 10 MB pr. fil
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* New file previews */}
        {newFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {newFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 bg-neutral-50"
              >
                {isImage(file) ? (
                  <div className="w-10 h-10 rounded-md border border-neutral-200 overflow-hidden flex-shrink-0 bg-neutral-100">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-md border border-neutral-200 bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-neutral-400"
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
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <span className="badge-green text-xs flex-shrink-0">Ny</span>
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="btn-ghost btn-sm text-neutral-400 hover:text-red-600 flex-shrink-0"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary btn-lg flex-1 sm:flex-none"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {mode === "create" ? "Opretter..." : "Gemmer..."}
            </>
          ) : mode === "create" ? (
            "Opret registrering"
          ) : (
            "Gem ændringer"
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/app/units/${unitId}`)}
          disabled={submitting}
          className="btn-secondary btn-lg"
        >
          Annuller
        </button>
      </div>
    </form>
  );
}
