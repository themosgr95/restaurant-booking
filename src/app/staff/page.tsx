import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";

export default async function StaffHomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Staff Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Signed in as {session.user?.email ?? "unknown"}
      </p>
    </main>
  );
}
