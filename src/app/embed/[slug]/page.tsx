import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    select: { name: true, slug: true },
  });

  if (!restaurant) {
    return null;
  }

  return (
    <main className="p-0">
      <a
        href={`/book/${restaurant.slug}`}
        className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Book {restaurant.name}
      </a>
    </main>
  );
}
