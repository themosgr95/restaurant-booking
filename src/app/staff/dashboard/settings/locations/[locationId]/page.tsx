import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export default async function LocationSettingsPage({
  params,
}: {
  params: { locationId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { locationId } = params;

  // Must be a member of this location
  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    redirect("/staff/dashboard/settings");
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    include: {
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      specialRules: { orderBy: { startDate: "asc" } },
    },
  });

  if (!location) {
    redirect("/staff/dashboard/settings");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{location.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is read-only. Weekly hours & special rules are managed from the main <span className="font-medium">Hours</span> tab.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-muted/30 p-4">
            <dt className="text-sm font-medium">Turnover time</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{location.turnoverTime} minutes</dd>
          </div>

          <div className="rounded-2xl bg-muted/30 p-4">
            <dt className="text-sm font-medium">Weekly hours rows</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{location.openingHours.length}</dd>
          </div>

          <div className="rounded-2xl bg-muted/30 p-4">
            <dt className="text-sm font-medium">Special rules</dt>
            <dd className="mt-1 text-sm text-muted-foreground">{location.specialRules.length}</dd>
          </div>
        </dl>

        <div className="mt-6 text-sm text-muted-foreground">
          <div className="font-medium text-foreground">Debug info</div>
          <div className="mt-1">Location ID: {location.id}</div>
          <div>Slug: {location.slug}</div>
        </div>
      </div>
    </div>
  );
}
