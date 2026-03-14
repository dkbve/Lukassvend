import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4">
      <div className="card max-w-md w-full p-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-lg font-semibold text-neutral-700 mb-2">
          Side ikke fundet
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Den side, du leder efter, eksisterer ikke eller er blevet flyttet.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Gå til forsiden
          </Link>
          <Link href="/app/units" className="btn-secondary">
            Installateur-panel
          </Link>
        </div>
      </div>
    </div>
  );
}
