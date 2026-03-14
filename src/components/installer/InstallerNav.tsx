"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function InstallerNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut({ redirect: false });
    router.push("/login");
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/app/units"
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 bg-primary-500 rounded-lg">
              <svg
                className="w-4.5 h-4.5 text-white"
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
            <span className="font-semibold text-neutral-900 text-sm">
              ElDok
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            <Link
              href="/app/units"
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive("/app/units")
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              )}
            >
              Enheder
            </Link>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-neutral-900 leading-none">
                {session?.user?.name}
              </p>
              {session?.user?.company && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  {session.user.company}
                </p>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">
                {session?.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="btn-ghost btn-sm hidden sm:flex items-center gap-1.5 text-neutral-500"
              title="Log ud"
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
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              <span className="hidden md:inline">Log ud</span>
            </button>

            {/* Mobile menu button */}
            <button
              className="sm:hidden btn-ghost p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    mobileOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                  }
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1">
          <div className="pb-2 mb-2 border-b border-neutral-100">
            <p className="text-sm font-medium text-neutral-900">
              {session?.user?.name}
            </p>
            {session?.user?.company && (
              <p className="text-xs text-neutral-500">{session.user.company}</p>
            )}
          </div>
          <Link
            href="/app/units"
            className={cn(
              "block px-3 py-2.5 rounded-lg text-sm font-medium",
              isActive("/app/units")
                ? "bg-primary-50 text-primary-700"
                : "text-neutral-700"
            )}
            onClick={() => setMobileOpen(false)}
          >
            Enheder
          </Link>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 rounded-lg flex items-center gap-2"
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
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Log ud
          </button>
        </div>
      )}
    </nav>
  );
}
