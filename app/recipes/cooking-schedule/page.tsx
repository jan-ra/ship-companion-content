"use client";

import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function CookingSchedulePage() {
  const { data } = useAppDataStore();
  const { t } = useT();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t("common.noDataLoaded")}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("cookingSchedule.title")}</h1>
        <p className="text-muted-foreground">
          {t("cookingSchedule.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("cookingSchedule.plannerTitle")}
          </CardTitle>
          <CardDescription>{t("cookingSchedule.plannerDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t("cookingSchedule.notImplemented")}</p>
            <p>{t("cookingSchedule.futureText")}</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>{t("cookingSchedule.feature1")}</li>
              <li>{t("cookingSchedule.feature2")}</li>
              <li>{t("cookingSchedule.feature3")}</li>
              <li>{t("cookingSchedule.feature4")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
