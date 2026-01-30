import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import CreateRestaurantModal from "./create-restaurant-modal";
import TimelineView from "./timeline-view";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/staff");

  // 1. Fetch Basic User Data
  const membership = await prisma.membership.findFirst({
    where: { user: { email: session.user.email } },
    include: { 
      restaurant: {
        include: { locations: true }
      } 
    }
  });

  if (!membership?.restaurant) {
    return <CreateRestaurantModal />;
  }

  // 2. Fetch Bookings for TODAY
  // (For this prototype, we fetch all. Later we filter by date)
  const bookings = await prisma.booking.findMany({
    where: { 
      restaurantId: membership.restaurant.id 
    },
    include: {
      bookingTables: {
        include: {
          table: true // We need the table to know the location!
        }
      }
    }
  });

  // Transform data to make it easier for the frontend
  const cleanBookings = bookings.map(b => ({
    id: b.id,
    time: b.time,
    guests: b.guests,
    customerName: b.customerName,
    // Flatten the tables array so we can filter easily
    tables: b.bookingTables.map(bt => ({
      id: bt.table.id,
      name: bt.table.name,
      locationId: bt.table.locationId
    }))
  }));

  return (
    <TimelineView 
      locations={membership.restaurant.locations} 
      bookings={cleanBookings} 
    />
  );
}