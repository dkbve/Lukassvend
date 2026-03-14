"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">
          Der opstod en fejl
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Noget gik galt. Prøv at genindlæse siden eller kontakt support.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mb-4 text-left text-xs bg-neutral-100 rounded-lg p-3 overflow-auto max-h-32 text-red-700">
            {error.message}
          </pre>
        )}
        <button onClick={reset} className="btn-primary">
          Prøv igen
        </button>
      </div>
    </div>
  );
}
