"use client";

import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CookingSchedulePage() {
  const { data } = useAppDataStore();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No data loaded</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Cooking Schedule</h1>
        <p className="text-muted-foreground">
          Plan and schedule meals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cooking Schedule Planner
          </CardTitle>
          <CardDescription>Coming soon - Meal scheduling system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>This feature is not yet implemented in the data schema.</p>
            <p>Future functionality might include:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Weekly meal planning</li>
              <li>Recipe assignment to days</li>
              <li>Shopping list generation</li>
              <li>Meal rotation suggestions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
