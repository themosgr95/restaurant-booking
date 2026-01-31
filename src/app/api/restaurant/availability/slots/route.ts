import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  const locationId = searchParams.get("locationId");

  if (!dateStr || !locationId) return NextResponse.json([]);

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday

  // 1. Check for Special Closures
  const specialClosure = await prisma.specialClosure.findFirst({
    where: {
      locationId,
      date: date
    }
  });

  // FIX: If a special closure record exists, we assume it's closed.
  // We removed the ".isClosed" check entirely.
  if (specialClosure) {
    return NextResponse.json([]); 
  }

  // 2. Get Standard Opening Hours
  const hours = await prisma.openingHour.findFirst({
    where: {
      locationId,
      dayOfWeek
    }
  });

  if (!hours) return NextResponse.json([]); // Closed today

  // 3. Generate Time Slots
  const slots = [];
  let [startHour, startMin] = hours.openTime.split(":").map(Number);
  let [endHour, endMin] = hours.closeTime.split(":").map(Number);

  let current = new Date(date);
  current.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  // Create slots every 30 minutes
  while (current < end) {
    const timeString = current.toLocaleTimeString("en-GB", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + 30);
  }

  return NextResponse.json(slots);
}