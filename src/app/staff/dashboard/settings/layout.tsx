import Link from "next/link";
import { ReactNode } from "react";
import SignOutBtn from "../sign-out-btn";

type Props = { children: ReactNode };

const nav = [
  { label: "Timeline", href: "/staff/dashboard" }, // ✅ important!
  { label: "Tables", href: "/staff/dashboard/tables" },
  { label: "Hours", href: "/staff/dashboard/settings/hours" },
  { label: "Settings", href: "/staff/dashboard/settings" },
];

export default function DashboardLayout({ children }: Props) {
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
            <a className="text-blue-600 hover:underline" href="/book/argo">
              View Booking Page ↗
            </a>
            <SignOutBtn />
          </div>
        </div>

        <nav className="mx-auto max-w-6xl px-6 pb-3">
          <div className="flex items-center gap-6 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1 text-muted-foreground hover:text-black"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
