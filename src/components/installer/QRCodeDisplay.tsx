"use client";

import { useState, useEffect, useRef } from "react";

interface Props {
  unitId: string;
  publicToken: string;
  unitName: string;
}

export default function QRCodeDisplay({ unitId, publicToken, unitName }: Props) {
  const [token, setToken] = useState(publicToken);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegen, setConfirmRegen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const customerUrl = `${appUrl}/u/${token}`;

  // Generate QR code client-side using the qrcode library
  useEffect(() => {
    let cancelled = false;
    const QR_OPTS = {
      width: 256,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
      errorCorrectionLevel: "M" as const,
    };

    import("qrcode").then(async (mod) => {
      // The qrcode package is CommonJS; bundlers expose it on .default
      const toDataURL: (text: string, opts: object) => Promise<string> =
        (mod as unknown as { default: { toDataURL: typeof toDataURL } }).default
          ?.toDataURL ??
        (mod as unknown as { toDataURL: typeof toDataURL }).toDataURL;

      const url = await toDataURL(customerUrl, QR_OPTS);
      if (!cancelled) setQrDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [customerUrl]);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/units/${unitId}/regenerate-token`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.publicToken);
        setConfirmRegen(false);
      } else {
        alert(data.error ?? "Fejl ved fornyelse");
      }
    } catch {
      alert("Netværksfejl – prøv igen");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      prompt("Kopiér linket:", customerUrl);
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `qr-${unitName.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !qrDataUrl) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-kode – ${unitName}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
            img { width: 200px; height: 200px; }
            h1 { font-size: 18px; font-weight: 600; margin: 16px 0 4px; }
            p { font-size: 12px; color: #64748b; margin: 0; }
            .url { font-size: 11px; color: #94a3b8; margin-top: 12px; word-break: break-all; max-width: 240px; text-align: center; }
          </style>
        </head>
        <body>
          <img src="${qrDataUrl}" alt="QR-kode" />
          <h1>${unitName}</h1>
          <p>Scan for at se elektrisk dokumentation</p>
          <p class="url">${customerUrl}</p>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-neutral-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-neutral-900">QR-kode</p>
            <p className="text-xs text-neutral-500">Kunde-link og QR-kode</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-neutral-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-neutral-100 p-5">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* QR image */}
            <div className="flex-shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR-kode"
                  className="w-40 h-40 rounded-xl border border-neutral-200"
                />
              ) : (
                <div className="w-40 h-40 rounded-xl border border-neutral-200 bg-neutral-100 animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* URL */}
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5">
                Kunde-URL
              </p>
              <div className="flex items-center gap-2 mb-4">
                <code className="text-xs bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 flex-1 truncate text-neutral-700 font-mono">
                  {customerUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="btn-secondary btn-sm flex-shrink-0"
                  title="Kopiér link"
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
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
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={handleDownload} className="btn-secondary btn-sm">
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                    />
                  </svg>
                  Download PNG
                </button>
                <button onClick={handlePrint} className="btn-secondary btn-sm">
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
                      d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
                    />
                  </svg>
                  Udskriv
                </button>
              </div>

              {/* Regenerate */}
              {!confirmRegen ? (
                <button
                  onClick={() => setConfirmRegen(true)}
                  className="text-xs text-neutral-500 hover:text-red-600 transition-colors flex items-center gap-1"
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
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Forny QR-kode (ugyldiggør gammelt link)
                </button>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800 mb-2 font-medium">
                    Advarsel: Det gamle QR-link vil blive ugyldigt!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      className="btn-danger btn-sm"
                    >
                      {regenerating ? "Fornyer..." : "Bekræft fornyelse"}
                    </button>
                    <button
                      onClick={() => setConfirmRegen(false)}
                      className="btn-secondary btn-sm"
                    >
                      Annuller
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
