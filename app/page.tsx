"use client";

import { useAppDataStore } from "@/lib/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Anchor, FileJson, Ship, Map, UtensilsCrossed, Settings } from "lucide-react";
import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function Home() {
  const { data } = useAppDataStore();
  const { t } = useT();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md m-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Anchor className="h-8 w-8" />
              <CardTitle className="text-2xl">{t("dashboard.welcomeTitle")}</CardTitle>
            </div>
            <CardDescription>
              {t("dashboard.welcomeDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileJson className="h-4 w-4" />
              <span>{t("dashboard.welcomeHint")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sections = [
    {
      title: t("dashboard.shipInformation"),
      description: t("dashboard.shipInformationDesc"),
      icon: Ship,
      href: "/ship/about",
      stats: [
        { label: t("dashboard.statCabins"), value: data.data.cabins.length },
        { label: t("dashboard.statChecklistCategories"), value: data.data.checklists.length },
        { label: t("dashboard.statFaqQuestions"), value: data.data.questions.length },
      ],
    },
    {
      title: t("dashboard.mapsLocations"),
      description: t("dashboard.mapsLocationsDesc"),
      icon: Map,
      href: "/maps/cities",
      stats: [
        { label: t("dashboard.statCities"), value: data.data.cities.length },
        { label: t("dashboard.statPOI"), value: data.data.points.length },
      ],
    },
    {
      title: t("dashboard.recipes"),
      description: t("dashboard.recipesDesc"),
      icon: UtensilsCrossed,
      href: "/recipes/recipes",
      stats: [
        { label: t("dashboard.statTotalRecipes"), value: data.data.recipes.length },
        { label: t("dashboard.statFavorites"), value: data.data.recipes.filter((r) => r.isFavorite).length },
      ],
    },
    {
      title: t("dashboard.generalSettings"),
      description: t("dashboard.generalSettingsDesc"),
      icon: Settings,
      href: "/general",
      stats: [
        { label: t("dashboard.statShip"), value: data.shipName },
        { label: t("dashboard.statVersion"), value: data.version },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard.subtitle", { shipName: data.shipName })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className="h-6 w-6" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.stats.map((stat) => (
                    <div key={stat.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{stat.label}:</span>
                      <span className="font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
