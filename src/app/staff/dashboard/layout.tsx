import Link from "next/link";
import { ReactNode } from "react";
import SignOutBtn from "./sign-out-btn";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-black text-white">
              A
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold">Argo</div>
              <div className="text-xs text-muted-foreground">OWNER DASHBOARD</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a className="text-blue-600 hover:underline" href="#" onClick={(e) => e.preventDefault()}>
              View Booking Page ↗
            </a>
            <SignOutBtn />
          </div>
        </div>

        {/* Main tabs */}
        <nav className="mx-auto max-w-6xl px-6 pb-3">
          <div className="flex items-center gap-6 text-sm">
            <Link className="rounded-md px-2 py-1 text-muted-foreground hover:text-black" href="/staff/dashboard">
              Timeline
            </Link>

            <Link className="rounded-md px-2 py-1 text-muted-foreground hover:text-black" href="/staff/dashboard/tables">
              Tables
            </Link>

            <Link
              className="rounded-md px-2 py-1 text-muted-foreground hover:text-black"
              href="/staff/dashboard/settings/hours"
            >
              Hours
            </Link>

            {/* ✅ FIX: Settings must go to /settings (NOT /settings/restaurant) */}
            <Link
              className="rounded-md px-2 py-1 text-muted-foreground hover:text-black"
              href="/staff/dashboard/settings"
            >
              Settings
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
