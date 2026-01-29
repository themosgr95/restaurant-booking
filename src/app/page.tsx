import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="font-semibold">BookingSaaS</div>
          <Link
            href="/staff"
            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800"
          >
            Staff Login
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">
          HELLO THEMOS – NEW HOMEPAGE ✅
        </h1>
        <p className="mt-3 text-neutral-600">
          If you can see this after deploy, Hostinger is building the right repo + file.
        </p>
      </section>
    </main>
  );
}
