import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";

export default async function LocationSettingsPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const { locationId } = await params;

  // must be member
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
      openingHours: true,
      // ✅ renamed model relation
      specialRules: {
        orderBy: { startDate: "asc" },
      },
    },
  });

  if (!location) {
    redirect("/staff/dashboard/settings");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">{location.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This page is currently a placeholder. Your Hours tab and Special rules are managed in the main Hours page.
      </p>

      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm">
        <div className="text-sm">
          <div className="font-medium">Turnover time</div>
          <div className="text-muted-foreground">{location.turnoverTime} minutes</div>
        </div>

        <div className="mt-4 text-sm">
          <div className="font-medium">Weekly hours rows</div>
          <div className="text-muted-foreground">{location.openingHours.length}</div>
        </div>

        <div className="mt-4 text-sm">
          <div className="font-medium">Special rules</div>
          <div className="text-muted-foreground">{location.specialRules.length}</div>
        </div>
      </div>
    </div>
  );
}
