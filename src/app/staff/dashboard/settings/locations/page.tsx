import { redirect } from "next/navigation";

export default function LocationsRedirect() {
  redirect("/staff/dashboard/settings");
}
