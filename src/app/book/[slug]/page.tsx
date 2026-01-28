import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicBookingPage({ params }: Props) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true, timezone: true },
  });

  if (!restaurant) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Restaurant not found</h1>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Book a table</h1>
      <p className="mt-2 text-sm text-zinc-600">{restaurant.name}</p>
    </main>
  );
}
