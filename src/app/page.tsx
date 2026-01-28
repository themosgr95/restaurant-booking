import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            BookingSaaS
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="#features"
              className="rounded-lg px-3 py-2 text-sm hover:bg-neutral-100"
            >
              Features
            </Link>
            <Link
              href="#how"
              className="rounded-lg px-3 py-2 text-sm hover:bg-neutral-100"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="rounded-lg px-3 py-2 text-sm hover:bg-neutral-100"
            >
              Pricing
            </Link>
            <Link
              href="/staff"
              className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800"
            >
              Staff Login
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Live on Hostinger • Next.js + Prisma + MySQL
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Online restaurant bookings, without the chaos.
            </h1>

            <p className="mt-4 max-w-prose text-base leading-relaxed text-neutral-600">
              Give each restaurant a beautiful booking page, a staff dashboard,
              and an embeddable widget — powered by your own SaaS.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/staff"
                className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Open staff dashboard
              </Link>

              <Link
                href="#features"
                className="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium hover:bg-neutral-50"
              >
                See features
              </Link>
            </div>

            <div className="mt-6 grid max-w-lg grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-xl font-semibold">SaaS</div>
                <div className="text-xs text-neutral-500">multi-tenant</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-xl font-semibold">Embed</div>
                <div className="text-xs text-neutral-500">on any site</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="text-xl font-semibold">Roles</div>
                <div className="text-xs text-neutral-500">owner/staff</div>
              </div>
            </div>
          </div>

          {/* Mock preview */}
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Booking Page Preview</div>
                  <div className="text-xs text-neutral-500">
                    /book/[slug] • /embed/[slug]
                  </div>
                </div>
                <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs">
                  demo
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Party size</div>
                  <div className="mt-1 text-sm font-medium">2 guests</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Date</div>
                  <div className="mt-1 text-sm font-medium">Friday</div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="text-xs text-neutral-500">Time</div>
                  <div className="mt-1 text-sm font-medium">19:30</div>
                </div>
                <button
                  type="button"
                  className="mt-1 rounded-xl bg-neutral-900 px-4 py-3 text-sm font-medium text-white"
                >
                  Confirm booking
                </button>
                <p className="text-xs text-neutral-500">
                  (This is just a pretty preview — we’ll wire real availability next.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">What it includes</h2>
          <p className="mt-2 max-w-prose text-neutral-600">
            The basics you need for a real booking product — and space to grow.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <FeatureCard
              title="Public booking page"
              desc="A clean page per restaurant: /book/[slug]."
            />
            <FeatureCard
              title="Embeddable widget"
              desc="Drop bookings into any website: /embed/[slug]."
            />
            <FeatureCard
              title="Staff dashboard"
              desc="Manage bookings, tables, and settings inside /staff."
            />
            <FeatureCard
              title="Role-based access"
              desc="Owner, manager, staff — with NextAuth credentials."
            />
            <FeatureCard
              title="Prisma + MySQL"
              desc="Fast, reliable data model on Hostinger MySQL."
            />
            <FeatureCard
              title="Multi-restaurant ready"
              desc="Designed for SaaS: memberships per restaurant."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-neutral-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            <StepCard
              step="1"
              title="Restaurant setup"
              desc="Create a restaurant + owner membership."
            />
            <StepCard
              step="2"
              title="Open bookings"
              desc="Guests book via /book/[slug] or embedded widget."
            />
            <StepCard
              step="3"
              title="Staff manages it"
              desc="Confirm, cancel, and view schedule in /staff."
            />
          </ol>
        </div>
      </section>

      {/* Pricing (placeholder) */}
      <section id="pricing" className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Pricing</h2>
          <p className="mt-2 max-w-prose text-neutral-600">
            We’ll plug real plans later. For now: simple, clean placeholder.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <PricingCard
              title="Starter"
              price="€19/mo"
              items={["1 location", "Basic bookings", "Email support"]}
            />
            <PricingCard
              title="Pro"
              price="€49/mo"
              highlight
              items={["Multiple locations", "Embed widget", "Staff roles"]}
            />
            <PricingCard
              title="Scale"
              price="Custom"
              items={["Multi-venue", "Custom features", "Priority support"]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-10 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} BookingSaaS
          </p>
          <div className="flex gap-2">
            <Link
              href="/staff"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Staff
            </Link>
            <Link
              href="#features"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Features
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-neutral-600">{desc}</div>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <li className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white">
          {step}
        </span>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="mt-3 text-sm text-neutral-600">{desc}</div>
    </li>
  );
}

function PricingCard({
  title,
  price,
  items,
  highlight = false,
}: {
  title: string;
  price: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white p-6 shadow-sm",
        highlight ? "border-neutral-900" : "border-neutral-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {price}
          </div>
        </div>
        {highlight ? (
          <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
            Popular
          </span>
        ) : null}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-neutral-600">
        {items.map((it) => (
          <li key={it} className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-900" />
            {it}
          </li>
        ))}
      </ul>

      <Link
        href="/staff"
        className={[
          "mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium",
          highlight
            ? "bg-neutral-900 text-white hover:bg-neutral-800"
            : "border border-neutral-200 hover:bg-neutral-50",
        ].join(" ")}
      >
        Get started
      </Link>
    </div>
  );
}
