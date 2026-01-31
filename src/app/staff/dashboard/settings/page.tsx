"use client";

import * as React from "react";
import { Button, Input, Badge } from "@/components/ui-primitives";

export default function SettingsPage() {
  const [restaurantName, setRestaurantName] = React.useState("Argo");
  const [publicPhone, setPublicPhone] = React.useState("");
  const [publicEmail, setPublicEmail] = React.useState("");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Update basic restaurant info.
          </p>
        </div>
        <Badge>Staff</Badge>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Restaurant name</label>
            <Input
              value={restaurantName}
              onChange={(e: any) => setRestaurantName(e.target.value)}
              placeholder="Argo"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Public phone</label>
            <Input
              value={publicPhone}
              onChange={(e: any) => setPublicPhone(e.target.value)}
              placeholder="+31 …"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium">Public email</label>
            <Input
              value={publicEmail}
              onChange={(e: any) => setPublicEmail(e.target.value)}
              placeholder="hello@…"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => alert("Saved (demo)!")}>Save changes</Button>
          <Button variant="outline" onClick={() => alert("Canceled (demo)!")}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
