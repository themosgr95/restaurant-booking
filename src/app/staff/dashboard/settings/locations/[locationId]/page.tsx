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

  const membership = await prisma.membership.findFirst({
    where: { locationId, user: { email: session.user.email } },
    select: { id: true },
  });

  if (!membership) {
    redirect("/staff/dashboard/settings");
  }

  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: {
      id: true,
      name: true,
      slug: true,
      turnoverTime: true,
      createdAt: true,
    },
  });

  if (!location) {
    redirect("/staff/dashboard/settings");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-black text-gray-900">{location.name}</h1>
      <p className="mt-2 text-sm text-gray-500">
        This page is a simple “details” screen for now. Hours are managed in the <b>Hours</b> tab.
      </p>

      <div className="mt-6 rounded-3xl border bg-white p-6 shadow-sm space-y-4">
        <div className="text-sm">
          <div className="font-bold text-gray-900">Turnover time</div>
          <div className="text-gray-500">{location.turnoverTime} minutes</div>
        </div>

        <div className="text-sm">
          <div className="font-bold text-gray-900">Public slug</div>
          <div className="text-gray-500">{location.slug}</div>
        </div>

        <div className="text-sm">
          <div className="font-bold text-gray-900">Created</div>
          <div className="text-gray-500">{location.createdAt.toISOString()}</div>
        </div>
      </div>
    </div>
  );
}
