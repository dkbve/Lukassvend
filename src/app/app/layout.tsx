import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SessionProvider from "@/components/providers/SessionProvider";
import InstallerNav from "@/components/installer/InstallerNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ElDok – Installateur",
};

export default async function InstallerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-neutral-50">
        <InstallerNav />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
