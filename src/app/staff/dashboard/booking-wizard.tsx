function getBookingTimeLabel(b: any) {
  // 1) If your DB stores a plain string like "18:30"
  if (typeof b?.time === "string" && b.time.trim()) return b.time;

  // 2) If your DB stores a DateTime like startAt
  const startAt = b?.startAt ?? b?.start_time ?? b?.startTime;
  if (startAt) {
    const d = new Date(startAt);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  }

  // 3) If you store date + time separately (date might be "2026-01-30")
  if (b?.date && b?.time) return `${b.time}`;

  return "—";
}
