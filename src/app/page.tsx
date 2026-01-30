import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui-primitives";
import { LayoutDashboard, CalendarClock, Users } from "lucide-react"; // Ensure lucide-react is installed

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-100 px-6 lg:px-8">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white text-xs">A</div>
          <span>Argo</span>
        </div>
        <div className="flex gap-4">
          <Link href="/staff">
            <Button variant="ghost" className="text-slate-600">Log in</Button>
          </Link>
          <Button>Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 py-24 text-center lg:py-32">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900">
            Reservations, <br className="hidden sm:block" />
            <span className="text-slate-400">simplified.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600">
            The fastest way to manage bookings, tables, and guest relationships.
            No clunky software, just pure efficiency.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Start for free</Button>
            <Button size="lg" variant="outline">Book a demo</Button>
          </div>
        </section>

        {/* Features */}
        <section className="bg-slate-50 py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard 
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Staff Dashboard"
                desc="Manage your floor plan and incoming reservations in real-time."
              />
              <FeatureCard 
                icon={<CalendarClock className="h-5 w-5" />}
                title="Smart Scheduling"
                desc="Prevent double-bookings with our intelligent time-slot engine."
              />
              <FeatureCard 
                icon={<Users className="h-5 w-5" />}
                title="Guest CRM"
                desc="Remember VIPs, allergies, and special requests automatically."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-12 text-center text-sm text-slate-500">
        <p>&copy; 2026 Argo Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
          {icon}
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-600 leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}